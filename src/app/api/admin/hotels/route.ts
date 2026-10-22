import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hotels = await db.hotel.findMany({
      include: {
        rooms: {
          include: {
            assignments: {
              include: {
                traveller: true,
                booking: { select: { bookingId: true } },
              },
            },
          },
        },
      },
    });

    // Also get unassigned confirmed travellers
    const confirmedTravellers = await db.traveller.findMany({
      where: {
        booking: { bookingStatus: 'CONFIRMED' },
      },
      include: {
        roomAssignments: true,
        booking: { select: { bookingId: true, primaryPhone: true } },
      },
    });

    return NextResponse.json({ hotels, confirmedTravellers });
  } catch (error) {
    console.error('Error fetching admin hotels:', error);
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, hotelId, roomId, travellerId, bookingId, name, location, address, contactPhone, roomNumber, roomType, capacity } = body;

    if (action === 'CREATE_HOTEL') {
      const trip = await db.trip.findFirst();
      const hotel = await db.hotel.create({
        data: {
          tripId: trip!.id,
          name,
          location,
          address,
          contactPhone,
        },
      });
      return NextResponse.json({ success: true, hotel });
    }

    if (action === 'CREATE_ROOM') {
      const room = await db.room.create({
        data: {
          hotelId,
          roomNumber,
          roomType: roomType || 'Triple Sharing',
          capacity: Number(capacity) || 3,
        },
      });
      return NextResponse.json({ success: true, room });
    }

    if (action === 'ASSIGN_ROOM') {
      if (!roomId || !travellerId || !bookingId) {
        return NextResponse.json({ error: 'Missing roomId, travellerId or bookingId' }, { status: 400 });
      }

      // Check room capacity
      const room = await db.room.findUnique({
        where: { id: roomId },
        include: { assignments: true },
      });

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      if (room.assignments.length >= room.capacity) {
        return NextResponse.json({ error: `Room ${room.roomNumber} is already at full capacity (${room.capacity})` }, { status: 409 });
      }

      // Create or update assignment
      await db.roomAssignment.upsert({
        where: { id: `${roomId}_${travellerId}` },
        update: { roomId },
        create: {
          id: `${roomId}_${travellerId}`,
          roomId,
          travellerId,
          bookingId,
        },
      });

      await createAuditLog({
        action: 'ADMIN_ROOM_ASSIGNMENT',
        entityType: 'HOTEL',
        entityId: roomId,
        performedBy: `Admin: ${admin.name}`,
        newValue: `Assigned traveller ${travellerId} to Room ${room.roomNumber}`,
      });

      return NextResponse.json({ success: true, message: `Traveller assigned to Room ${room.roomNumber}` });
    }

    if (action === 'REMOVE_ASSIGNMENT') {
      await db.roomAssignment.deleteMany({
        where: { roomId, travellerId },
      });
      return NextResponse.json({ success: true, message: 'Assignment removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in hotel management:', error);
    return NextResponse.json({ error: 'Failed to process hotel action' }, { status: 500 });
  }
}
