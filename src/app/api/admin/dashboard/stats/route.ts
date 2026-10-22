import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, cleanExpiredHolds } from '@/lib/server-utils';



export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await cleanExpiredHolds();

    const trip = await db.trip.findFirst();
    const capacity = trip?.capacity || 75;

    // Fetch all confirmed bookings
    const confirmedBookings = await db.booking.findMany({
      where: { bookingStatus: 'CONFIRMED' },
      include: {
        travellers: true,
      },
    });

    const pendingBookingsCount = await db.booking.count({
      where: { bookingStatus: 'PENDING' },
    });

    // Sum travellers in confirmed bookings
    const confirmedTravellersCount = confirmedBookings.reduce(
      (acc, b) => acc + b.travellers.length,
      0
    );

    const availableCapacity = Math.max(0, capacity - confirmedTravellersCount);

    // Sum financials
    const reservationRevenue = confirmedBookings.reduce(
      (acc, b) => acc + b.reservationAmount,
      0
    );
    const totalRevenue = confirmedBookings.reduce(
      (acc, b) => acc + b.finalAmount,
      0
    );
    const remainingBalances = confirmedBookings.reduce(
      (acc, b) => acc + b.remainingBalance,
      0
    );
    const checkedInTravellersCount = await db.traveller.count({
      where: { checkInStatus: 'CHECKED_IN' },
    });

    // Buses breakdown
    const buses = await db.bus.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { orderIndex: 'asc' },
      include: {
        seats: {
          select: {
            seatNumber: true,
            status: true,
            isBookable: true,
          },
        },
      },
    });

    let totalHeldSeats = 0;
    const busMetrics = buses.map((bus) => {
      const passengerSeats = bus.seats.filter((s) => s.isBookable);
      const booked = passengerSeats.filter((s) => s.status === 'BOOKED').length;
      const held = passengerSeats.filter((s) => s.status === 'HELD').length;
      const available = passengerSeats.filter((s) => s.status === 'AVAILABLE').length;
      totalHeldSeats += held;

      return {
        id: bus.id,
        busNumber: bus.busNumber,
        vehicleName: bus.vehicleName,
        vehicleNumber: bus.vehicleNumber,
        driverName: bus.driverName,
        conductorName: bus.conductorName,
        passengerCapacity: bus.passengerCapacity,
        booked,
        held,
        available,
      };
    });

    return NextResponse.json({
      stats: {
        capacity,
        confirmedBookings: confirmedBookings.length,
        confirmedTravellers: confirmedTravellersCount,
        pendingBookings: pendingBookingsCount,
        availableCapacity,
        heldSeats: totalHeldSeats,
        reservationRevenue,
        totalRevenue,
        remainingBalances,
        checkedInTravellers: checkedInTravellersCount,
      },
      buses: busMetrics,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
