export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      action, // RESERVE, RELEASE, MARK_UNAVAILABLE, MARK_AVAILABLE, CHANGE_SEAT, MOVE_BUS
      busId,
      seatNumber,
      targetBusId,
      targetSeatNumber,
      travellerId,
      reason,
    } = body;

    if (!action || !busId || !seatNumber) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const currentSeat = await db.busSeat.findUnique({
      where: {
        busId_seatNumber: { busId, seatNumber },
      },
      include: {
        seatBooking: {
          include: { traveller: true, booking: true },
        },
        seatHold: true,
      },
    });

    if (!currentSeat) {
      return NextResponse.json({ error: `Seat ${seatNumber} not found on bus` }, { status: 404 });
    }

    const performedBy = `Admin: ${admin.name} (${admin.email})`;

    // Action 1: MARK_UNAVAILABLE
    if (action === 'MARK_UNAVAILABLE') {
      await db.busSeat.update({
        where: { id: currentSeat.id },
        data: { status: 'UNAVAILABLE', isAvailable: false },
      });

      await createAuditLog({
        action: 'ADMIN_SEAT_UNAVAILABLE',
        entityType: 'SEAT',
        entityId: currentSeat.id,
        performedBy,
        busId,
        seatNumber,
        oldValue: currentSeat.status,
        newValue: 'UNAVAILABLE',
        metadata: { reason },
      });

      return NextResponse.json({ success: true, message: `Seat ${seatNumber} marked unavailable` });
    }

    // Action 2: MARK_AVAILABLE
    if (action === 'MARK_AVAILABLE') {
      await db.$transaction([
        db.busSeat.update({
          where: { id: currentSeat.id },
          data: { status: 'AVAILABLE', isAvailable: true },
        }),
        db.seatHold.deleteMany({ where: { busSeatId: currentSeat.id } }),
        db.seatBooking.deleteMany({ where: { busSeatId: currentSeat.id } }),
      ]);

      await createAuditLog({
        action: 'ADMIN_SEAT_AVAILABLE',
        entityType: 'SEAT',
        entityId: currentSeat.id,
        performedBy,
        busId,
        seatNumber,
        oldValue: currentSeat.status,
        newValue: 'AVAILABLE',
        metadata: { reason },
      });

      return NextResponse.json({ success: true, message: `Seat ${seatNumber} marked available` });
    }

    // Action 3: RESERVE
    if (action === 'RESERVE') {
      await db.busSeat.update({
        where: { id: currentSeat.id },
        data: { status: 'BOOKED', isAvailable: false },
      });

      await createAuditLog({
        action: 'ADMIN_RESERVE_SEAT',
        entityType: 'SEAT',
        entityId: currentSeat.id,
        performedBy,
        busId,
        seatNumber,
        oldValue: currentSeat.status,
        newValue: 'BOOKED (Admin Reservation)',
        metadata: { reason },
      });

      return NextResponse.json({ success: true, message: `Seat ${seatNumber} reserved by admin` });
    }

    // Action 4: RELEASE
    if (action === 'RELEASE') {
      await db.$transaction([
        db.busSeat.update({
          where: { id: currentSeat.id },
          data: { status: 'AVAILABLE', isAvailable: true },
        }),
        db.seatHold.deleteMany({ where: { busSeatId: currentSeat.id } }),
        db.seatBooking.deleteMany({ where: { busSeatId: currentSeat.id } }),
      ]);

      await createAuditLog({
        action: 'ADMIN_RELEASE_SEAT',
        entityType: 'SEAT',
        entityId: currentSeat.id,
        performedBy,
        busId,
        seatNumber,
        oldValue: currentSeat.status,
        newValue: 'AVAILABLE',
        metadata: { reason },
      });

      return NextResponse.json({ success: true, message: `Seat ${seatNumber} released by admin` });
    }

    // Action 5: CHANGE_SEAT or MOVE_BUS
    if (action === 'CHANGE_SEAT' || action === 'MOVE_BUS') {
      const destBusId = targetBusId || busId;
      const destSeatNumber = targetSeatNumber;

      if (!destSeatNumber) {
        return NextResponse.json({ error: 'Target seat number is required' }, { status: 400 });
      }

      const destSeat = await db.busSeat.findUnique({
        where: {
          busId_seatNumber: { busId: destBusId, seatNumber: destSeatNumber },
        },
        include: { seatBooking: true, seatHold: true },
      });

      if (!destSeat) {
        return NextResponse.json({ error: `Target seat ${destSeatNumber} not found` }, { status: 404 });
      }

      if (destSeat.status === 'BOOKED' || destSeat.seatBooking) {
        return NextResponse.json({ error: `Target seat ${destSeatNumber} is already booked` }, { status: 409 });
      }

      // Find the booking/traveller attached to current seat
      const currentBooking = currentSeat.seatBooking;
      if (!currentBooking) {
        return NextResponse.json({ error: `No active booking found on seat ${seatNumber}` }, { status: 400 });
      }

      const targetTravellerId = travellerId || currentBooking.travellerId;

      await db.$transaction(async (tx) => {
        // 1. Free current seat
        await tx.busSeat.update({
          where: { id: currentSeat.id },
          data: { status: 'AVAILABLE', isAvailable: true },
        });

        await tx.seatBooking.deleteMany({
          where: { busSeatId: currentSeat.id },
        });

        // 2. Occupy destination seat
        await tx.busSeat.update({
          where: { id: destSeat.id },
          data: { status: 'BOOKED', isAvailable: false },
        });

        await tx.seatBooking.upsert({
          where: { busSeatId: destSeat.id },
          update: {
            bookingId: currentBooking.bookingId,
            travellerId: targetTravellerId,
            status: 'CONFIRMED',
          },
          create: {
            busSeatId: destSeat.id,
            bookingId: currentBooking.bookingId,
            travellerId: targetTravellerId,
            status: 'CONFIRMED',
          },
        });

        // 3. Update traveller record
        if (targetTravellerId) {
          const destBus = await tx.bus.findUnique({ where: { id: destBusId } });
          await tx.traveller.update({
            where: { id: targetTravellerId },
            data: {
              assignedSeatNumber: destSeatNumber,
              assignedBusNumber: destBus?.busNumber || 'Bus 01',
            },
          });
        }

        // 4. Update booking busId if bus changed
        if (destBusId !== busId) {
          await tx.booking.update({
            where: { id: currentBooking.bookingId },
            data: { busId: destBusId },
          });
        }

        // 5. Create audit log
        await createAuditLog({
          action: action === 'MOVE_BUS' ? 'ADMIN_BUS_MOVE' : 'ADMIN_SEAT_CHANGE',
          entityType: 'SEAT',
          entityId: currentSeat.id,
          performedBy,
          bookingId: currentBooking.bookingId,
          busId: destBusId,
          seatNumber: destSeatNumber,
          oldValue: `Bus: ${busId}, Seat: ${seatNumber}`,
          newValue: `Bus: ${destBusId}, Seat: ${destSeatNumber}`,
          metadata: { reason, travellerId: targetTravellerId },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully moved traveller from ${seatNumber} to ${destSeatNumber}`,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Error in seat override:', error);
    const message = error instanceof Error ? error.message : 'Seat override failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
