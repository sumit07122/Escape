export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanExpiredHolds } from '@/lib/server-utils';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: busId } = await params;
    const { searchParams } = new URL(request.url);
    const bookingSessionId = searchParams.get('bookingSessionId') || '';

    // 1. Clean expired holds
    await cleanExpiredHolds();

    // 2. Fetch the bus
    const bus = await db.bus.findUnique({
      where: { id: busId },
      include: {
        seats: {
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
          orderBy: [{ rowNumber: 'asc' }, { seatNumber: 'asc' }],
        },
      },
    });

    if (!bus) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    const now = Date.now();

    const formattedSeats = bus.seats.map((seat) => {
      let status = seat.status;
      let heldSecondsRemaining = 0;
      let isMyHold = false;

      // Handle active holds
      if (seat.seatHold && seat.seatHold.status === 'ACTIVE') {
        const expiresAtMs = new Date(seat.seatHold.expiresAt).getTime();
        heldSecondsRemaining = Math.max(0, Math.floor((expiresAtMs - now) / 1000));

        if (heldSecondsRemaining > 0) {
          if (bookingSessionId && seat.seatHold.bookingSessionId === bookingSessionId) {
            status = 'SELECTED'; // Selected by current user
            isMyHold = true;
          } else {
            status = 'HELD'; // Held by another user
          }
        } else {
          status = 'AVAILABLE';
        }
      }

      return {
        id: seat.id,
        busId: seat.busId,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        rowNumber: seat.rowNumber,
        side: seat.side,
        position: seat.position,
        isBookable: seat.isBookable,
        isAvailable: status === 'AVAILABLE' || status === 'SELECTED',
        status,
        heldSecondsRemaining,
        isMyHold,
        bookedDetails: seat.seatBooking
          ? {
              travellerName: seat.seatBooking.traveller?.fullName
                ? `${seat.seatBooking.traveller.fullName.slice(0, 3)}***`
                : 'Booked',
              bookingId: seat.seatBooking.booking.bookingId,
            }
          : null,
      };
    });

    const passengerSeats = formattedSeats.filter((s) => s.isBookable);
    const bookedCount = passengerSeats.filter((s) => s.status === 'BOOKED').length;
    const heldCount = passengerSeats.filter((s) => s.status === 'HELD' || s.status === 'SELECTED').length;
    const availableCount = passengerSeats.filter((s) => s.status === 'AVAILABLE').length;

    return NextResponse.json({
      bus: {
        id: bus.id,
        busNumber: bus.busNumber,
        vehicleName: bus.vehicleName,
        vehicleNumber: bus.vehicleNumber,
        physicalCapacity: bus.physicalCapacity,
        passengerCapacity: bus.passengerCapacity,
        driverName: bus.driverName,
        conductorName: bus.conductorName,
        driverPhone: bus.driverPhone,
        conductorPhone: bus.conductorPhone,
        status: bus.status,
      },
      stats: {
        totalPassengerSeats: passengerSeats.length,
        bookedCount,
        heldCount,
        availableCount,
      },
      seats: formattedSeats,
    });
  } catch (error) {
    console.error('Error fetching bus seats:', error);
    return NextResponse.json({ error: 'Failed to fetch bus seats' }, { status: 500 });
  }
}
