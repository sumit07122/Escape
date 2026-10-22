import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cleanExpiredHolds } from '@/lib/server-utils';



export async function GET() {
  try {
    // 1. Clean any expired holds first
    await cleanExpiredHolds();

    // 2. Fetch master trip
    const trip = await db.trip.findFirst();
    if (!trip) {
      return NextResponse.json({ error: 'Trip not initialized' }, { status: 404 });
    }

    // 3. Fetch all buses with seats and confirmed bookings
    const buses = await db.bus.findMany({
      where: { tripId: trip.id, status: 'ACTIVE' },
      orderBy: { orderIndex: 'asc' },
      include: {
        seats: {
          select: {
            id: true,
            seatNumber: true,
            seatType: true,
            status: true,
            isBookable: true,
          },
        },
      },
    });

    let totalTripBooked = 0;
    let totalTripHeld = 0;
    let totalTripPassengerSeats = 0;

    const busSummaries = buses.map((bus) => {
      const passengerSeats = bus.seats.filter((s) => s.isBookable);
      const bookedCount = passengerSeats.filter((s) => s.status === 'BOOKED').length;
      const heldCount = passengerSeats.filter((s) => s.status === 'HELD').length;
      const availableCount = passengerSeats.filter((s) => s.status === 'AVAILABLE').length;

      totalTripBooked += bookedCount;
      totalTripHeld += heldCount;
      totalTripPassengerSeats += passengerSeats.length;

      return {
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
        stats: {
          totalSeats: passengerSeats.length,
          bookedCount,
          heldCount,
          availableCount,
          isFull: availableCount === 0,
        },
      };
    });

    const totalAvailable = Math.max(0, trip.capacity - totalTripBooked);

    return NextResponse.json({
      trip: {
        id: trip.id,
        title: trip.title,
        subtitle: trip.subtitle,
        duration: trip.duration,
        origin: trip.origin,
        destination: trip.destination,
        capacity: trip.capacity,
        totalBooked: totalTripBooked,
        totalHeld: totalTripHeld,
        totalAvailable,
      },
      buses: busSummaries,
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 });
  }
}
