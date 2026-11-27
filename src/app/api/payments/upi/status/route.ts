export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const orderId = searchParams.get('orderId');

    if (!bookingId && !orderId) {
      return NextResponse.json(
        { error: 'bookingId or orderId is required' },
        { status: 400 }
      );
    }

    const booking = await db.booking.findFirst({
      where: {
        OR: [
          ...(bookingId ? [{ bookingId }] : []),
          ...(orderId ? [{ payments: { some: { razorpayOrderId: orderId } } }] : []),
        ],
      },
      include: {
        payments: true,
        tickets: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isConfirmed = booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID';
    const primaryTicket = booking.tickets[0];

    return NextResponse.json({
      success: true,
      bookingId: booking.bookingId,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      confirmed: isConfirmed,
      ticketToken: primaryTicket?.qrToken || null,
      ticketsCount: booking.tickets.length,
    });
  } catch (error: any) {
    console.error('[API_PAYMENTS_UPI_STATUS_ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to query payment status' },
      { status: 500 }
    );
  }
}
