export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/server-utils';
import { getTripConfig, getSeatAvailability } from '@/lib/trip-config';



export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Bookings summary
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        travellers: true,
        bus: true,
        package: true,
        payments: true,
      },
    });

    // 2. Travellers summary
    const travellers = await db.traveller.findMany({
      orderBy: { fullName: 'asc' },
      include: {
        booking: {
          select: {
            bookingId: true,
            bookingStatus: true,
            paymentStatus: true,
            bus: { select: { busNumber: true } },
          },
        },
      },
    });

    // 3. Payments
    const payments = await db.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: { bookingId: true, primaryTravellerName: true },
        },
      },
    });

    // 4. Expenses
    const expenses = await db.expense.findMany();
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Financial totals
    const confirmedBookings = bookings.filter((b) => b.bookingStatus === 'CONFIRMED');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.finalAmount, 0);
    const reservationCollected = confirmedBookings.reduce((sum, b) => sum + b.reservationAmount, 0);
    const remainingReceivable = confirmedBookings.reduce((sum, b) => sum + b.remainingBalance, 0);
    const totalDiscounts = confirmedBookings.reduce((sum, b) => sum + b.discountAmount, 0);

    const netProfitOrLoss = totalRevenue - totalExpenses;

    const seatAvail = await getSeatAvailability();
    const tripConfig = seatAvail.tripConfig;
    const balanceDue = Math.max(0, tripConfig.packagePrice - tripConfig.depositPrice);

    return NextResponse.json({
      summary: {
        totalRevenue,
        reservationCollected,
        remainingReceivable,
        totalExpenses,
        totalDiscounts,
        netProfitOrLoss,
        totalBookings: bookings.length,
        confirmedBookingsCount: confirmedBookings.length,
        totalTravellers: travellers.length,
        checkedInTravellers: travellers.filter((t) => t.checkInStatus === 'CHECKED_IN').length,
        capacity: tripConfig.totalCapacity,
        packagePrice: tripConfig.packagePrice,
        depositPrice: tripConfig.depositPrice,
        balanceDue,
        availableSeats: seatAvail.availableSeats,
        heldSeats: seatAvail.heldCount,
        blockedSeats: seatAvail.blockedCount,
      },
      tripConfig,
      bookings,
      travellers,
      payments,
      expenses,
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
