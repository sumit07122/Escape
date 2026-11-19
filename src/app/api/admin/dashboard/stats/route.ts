export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, cleanExpiredHolds } from '@/lib/server-utils';
import { getSeatAvailability } from '@/lib/trip-config';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await cleanExpiredHolds();
    } catch (e) {
      console.warn('[CLEAN_HOLDS_WARN]:', e);
    }

    let capacity = 75;
    let availableCapacity = 75;
    try {
      const ssot = await getSeatAvailability();
      capacity = ssot.totalCapacity || 75;
      availableCapacity = ssot.availableSeats ?? 75;
    } catch (e) {
      console.warn('[SSOT_SEATS_WARN]:', e);
    }

    // 1. Fetch all bookings for authoritative metric derivation
    const allBookings = await db.booking.findMany({
      include: {
        travellers: {
          select: {
            id: true,
            checkInStatus: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
    });

    // Total booking records
    const totalBookings = allBookings.length;

    // Filtered booking sets
    const confirmedBookingsList = allBookings.filter((b) => b.bookingStatus === 'CONFIRMED');
    const pendingBookingsList = allBookings.filter((b) => b.bookingStatus === 'PENDING');
    const cancelledBookingsList = allBookings.filter((b) => b.bookingStatus === 'CANCELLED');

    const confirmedBookings = confirmedBookingsList.length;
    const pendingBookings = pendingBookingsList.length;
    const cancelledBookings = cancelledBookingsList.length;

    // Payment statuses across all non-cancelled bookings
    const pendingPaymentsCount = allBookings.filter(
      (b) => b.paymentStatus === 'PENDING' && b.bookingStatus !== 'CANCELLED'
    ).length;
    const failedPaymentsCount = allBookings.filter(
      (b) => b.paymentStatus === 'FAILED'
    ).length;

    // Total confirmed travellers
    const confirmedTravellers = confirmedBookingsList.reduce(
      (acc, b) => acc + (b.travellers?.length || b.travellersCount || 1),
      0
    );

    // Reserved seats in database
    let reservedSeats = 0;
    try {
      reservedSeats = await db.seatBooking.count({
        where: { status: 'CONFIRMED' },
      });
    } catch {
      reservedSeats = confirmedTravellers;
    }

    // Recalculate available capacity strictly against confirmed travellers
    const calculatedAvailableCapacity = Math.max(0, capacity - confirmedTravellers);

    // Financial derivations
    const totalDepositsCollected = confirmedBookingsList.reduce((acc, b) => {
      // Sum either verified reservation payments or recorded reservationAmount
      return acc + (b.reservationAmount || 0);
    }, 0);

    const outstandingBalances = confirmedBookingsList.reduce(
      (acc, b) => acc + Math.max(0, b.remainingBalance || 0),
      0
    );

    const totalRevenue = confirmedBookingsList.reduce(
      (acc, b) => acc + (b.finalAmount || 0),
      0
    );

    // Fully paid travellers: travellers in confirmed bookings with 0 remaining balance or PAID status
    const fullyPaidTravellers = confirmedBookingsList
      .filter((b) => b.remainingBalance <= 0 || b.paymentStatus === 'PAID')
      .reduce((acc, b) => acc + (b.travellers?.length || b.travellersCount || 1), 0);

    // Check-in counts
    let checkInCount = 0;
    try {
      checkInCount = await db.traveller.count({
        where: {
          checkInStatus: 'CHECKED_IN',
          booking: { bookingStatus: 'CONFIRMED' },
        },
      });
    } catch {
      // Fallback from loaded travellers
      checkInCount = confirmedBookingsList.reduce(
        (acc, b) => acc + b.travellers.filter((t) => t.checkInStatus === 'CHECKED_IN').length,
        0
      );
    }

    const remainingToCheckIn = Math.max(0, confirmedTravellers - checkInCount);

    // Buses breakdown
    let buses: any[] = [];
    let totalHeldSeats = 0;
    try {
      const dbBuses = await db.bus.findMany({
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

      buses = dbBuses.map((bus) => {
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
    } catch (e) {
      console.warn('[BUSES_METRICS_WARN]:', e);
    }

    return NextResponse.json({
      success: true,
      stats: {
        // The 13 canonical operational metrics:
        totalBookings,
        confirmedTravellers,
        reservedSeats,
        capacity,
        availableCapacity: calculatedAvailableCapacity,
        confirmedBookings,
        pendingBookings,
        failedPayments: failedPaymentsCount,
        cancelledBookings,
        totalDepositsCollected,
        outstandingBalances,
        fullyPaidTravellers,
        checkInCount,
        remainingToCheckIn,

        // Supplementary operational fields:
        pendingPayments: pendingPaymentsCount,
        totalRevenue,
        reservationRevenue: totalDepositsCollected,
        remainingBalances: outstandingBalances,
        checkedInTravellers: checkInCount,
        heldSeats: totalHeldSeats,
      },
      buses,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard metrics',
        stats: {
          totalBookings: 0,
          confirmedTravellers: 0,
          reservedSeats: 0,
          capacity: 75,
          availableCapacity: 75,
          confirmedBookings: 0,
          pendingBookings: 0,
          failedPayments: 0,
          cancelledBookings: 0,
          totalDepositsCollected: 0,
          outstandingBalances: 0,
          fullyPaidTravellers: 0,
          checkInCount: 0,
          remainingToCheckIn: 0,
          pendingPayments: 0,
          totalRevenue: 0,
          reservationRevenue: 0,
          remainingBalances: 0,
          checkedInTravellers: 0,
          heldSeats: 0,
        },
        buses: [],
      },
      { status: 500 }
    );
  }
}
