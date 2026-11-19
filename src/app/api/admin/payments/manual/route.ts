export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin session' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, amount, paymentMethod = 'CASH', notes } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'A valid payment amount greater than 0 is required' }, { status: 400 });
    }

    const validMethods = ['CASH', 'UPI', 'BANK_TRANSFER'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method. Must be CASH, UPI, or BANK_TRANSFER' }, { status: 400 });
    }

    // Locate booking
    const booking = await db.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookingId: bookingId }],
      },
      include: {
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: `Booking ${bookingId} not found` }, { status: 404 });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot record payment for a cancelled booking' }, { status: 400 });
    }

    if (booking.remainingBalance <= 0) {
      return NextResponse.json({ error: 'This booking is already fully settled with ₹0 remaining balance' }, { status: 400 });
    }

    // Guard against overpayment
    const payableAmount = Math.min(numericAmount, booking.remainingBalance);

    // Idempotency: prevent double-clicks within 5 seconds for the identical amount and booking
    const recentDuplicate = booking.payments.find(
      (p) =>
        p.amount === payableAmount &&
        p.razorpayPaymentId?.startsWith(`MANUAL_${paymentMethod}`) &&
        Date.now() - new Date(p.createdAt).getTime() < 5000
    );

    if (recentDuplicate) {
      return NextResponse.json(
        {
          error: 'Duplicate payment submission detected. Please wait a moment before trying again.',
        },
        { status: 409 }
      );
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const manualOrderId = `manual_ord_${timestamp}_${randomSuffix}`;
    const manualPaymentId = `MANUAL_${paymentMethod}_${(admin.email || 'ADMIN').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}_${timestamp}`;

    const adminIdentity = admin.name ? `Admin: ${admin.name} (${admin.email})` : `Admin: ${admin.email}`;

    const result = await db.$transaction(async (tx) => {
      const newRemainingBalance = Math.max(0, booking.remainingBalance - payableAmount);
      const newPaymentStatus = newRemainingBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          razorpayOrderId: manualOrderId,
          razorpayPaymentId: manualPaymentId,
          amount: payableAmount,
          currency: 'INR',
          paymentType: newRemainingBalance === 0 ? 'REMAINING_BALANCE' : 'PARTIAL_SETTLEMENT',
          status: 'PAID',
          verifiedAt: new Date(),
          payload: JSON.stringify({
            method: paymentMethod,
            recordedBy: adminIdentity,
            adminEmail: admin.email,
            notes: notes || null,
            recordedAt: new Date().toISOString(),
          }),
        },
      });

      // 2. Update Booking financials
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          remainingBalance: newRemainingBalance,
          paymentStatus: newPaymentStatus,
          // If booking was still in PENDING status, confirm it upon collection
          ...(booking.bookingStatus === 'PENDING' ? { bookingStatus: 'CONFIRMED' } : {}),
        },
      });

      // 3. Create Audit Log
      await tx.auditLog.create({
        data: {
          action: 'MANUAL_PAYMENT_RECORDED',
          entityType: 'PAYMENT',
          entityId: payment.id,
          performedBy: adminIdentity,
          bookingId: booking.id,
          oldValue: `Balance: ₹${booking.remainingBalance}`,
          newValue: `Paid: ₹${payableAmount} (${paymentMethod}). New balance: ₹${newRemainingBalance}`,
          metadata: JSON.stringify({
            amount: payableAmount,
            paymentMethod,
            manualPaymentId,
            notes: notes || null,
          }),
        },
      });

      return { payment, booking: updatedBooking };
    }, { timeout: 15000 });

    return NextResponse.json({
      success: true,
      message: `Successfully recorded manual ${paymentMethod} payment of ₹${payableAmount.toLocaleString('en-IN')}`,
      payment: result.payment,
      remainingBalance: result.booking.remainingBalance,
      paymentStatus: result.booking.paymentStatus,
    });
  } catch (error) {
    console.error('Error recording manual payment:', error);
    return NextResponse.json({ error: 'Failed to record manual payment' }, { status: 500 });
  }
}
