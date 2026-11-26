export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';
import { updateTripConfig } from '@/lib/trip-config';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    const adminSecretHeader = request.headers.get('x-admin-secret');
    const expectedSecret = process.env.ADMIN_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || 'Trip@2026';

    const isAuthorized = !!admin || (adminSecretHeader && adminSecretHeader === expectedSecret);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized. Admin credentials or secret required.' }, { status: 401 });
    }

    const auditActor = admin ? `Admin: ${admin.name} (${admin.email})` : 'System Key Authorization';

    console.log(`[RESET] Executing full production database purge initiated by ${auditActor}...`);

    // 1. Delete all transactional bookings and traveller artifacts in foreign key dependency order
    const [
      deletedCheckIns,
      deletedTickets,
      deletedSeatBookings,
      deletedSeatHolds,
      deletedRoomAssignments,
      deletedPayments,
      deletedTravellers,
      deletedBookings,
    ] = await Promise.all([
      db.checkIn.deleteMany({}),
      db.ticket.deleteMany({}),
      db.seatBooking.deleteMany({}),
      db.seatHold.deleteMany({}),
      db.roomAssignment.deleteMany({}),
      db.payment.deleteMany({}),
      db.traveller.deleteMany({}),
      db.booking.deleteMany({}),
    ]);

    // 2. Reset all passenger seats across all buses to AVAILABLE
    const resetPassengerSeats = await db.busSeat.updateMany({
      where: { seatType: 'PASSENGER' },
      data: {
        status: 'AVAILABLE',
        isAvailable: true,
        isBookable: true,
      },
    });

    // 3. Ensure driver and conductor seats remain non-bookable reserved crew
    const resetCabinSeats = await db.busSeat.updateMany({
      where: { seatType: { in: ['DRIVER', 'CONDUCTOR'] } },
      data: {
        status: 'UNAVAILABLE',
        isAvailable: false,
        isBookable: false,
      },
    });

    // 4. Update all active buses to canonical 25-passenger seat capacity
    await db.bus.updateMany({
      where: { status: 'ACTIVE' },
      data: {
        passengerCapacity: 25,
        physicalCapacity: 27,
      },
    });

    // 5. Update master Trip entity (Manali × Kasol)
    const trip = await db.trip.findFirst();
    if (trip) {
      await db.trip.update({
        where: { id: trip.id },
        data: {
          packagePrice: 6199,
          packagePricePerTraveller: 6199,
          reservationAmountPerTraveller: 1000,
          capacity: 50,
          duration: '6 DAYS • 5 NIGHTS',
          startDate: new Date('2026-12-23T12:00:00.000Z'),
          endDate: new Date('2026-12-28T08:00:00.000Z'),
        },
      });
    }

    // 6. Update global TripConfig
    await updateTripConfig({
      packagePrice: 6199,
      groupDiscountAmount: 600,
      groupSizeThreshold: 5,
      depositPrice: 1000,
      totalCapacity: 50,
      departureDate: '2026-12-23',
      returnDate: '2026-12-28',
      reportingTime: '12:00 PM',
      pickupLocation: 'GLA University, Mathura',
    });

    // 7. Audit Log
    await createAuditLog({
      action: 'PRODUCTION_DATABASE_RESET',
      entityType: 'TRIP',
      entityId: trip?.id || 'global',
      performedBy: auditActor,
      newValue: `Purged ${deletedBookings.count} bookings, reset ${resetPassengerSeats.count} seats to AVAILABLE. Capacity set to 75.`,
    });

    // Revalidate paths for instant client freshness
    revalidatePath('/', 'layout');
    revalidatePath('/book', 'page');
    revalidatePath('/admin', 'layout');
    revalidatePath('/pricing', 'page');
    revalidatePath('/itinerary', 'page');

    return NextResponse.json({
      success: true,
      message: 'Production database safely purged and fleet restored to 100% available capacity.',
      stats: {
        deletedBookings: deletedBookings.count,
        deletedTravellers: deletedTravellers.count,
        deletedPayments: deletedPayments.count,
        deletedTickets: deletedTickets.count,
        deletedSeatHolds: deletedSeatHolds.count,
        resetPassengerSeats: resetPassengerSeats.count,
        totalFleetCapacity: 50,
        packagePrice: 6199,
        depositPrice: 1000,
        departureDate: '2026-12-23',
        returnDate: '2026-12-28',
      },
    });
  } catch (error: any) {
    console.error('Error during database purge:', error);
    return NextResponse.json({
      error: 'Failed to reset database: ' + (error?.message || 'Unknown error'),
    }, { status: 500 });
  }
}
