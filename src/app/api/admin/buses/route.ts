export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { generateBusSeatLayout, getBusLayoutSettings, getPassengerCapacity } from '@/lib/bus-layout';
import { updateTripConfig } from '@/lib/trip-config';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

async function syncPublicCapacity() {
  const trip = await db.trip.findFirst({ select: { id: true } });
  if (!trip) return;
  const activeBuses = await db.bus.findMany({
    where: { tripId: trip.id, status: 'ACTIVE' },
    select: { passengerCapacity: true },
  });
  const capacity = activeBuses.reduce((sum, bus) => sum + bus.passengerCapacity, 0);
  await updateTripConfig({ totalCapacity: capacity });
  await db.trip.updateMany({ data: { capacity } });
  revalidatePath('/', 'layout');
  revalidatePath('/book', 'page');
  revalidatePath('/admin', 'page');
}


export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buses = await db.bus.findMany({
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

    return NextResponse.json({ buses });
  } catch (error) {
    console.error('Error fetching admin buses:', error);
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      busNumber,
      vehicleName,
      vehicleNumber,
      driverName,
      driverPhone,
      conductorName,
      conductorPhone,
      passengerCapacity,
      rowCount = 5,
      rearSeatCount,
    } = body;

    if (!busNumber || !vehicleNumber) {
      return NextResponse.json({ error: 'Bus number and vehicle number are required' }, { status: 400 });
    }

    const trip = await db.trip.findFirst();
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const count = await db.bus.count({ where: { tripId: trip.id } });
    const rows = Number(rowCount);
    const rearSeats = rearSeatCount === undefined
      ? Math.max(0, Number(passengerCapacity ?? 23) - getPassengerCapacity(rows, 0))
      : Number(rearSeatCount);
    if (!Number.isInteger(rows) || rows < 1 || rows > 20 || !Number.isInteger(rearSeats) || rearSeats < 0 || rearSeats > 8) {
      return NextResponse.json({ error: 'Choose 1–20 side rows and 0–8 rear seats.' }, { status: 400 });
    }
    const seatLayout = generateBusSeatLayout(rows, rearSeats);
    const generatedCapacity = seatLayout.filter((seat) => seat.seatType === 'PASSENGER').length;
    if (passengerCapacity !== undefined && Number(passengerCapacity) !== generatedCapacity) {
      return NextResponse.json({ error: `This layout creates ${generatedCapacity} passenger seats.` }, { status: 400 });
    }

    const newBus = await db.$transaction(async (tx) => {
      const bus = await tx.bus.create({
        data: {
          tripId: trip.id,
          busNumber,
          vehicleName: vehicleName || 'Himalayan Escape Coach',
          vehicleNumber,
          driverName,
          driverPhone,
          conductorName,
          conductorPhone,
          physicalCapacity: generatedCapacity + 2,
          passengerCapacity: generatedCapacity,
          driverSeats: 1,
          conductorSeats: 1,
          orderIndex: count + 1,
          status: 'ACTIVE',
        },
      });

      for (const seatDef of seatLayout) {
        await tx.busSeat.create({
          data: {
            busId: bus.id,
            seatNumber: seatDef.seatNumber,
            seatType: seatDef.seatType,
            rowNumber: seatDef.rowNumber,
            side: seatDef.side,
            position: seatDef.position,
            isBookable: seatDef.isBookable,
            isAvailable: seatDef.isBookable,
            status: seatDef.isBookable ? 'AVAILABLE' : (seatDef.seatType === 'DRIVER' ? 'DRIVER' : 'CONDUCTOR'),
          },
        });
      }

      await createAuditLog({
        action: 'ADMIN_BUS_CREATED',
        entityType: 'BUS',
        entityId: bus.id,
        performedBy: `Admin: ${admin.name} (${admin.email})`,
        newValue: `${busNumber} (${vehicleNumber})`,
      });

      return bus;
    });

    await syncPublicCapacity();

    return NextResponse.json({ success: true, bus: newBus });
  } catch (error) {
    console.error('Error creating bus:', error);
    return NextResponse.json({ error: 'Failed to create bus' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { busId, busNumber, vehicleName, vehicleNumber, driverName, driverPhone, conductorName, conductorPhone, status, passengerCapacity, rowCount, rearSeatCount } = body;

    if (!busId) {
      return NextResponse.json({ error: 'Bus ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (busNumber !== undefined) updateData.busNumber = String(busNumber).trim();
    if (vehicleName) updateData.vehicleName = vehicleName;
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
    if (driverName !== undefined) updateData.driverName = driverName;
    if (driverPhone !== undefined) updateData.driverPhone = driverPhone;
    if (conductorName !== undefined) updateData.conductorName = conductorName;
    if (conductorPhone !== undefined) updateData.conductorPhone = conductorPhone;
    if (status) updateData.status = status;
    if (status !== undefined && !['ACTIVE', 'MAINTENANCE', 'DISABLED'].includes(status)) {
      return NextResponse.json({ error: 'Bus status must be Active, Maintenance, or Disabled.' }, { status: 400 });
    }

    const existingBus = await db.bus.findUnique({ where: { id: busId }, include: { seats: { include: { seatBooking: true, seatHold: true } } } });
    if (!existingBus) return NextResponse.json({ error: 'Bus not found.' }, { status: 404 });

    let layoutChanged = rowCount !== undefined || rearSeatCount !== undefined || passengerCapacity !== undefined;
    let layoutRows = getBusLayoutSettings(existingBus.seats).rows;
    let layoutRearSeats = getBusLayoutSettings(existingBus.seats).rearSeats;
    if (rowCount !== undefined) layoutRows = Number(rowCount);
    if (rearSeatCount !== undefined) layoutRearSeats = Number(rearSeatCount);
    if (passengerCapacity !== undefined && rearSeatCount === undefined) {
      layoutRearSeats = Number(passengerCapacity) - getPassengerCapacity(layoutRows, 0);
    }

    if (!Number.isInteger(layoutRows) || layoutRows < 1 || layoutRows > 20 || !Number.isInteger(layoutRearSeats) || layoutRearSeats < 0 || layoutRearSeats > 8) {
      return NextResponse.json({ error: 'Choose 1–20 side rows and 0–8 rear seats.' }, { status: 400 });
    }

    let updated;
    if (layoutChanged) {
      const desiredSeats = generateBusSeatLayout(layoutRows, layoutRearSeats);
      const desiredByNumber = new Map(desiredSeats.map((seat) => [seat.seatNumber, seat]));
      const changedOccupiedSeat = existingBus.seats.find((seat) => {
        const next = desiredByNumber.get(seat.seatNumber);
        const geometryChanged = !next || seat.rowNumber !== next.rowNumber || seat.side !== next.side || seat.position !== next.position;
        const hasLiveHold = seat.seatHold?.status === 'ACTIVE' && seat.seatHold.expiresAt > new Date();
        return geometryChanged && (!!seat.seatBooking || hasLiveHold);
      });
      if (changedOccupiedSeat) {
        return NextResponse.json({ error: `Seat ${changedOccupiedSeat.seatNumber} is booked or held. Release it before changing this layout.` }, { status: 409 });
      }
      const generatedCapacity = desiredSeats.filter((seat) => seat.seatType === 'PASSENGER').length;
      if (passengerCapacity !== undefined && Number(passengerCapacity) !== generatedCapacity) {
        return NextResponse.json({ error: `This layout creates ${generatedCapacity} passenger seats.` }, { status: 400 });
      }
      updateData.passengerCapacity = generatedCapacity;
      updateData.physicalCapacity = generatedCapacity + 2;

      updated = await db.$transaction(async (tx) => {
        for (const seatDef of desiredSeats) {
          const current = existingBus.seats.find((seat) => seat.seatNumber === seatDef.seatNumber);
          if (current) {
            await tx.busSeat.update({ where: { id: current.id }, data: {
              seatType: seatDef.seatType,
              rowNumber: seatDef.rowNumber,
              side: seatDef.side,
              position: seatDef.position,
            } });
          } else {
            await tx.busSeat.create({ data: {
              busId,
              seatNumber: seatDef.seatNumber,
              seatType: seatDef.seatType,
              rowNumber: seatDef.rowNumber,
              side: seatDef.side,
              position: seatDef.position,
              isBookable: seatDef.isBookable,
              isAvailable: seatDef.isBookable,
              status: seatDef.isBookable ? 'AVAILABLE' : seatDef.seatType,
            } });
          }
        }
        const keepNumbers = desiredSeats.map((seat) => seat.seatNumber);
        await tx.busSeat.deleteMany({ where: { busId, seatNumber: { notIn: keepNumbers } } });
        return tx.bus.update({ where: { id: busId }, data: updateData });
      });
    } else {
      updated = await db.bus.update({ where: { id: busId }, data: updateData });
    }

    await createAuditLog({
      action: 'ADMIN_BUS_UPDATED',
      entityType: 'BUS',
      entityId: busId,
      performedBy: `Admin: ${admin.name} (${admin.email})`,
      newValue: JSON.stringify(updateData),
    });

    await syncPublicCapacity();

    return NextResponse.json({ success: true, bus: updated });
  } catch (error) {
    console.error('Error updating bus:', error);
    return NextResponse.json({ error: 'Failed to update bus' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const busId = new URL(request.url).searchParams.get('busId');
    if (!busId) return NextResponse.json({ error: 'Bus ID is required.' }, { status: 400 });
    const bus = await db.bus.findUnique({ where: { id: busId }, include: { seats: { include: { seatBooking: true, seatHold: true } }, bookings: { where: { bookingStatus: { not: 'CANCELLED' } }, select: { id: true } } } });
    if (!bus) return NextResponse.json({ error: 'Bus not found.' }, { status: 404 });
    if (bus.bookings.length || bus.seats.some((seat) => seat.seatBooking || (seat.seatHold?.status === 'ACTIVE' && seat.seatHold.expiresAt > new Date()))) {
      return NextResponse.json({ error: 'This bus has active bookings or seat holds. Set its status to Disabled instead.' }, { status: 409 });
    }
    await db.bus.delete({ where: { id: busId } });
    await createAuditLog({ action: 'ADMIN_BUS_DELETED', entityType: 'BUS', entityId: busId, performedBy: `Admin: ${admin.name} (${admin.email})`, oldValue: `${bus.busNumber} (${bus.vehicleNumber})` });
    await syncPublicCapacity();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting admin bus:', error);
    return NextResponse.json({ error: 'Failed to remove bus.' }, { status: 500 });
  }
}
