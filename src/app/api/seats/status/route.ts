import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanExpiredHolds } from '@/lib/server-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busId = searchParams.get('busId');
    const tripId = searchParams.get('tripId');
    const bookingSessionId = searchParams.get('bookingSessionId') || '';

    // 1. Eagerly purge all expired holds
    await cleanExpiredHolds();

    const now = Date.now();

    // 2. Fetch seats (either for a specific bus or all active buses in trip)
    const seats = await db.busSeat.findMany({
      where: {
        ...(busId ? { busId } : {}),
        ...(tripId
          ? {
              bus: {
                OR: [
                  { tripId },
                  { trip: { is: { slug: tripId } } },
                ],
              },
            }
          : {}),
      },
      include: {
        seatHold: {
          where: { status: 'ACTIVE' },
        },
        seatBooking: {
          include: {
            traveller: {
              select: { fullName: true },
            },
            booking: {
              select: { bookingId: true },
            },
          },
        },
      },
      orderBy: [{ busId: 'asc' }, { rowNumber: 'asc' }, { seatNumber: 'asc' }],
    });

    const formattedSeats = seats.map((seat) => {
      let status = seat.status;
      let heldSecondsRemaining = 0;
      let isMyHold = false;

      if (seat.seatHold && seat.seatHold.status === 'ACTIVE') {
        const expiresAtMs = new Date(seat.seatHold.expiresAt).getTime();
        heldSecondsRemaining = Math.max(0, Math.floor((expiresAtMs - now) / 1000));

        if (heldSecondsRemaining > 0) {
          if (bookingSessionId && seat.seatHold.bookingSessionId === bookingSessionId) {
            status = 'SELECTED';
            isMyHold = true;
          } else {
            status = 'HELD';
          }
        } else {
          status = 'AVAILABLE';
        }
      }

      return {
        id: seat.id,
        busId: seat.busId,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType as 'DRIVER' | 'CONDUCTOR' | 'PASSENGER',
        rowNumber: seat.rowNumber,
        side: seat.side as 'LEFT' | 'RIGHT' | 'REAR' | 'FRONT',
        position: seat.position as 'WINDOW' | 'AISLE' | 'REAR' | 'CABIN',
        isBookable: seat.isBookable,
        status,
        isAvailable: status === 'AVAILABLE' || status === 'SELECTED',
        heldSecondsRemaining,
        isMyHold,
        bookedDetails: seat.seatBooking
          ? {
              travellerName: seat.seatBooking.traveller?.fullName || 'Confirmed Passenger',
              bookingId: seat.seatBooking.booking?.bookingId || '',
            }
          : null,
      };
    });

    const [confirmedCount, trip] = await Promise.all([
      db.seatBooking.count({ where: { status: 'CONFIRMED' } }),
      db.trip.findFirst({ select: { capacity: true } }),
    ]);

    const capacityLimit = trip?.capacity ?? 75;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      capacityLimit,
      confirmedCount,
      remainingSeats: Math.max(0, capacityLimit - confirmedCount),
      seats: formattedSeats,
    });
  } catch (error: unknown) {
    console.error('Error fetching seat status:', error);
    const message = error instanceof Error ? error.message : 'Failed to retrieve seat status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
