import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateHoldExpiration } from '@/lib/bus-seating';
import { cleanExpiredHolds, createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { busId, seatNumbers, bookingSessionId, travellerName } = body;

    if (!busId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return NextResponse.json({ error: 'Bus ID and seat numbers are required' }, { status: 400 });
    }

    if (!bookingSessionId) {
      return NextResponse.json({ error: 'Booking session ID is required' }, { status: 400 });
    }

    // 1. Auto-purge expired holds before checking availability
    await cleanExpiredHolds();

    const now = new Date();
    // Enforce an atomic 10-minute hold
    const expiresAt = calculateHoldExpiration(10); // 10 minutes from now

    // 2. Perform atomic transaction
    const result = await db.$transaction(async (tx) => {
      // Fetch bus to get tripId
      const bus = await tx.bus.findUnique({
        where: { id: busId },
        select: { id: true, tripId: true },
      });

      if (!bus) {
        throw new Error('Bus not found');
      }

      // Fetch all requested seats
      const seats = await tx.busSeat.findMany({
        where: {
          busId,
          seatNumber: { in: seatNumbers },
        },
        include: {
          seatHold: true,
          seatBooking: true,
        },
      });

      if (seats.length !== seatNumbers.length) {
        throw new Error('One or more selected seats do not exist on this bus');
      }

      for (const seat of seats) {
        if (!seat.isBookable) {
          throw new Error(`Seat ${seat.seatNumber} is not a bookable passenger seat`);
        }

        if (seat.status === 'BOOKED' || seat.seatBooking) {
          throw new Error(`Sorry, seat ${seat.seatNumber} was just booked by another student.`);
        }

        // If seat has an active hold by another user, reject
        if (seat.seatHold && seat.seatHold.status === 'ACTIVE' && seat.seatHold.expiresAt > now) {
          if (seat.seatHold.bookingSessionId !== bookingSessionId) {
            throw new Error(`Seat ${seat.seatNumber} is currently held by another student`);
          }
          // If the same user requests the same seat, lease will be refreshed below
        }
      }

      // Release any previous seats held by this session on this bus that are not in the new selection
      const previousHolds = await tx.seatHold.findMany({
        where: {
          bookingSessionId,
          status: 'ACTIVE',
          busSeat: { busId },
        },
        include: { busSeat: true },
      });

      for (const prevHold of previousHolds) {
        if (!seatNumbers.includes(prevHold.busSeat.seatNumber)) {
          await tx.seatHold.update({
            where: { id: prevHold.id },
            data: { status: 'RELEASED' },
          });
          await tx.busSeat.update({
            where: { id: prevHold.busSeatId },
            data: { status: 'AVAILABLE', isAvailable: true },
          });
        }
      }

      // Now create or update holds for all requested seats (refreshes 10-minute lease for same user)
      for (const seat of seats) {
        await tx.seatHold.upsert({
          where: { busSeatId: seat.id },
          update: {
            tripId: bus.tripId,
            busId: bus.id,
            seatId: seat.id,
            bookingSessionId,
            travellerName: travellerName || 'Traveller',
            heldAt: now,
            expiresAt,
            status: 'ACTIVE',
          },
          create: {
            tripId: bus.tripId,
            busId: bus.id,
            seatId: seat.id,
            busSeatId: seat.id,
            bookingSessionId,
            travellerName: travellerName || 'Traveller',
            heldAt: now,
            expiresAt,
            status: 'ACTIVE',
          },
        });

        await tx.busSeat.update({
          where: { id: seat.id },
          data: { status: 'HELD', isAvailable: false },
        });
      }

      return {
        busId,
        seatNumbers,
        seats,
        expiresAt: expiresAt.toISOString(),
        heldSecondsRemaining: 600,
      };
    }, { timeout: 15000, maxWait: 10000 });

    // Create audit logs asynchronously outside the transaction
    for (const seat of result.seats) {
      createAuditLog({
        action: 'SEAT_HELD',
        entityType: 'SEAT',
        entityId: seat.id,
        performedBy: travellerName ? `Traveller: ${travellerName}` : `Session: ${bookingSessionId}`,
        seatNumber: seat.seatNumber,
        busId,
        newValue: `Held until ${expiresAt.toISOString()}`,
      }).catch((e) => console.error('Audit log error:', e));
    }

    return NextResponse.json({
      success: true,
      message: `Held ${seatNumbers.join(', ')} for 10 minutes`,
      busId: result.busId,
      seatNumbers: result.seatNumbers,
      expiresAt: result.expiresAt,
      heldSecondsRemaining: result.heldSecondsRemaining,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to hold seat';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
