export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch all available passenger seats across all buses
    const availableSeats = await db.busSeat.findMany({
      where: {
        isBookable: true,
        status: 'AVAILABLE',
        seatType: 'PASSENGER',
      },
      include: {
        bus: {
          select: { id: true, busNumber: true, vehicleName: true },
        },
      },
      orderBy: [
        { bus: { orderIndex: 'asc' } },
        { rowNumber: 'asc' },
        { seatNumber: 'asc' },
      ],
    });

    // 2. Fetch unassigned confirmed travellers
    const unassignedTravellers = await db.traveller.findMany({
      where: {
        booking: { bookingStatus: 'CONFIRMED' },
        OR: [
          { seatBooking: null },
          { assignedSeatNumber: null },
        ],
      },
      include: {
        booking: { select: { bookingId: true, primaryTravellerName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      availableSeats: availableSeats.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        busId: s.busId,
        busNumber: s.bus.busNumber,
        vehicleName: s.bus.vehicleName,
        position: s.position,
        side: s.side,
        rowNumber: s.rowNumber,
        label: `${s.bus.busNumber} — Seat ${s.seatNumber} (${s.position})`,
      })),
      unassignedTravellers: unassignedTravellers.map((t) => ({
        id: t.id,
        fullName: t.fullName,
        phone: t.phone,
        email: t.email,
        collegeId: t.collegeId || t.rollNumber || null,
        rollNumber: t.rollNumber || t.collegeId || null,
        bookingId: t.booking.bookingId,
      })),
    });
  } catch (error) {
    console.error('Error in GET /api/admin/seats:', error);
    return NextResponse.json({ error: 'Failed to fetch seats metadata' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { seatId, action, status, newSeatNumber, busId, travellerId, isBookable, targetSeatId } = body;

    // Handle status shorthand (e.g. status: "BLOCKED" | "AVAILABLE")
    if (!action && status) {
      if (status === 'BLOCKED' || status === 'UNAVAILABLE') action = 'LOCK';
      else if (status === 'AVAILABLE') action = 'UNLOCK';
    }

    // Handle newSeatNumber / busId reassignment shorthand
    if (newSeatNumber) {
      const targetSeat = await db.busSeat.findFirst({
        where: {
          seatNumber: newSeatNumber,
          ...(busId ? { busId } : {}),
        },
      });
      if (targetSeat) {
        targetSeatId = targetSeat.id;
        action = 'REASSIGN';
      }
    }

    if (!seatId || !action) {
      return NextResponse.json({ error: 'seatId and action or status are required' }, { status: 400 });
    }

    const currentSeat = await db.busSeat.findUnique({
      where: { id: seatId },
      include: {
        bus: true,
        seatBooking: {
          include: {
            traveller: true,
            booking: true,
          },
        },
      },
    });

    if (!currentSeat) {
      return NextResponse.json({ error: 'Seat not found' }, { status: 404 });
    }

    const performedBy = `Admin: ${admin.name} (${admin.email})`;

    // Helper to fetch all updated buses
    const fetchUpdatedBuses = async () => {
      return db.bus.findMany({
        orderBy: { orderIndex: 'asc' },
        include: {
          seats: {
            orderBy: [{ rowNumber: 'asc' }, { seatNumber: 'asc' }],
            include: {
              seatBooking: {
                include: { traveller: true, booking: true },
              },
              seatHold: true,
            },
          },
        },
      });
    };

    // ACTION: LOCK
    // Sets isBookable: false (blocks the seat for luggage, organizers, or offline reservation)
    if (action === 'LOCK') {
      const updated = await db.$transaction(async (tx) => {
        await tx.seatHold.deleteMany({ where: { busSeatId: seatId } });
        return tx.busSeat.update({
          where: { id: seatId },
          data: {
            isBookable: false,
            isAvailable: false,
            status: 'BLOCKED',
          },
        });
      });

      await createAuditLog({
        action: 'ADMIN_SEAT_BLOCKED',
        entityType: 'SEAT',
        entityId: seatId,
        performedBy,
        busId: currentSeat.busId,
        seatNumber: currentSeat.seatNumber,
        oldValue: currentSeat.status,
        newValue: 'BLOCKED',
        metadata: { reason: 'Blocked by coordinator for luggage or staff' },
      });

      const buses = await fetchUpdatedBuses();

      return NextResponse.json({
        success: true,
        action: 'LOCK',
        message: `Seat ${currentSeat.seatNumber} blocked for coordinators/luggage`,
        seat: updated,
        buses,
      });
    }

    // ACTION: UNLOCK
    // Sets isBookable: true
    if (action === 'UNLOCK') {
      const isOccupied = !!currentSeat.seatBooking;
      const updated = await db.busSeat.update({
        where: { id: seatId },
        data: {
          isBookable: true,
          isAvailable: !isOccupied,
          status: isOccupied ? 'BOOKED' : 'AVAILABLE',
        },
      });

      await createAuditLog({
        action: 'ADMIN_SEAT_UNLOCKED',
        entityType: 'SEAT',
        entityId: seatId,
        performedBy,
        busId: currentSeat.busId,
        seatNumber: currentSeat.seatNumber,
        oldValue: currentSeat.status,
        newValue: isOccupied ? 'BOOKED' : 'AVAILABLE',
      });

      const buses = await fetchUpdatedBuses();

      return NextResponse.json({
        success: true,
        action: 'UNLOCK',
        message: `Seat ${currentSeat.seatNumber} unlocked for booking`,
        seat: updated,
        buses,
      });
    }

    // ACTION: CLEAR
    // Vacates the seat by setting traveller.seatId = null (unlinks student and clears booking)
    if (action === 'CLEAR') {
      await db.$transaction(async (tx) => {
        if (currentSeat.seatBooking?.travellerId) {
          await tx.traveller.update({
            where: { id: currentSeat.seatBooking.travellerId },
            data: {
              assignedSeatNumber: null,
            },
          });
        }

        await tx.seatBooking.deleteMany({ where: { busSeatId: seatId } });
        await tx.seatHold.deleteMany({ where: { busSeatId: seatId } });

        await tx.busSeat.update({
          where: { id: seatId },
          data: {
            status: 'AVAILABLE',
            isAvailable: true,
            isBookable: true,
          },
        });
      });

      await createAuditLog({
        action: 'ADMIN_SEAT_VACATED',
        entityType: 'SEAT',
        entityId: seatId,
        performedBy,
        busId: currentSeat.busId,
        seatNumber: currentSeat.seatNumber,
        oldValue: currentSeat.seatBooking?.traveller?.fullName || 'Occupied',
        newValue: 'VACATED',
      });

      const buses = await fetchUpdatedBuses();

      return NextResponse.json({
        success: true,
        action: 'CLEAR',
        message: `Seat ${currentSeat.seatNumber} has been vacated`,
        buses,
      });
    }

    // ACTION: REASSIGN
    // Moves a traveller from their current seat to this seatId (or from currentSeat to targetSeatId) inside a Prisma transaction
    if (action === 'REASSIGN') {
      // Determine destination seat and traveller
      let destinationSeatId = seatId;
      let targetTravellerId = travellerId;

      if (targetSeatId) {
        // Mode 1: Moving occupant of seatId to targetSeatId
        destinationSeatId = targetSeatId;
        if (!targetTravellerId && currentSeat.seatBooking?.travellerId) {
          targetTravellerId = currentSeat.seatBooking.travellerId;
        }
      }

      if (!targetTravellerId) {
        return NextResponse.json(
          { error: 'No traveller specified or found for reassignment' },
          { status: 400 }
        );
      }

      const [destSeat, traveller] = await Promise.all([
        db.busSeat.findUnique({
          where: { id: destinationSeatId },
          include: { bus: true, seatBooking: true },
        }),
        db.traveller.findUnique({
          where: { id: targetTravellerId },
          include: {
            booking: true,
            seatBooking: { include: { busSeat: true } },
          },
        }),
      ]);

      if (!destSeat) {
        return NextResponse.json({ error: 'Target seat not found' }, { status: 404 });
      }

      if (!traveller) {
        return NextResponse.json({ error: 'Traveller record not found' }, { status: 404 });
      }

      // Check if target seat is already occupied by someone else
      if (destSeat.seatBooking && destSeat.seatBooking.travellerId !== traveller.id) {
        return NextResponse.json(
          { error: `Seat ${destSeat.seatNumber} is already occupied by another student` },
          { status: 409 }
        );
      }

      const oldSeatId = traveller.seatBooking?.busSeatId || (currentSeat.id !== destSeat.id ? currentSeat.id : null);

      await db.$transaction(async (tx) => {
        // 1. Release old seat if different
        if (oldSeatId && oldSeatId !== destSeat.id) {
          await tx.seatBooking.deleteMany({
            where: { busSeatId: oldSeatId, travellerId: traveller.id },
          });
          await tx.busSeat.update({
            where: { id: oldSeatId },
            data: { status: 'AVAILABLE', isAvailable: true },
          });
        }

        // 2. Clear any pending holds on destination seat
        await tx.seatHold.deleteMany({ where: { busSeatId: destSeat.id } });

        // 3. Mark destination seat as BOOKED
        await tx.busSeat.update({
          where: { id: destSeat.id },
          data: { status: 'BOOKED', isAvailable: false },
        });

        // 4. Upsert SeatBooking on destination seat
        await tx.seatBooking.upsert({
          where: { busSeatId: destSeat.id },
          update: {
            travellerId: traveller.id,
            bookingId: traveller.bookingId,
            status: 'CONFIRMED',
          },
          create: {
            busSeatId: destSeat.id,
            travellerId: traveller.id,
            bookingId: traveller.bookingId,
            status: 'CONFIRMED',
          },
        });

        // 5. Update traveller with new seat details
        await tx.traveller.update({
          where: { id: traveller.id },
          data: {
            assignedSeatNumber: destSeat.seatNumber,
            assignedBusNumber: destSeat.bus.busNumber,
          },
        });
      });

      await createAuditLog({
        action: 'ADMIN_SEAT_REASSIGNED',
        entityType: 'SEAT',
        entityId: destSeat.id,
        performedBy,
        busId: destSeat.busId,
        seatNumber: destSeat.seatNumber,
        oldValue: traveller.assignedSeatNumber || 'Unassigned',
        newValue: `${destSeat.bus.busNumber} — Seat ${destSeat.seatNumber}`,
        metadata: {
          travellerId: traveller.id,
          travellerName: traveller.fullName,
          bookingId: traveller.booking.bookingId,
        },
      });

      const buses = await fetchUpdatedBuses();

      return NextResponse.json({
        success: true,
        action: 'REASSIGN',
        message: `${traveller.fullName} reassigned to ${destSeat.bus.busNumber} — Seat ${destSeat.seatNumber}`,
        buses,
      });
    }

    // ACTION: ASSIGN (Manual assign an unassigned traveller)
    if (action === 'ASSIGN') {
      if (!travellerId) {
        return NextResponse.json({ error: 'travellerId is required for manual assignment' }, { status: 400 });
      }

      const traveller = await db.traveller.findUnique({
        where: { id: travellerId },
        include: { booking: true },
      });

      if (!traveller) {
        return NextResponse.json({ error: 'Traveller not found' }, { status: 404 });
      }

      await db.$transaction(async (tx) => {
        await tx.seatHold.deleteMany({ where: { busSeatId: seatId } });
        await tx.busSeat.update({
          where: { id: seatId },
          data: { status: 'BOOKED', isAvailable: false },
        });

        await tx.seatBooking.upsert({
          where: { busSeatId: seatId },
          update: {
            travellerId: traveller.id,
            bookingId: traveller.bookingId,
            status: 'CONFIRMED',
          },
          create: {
            busSeatId: seatId,
            travellerId: traveller.id,
            bookingId: traveller.bookingId,
            status: 'CONFIRMED',
          },
        });

        await tx.traveller.update({
          where: { id: traveller.id },
          data: {
            assignedSeatNumber: currentSeat.seatNumber,
            assignedBusNumber: currentSeat.bus.busNumber,
          },
        });
      });

      await createAuditLog({
        action: 'ADMIN_SEAT_ASSIGNED',
        entityType: 'SEAT',
        entityId: seatId,
        performedBy,
        busId: currentSeat.busId,
        seatNumber: currentSeat.seatNumber,
        newValue: `${traveller.fullName} (${traveller.booking.bookingId})`,
      });

      const buses = await fetchUpdatedBuses();

      return NextResponse.json({
        success: true,
        action: 'ASSIGN',
        message: `${traveller.fullName} assigned to Seat ${currentSeat.seatNumber}`,
        buses,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/admin/seats:', error);
    return NextResponse.json({ error: 'Failed to update seat' }, { status: 500 });
  }
}
