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
    const {
      action,
      hotelId,
      roomId,
      travellerId,
      bookingId,
      name,
      location,
      address,
      contactPerson,
      contactPhone,
      checkInDate,
      checkOutDate,
      roomNumber,
      roomType,
      capacity,
      notes,
    } = body;

    if (action === 'CREATE_HOTEL') {
      const trip = await db.trip.findFirst();
      if (!trip) {
        return NextResponse.json({ error: 'Trip record not found' }, { status: 404 });
      }
      const hotel = await db.hotel.create({
        data: {
          tripId: trip.id,
          name: String(name || 'Himalayan Retreat').trim(),
          location: String(location || 'Manali').trim(),
          address: address ? String(address).trim() : null,
          contactPerson: contactPerson ? String(contactPerson).trim() : null,
          contactPhone: contactPhone ? String(contactPhone).trim() : null,
          checkInDate: checkInDate ? new Date(checkInDate) : null,
          checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        },
      });

      await createAuditLog({
        action: 'ADMIN_HOTEL_CREATED',
        entityType: 'HOTEL',
        entityId: hotel.id,
        performedBy: `Admin: ${admin.name} (${admin.email})`,
        newValue: `${hotel.name} (${hotel.location})`,
      });

      return NextResponse.json({ success: true, hotel });
    }

    if (action === 'UPDATE_HOTEL') {
      if (!hotelId) {
        return NextResponse.json({ error: 'hotelId is required to update hotel' }, { status: 400 });
      }

      const existingHotel = await db.hotel.findUnique({ where: { id: hotelId } });
      if (!existingHotel) {
        return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
      }

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = String(name).trim();
      if (location !== undefined) updateData.location = String(location).trim();
      if (address !== undefined) updateData.address = String(address).trim();
      if (contactPerson !== undefined) updateData.contactPerson = String(contactPerson).trim();
      if (contactPhone !== undefined) updateData.contactPhone = String(contactPhone).trim();
      if (checkInDate !== undefined) updateData.checkInDate = checkInDate ? new Date(checkInDate) : null;
      if (checkOutDate !== undefined) updateData.checkOutDate = checkOutDate ? new Date(checkOutDate) : null;

      const updated = await db.hotel.update({
        where: { id: hotelId },
        data: updateData,
      });

      await createAuditLog({
        action: 'ADMIN_HOTEL_UPDATED',
        entityType: 'HOTEL',
        entityId: hotelId,
        performedBy: `Admin: ${admin.name} (${admin.email})`,
        oldValue: `${existingHotel.name} (${existingHotel.location})`,
        newValue: `${updated.name} (${updated.location})`,
      });

      return NextResponse.json({ success: true, hotel: updated });
    }

    if (action === 'DELETE_HOTEL') {
      if (!hotelId) {
        return NextResponse.json({ error: 'hotelId is required to delete hotel' }, { status: 400 });
      }

      const existingHotel = await db.hotel.findUnique({ where: { id: hotelId } });
      if (!existingHotel) {
        return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
      }

      await db.hotel.delete({ where: { id: hotelId } });

      await createAuditLog({
        action: 'ADMIN_HOTEL_DELETED',
        entityType: 'HOTEL',
        entityId: hotelId,
        performedBy: `Admin: ${admin.name} (${admin.email})`,
        oldValue: `${existingHotel.name} (${existingHotel.location})`,
      });

      return NextResponse.json({ success: true, message: 'Hotel deleted successfully' });
    }

    if (action === 'CREATE_ROOM') {
      if (!hotelId) {
        return NextResponse.json({ error: 'hotelId is required to create a room' }, { status: 400 });
      }
      const room = await db.room.create({
        data: {
          hotelId,
          roomNumber: String(roomNumber || 'Room').trim(),
          roomType: String(roomType || 'Triple Sharing').trim(),
          capacity: Math.max(1, Number(capacity) || 3),
          notes: notes ? String(notes).trim() : null,
        },
      });

      await createAuditLog({
        action: 'ADMIN_ROOM_CREATED',
        entityType: 'ROOM',
        entityId: room.id,
        performedBy: `Admin: ${admin.name} (${admin.email})`,
        newValue: `Room ${room.roomNumber} (${room.capacity} beds)`,
      });

      return NextResponse.json({ success: true, room });
    }

    if (action === 'UPDATE_ROOM') {
      if (!roomId) {
        return NextResponse.json({ error: 'roomId is required to update room' }, { status: 400 });
      }

      const existingRoom = await db.room.findUnique({
        where: { id: roomId },
        include: { assignments: true },
      });
      if (!existingRoom) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      const updateData: Record<string, unknown> = {};
      if (roomNumber !== undefined) updateData.roomNumber = String(roomNumber).trim();
      if (roomType !== undefined) updateData.roomType = String(roomType).trim();
      if (notes !== undefined) updateData.notes = String(notes).trim();

      if (capacity !== undefined) {
        const newCap = Math.max(1, Number(capacity));
        if (existingRoom.assignments.length > newCap) {
          return NextResponse.json(
            {
              error: `Cannot reduce room capacity to ${newCap}. Room currently has ${existingRoom.assignments.length} assigned travellers. Unallot travellers first.`,
            },
            { status: 400 }
          );
        }
        updateData.capacity = newCap;
      }

      const updated = await db.room.update({
        where: { id: roomId },
        data: updateData,
      });

      await createAuditLog({
        action: 'ADMIN_ROOM_UPDATED',
        entityType: 'ROOM',
        entityId: roomId,
        performedBy: `Admin: ${admin.name} (${admin.email})`,
        oldValue: `Room ${existingRoom.roomNumber} (${existingRoom.capacity} beds)`,
        newValue: `Room ${updated.roomNumber} (${updated.capacity} beds)`,
      });

      return NextResponse.json({ success: true, room: updated });
    }

    if (action === 'DELETE_ROOM') {
      if (!roomId) {
        return NextResponse.json({ error: 'roomId is required to delete room' }, { status: 400 });
      }

      const existingRoom = await db.room.findUnique({ where: { id: roomId } });
      if (!existingRoom) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      await db.room.delete({ where: { id: roomId } });

      await createAuditLog({
        action: 'ADMIN_ROOM_DELETED',
        entityType: 'ROOM',
        entityId: roomId,
        performedBy: `Admin: ${admin.name} (${admin.email})`,
        oldValue: `Room ${existingRoom.roomNumber}`,
      });

      return NextResponse.json({ success: true, message: 'Room deleted successfully' });
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
