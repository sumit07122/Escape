export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BUS_25_SEATS_LAYOUT } from '@/lib/constants';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';



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
      passengerCapacity = 23,
    } = body;

    if (!busNumber || !vehicleNumber) {
      return NextResponse.json({ error: 'Bus number and vehicle number are required' }, { status: 400 });
    }

    const trip = await db.trip.findFirst();
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const count = await db.bus.count({ where: { tripId: trip.id } });

    const newBus = await db.$transaction(async (tx) => {
      const bus = await tx.bus.create({
        data: {
          tripId: trip.id,
          busNumber,
          vehicleName: vehicleName || 'Himalayan Luxury 2x2 Coach',
          vehicleNumber,
          driverName,
          driverPhone,
          conductorName,
          conductorPhone,
          physicalCapacity: Number(passengerCapacity) + 2,
          passengerCapacity: Number(passengerCapacity),
          driverSeats: 1,
          conductorSeats: 1,
          orderIndex: count + 1,
          status: 'ACTIVE',
        },
      });

      // Generate standard 25-seat template for the new bus
      for (const seatDef of BUS_25_SEATS_LAYOUT) {
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
    const { busId, vehicleName, vehicleNumber, driverName, driverPhone, conductorName, conductorPhone, status, passengerCapacity } = body;

    if (!busId) {
      return NextResponse.json({ error: 'Bus ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (vehicleName) updateData.vehicleName = vehicleName;
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
    if (driverName !== undefined) updateData.driverName = driverName;
    if (driverPhone !== undefined) updateData.driverPhone = driverPhone;
    if (conductorName !== undefined) updateData.conductorName = conductorName;
    if (conductorPhone !== undefined) updateData.conductorPhone = conductorPhone;
    if (status) updateData.status = status;
    if (passengerCapacity) {
      updateData.passengerCapacity = Number(passengerCapacity);
      updateData.physicalCapacity = Number(passengerCapacity) + 2;
    }

    const updated = await db.bus.update({
      where: { id: busId },
      data: updateData,
    });

    await createAuditLog({
      action: 'ADMIN_BUS_UPDATED',
      entityType: 'BUS',
      entityId: busId,
      performedBy: `Admin: ${admin.name} (${admin.email})`,
      newValue: JSON.stringify(updateData),
    });

    return NextResponse.json({ success: true, bus: updated });
  } catch (error) {
    console.error('Error updating bus:', error);
    return NextResponse.json({ error: 'Failed to update bus' }, { status: 500 });
  }
}
