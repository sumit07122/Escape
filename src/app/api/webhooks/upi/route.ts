export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyGatewayWebhookSignature } from '@/lib/upi-gateway';
import { generateTicketQrToken, generateTicketNumber } from '@/lib/qr';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const secret = process.env.UPI_GATEWAY_SECRET;
    const signature = request.headers.get('x-gateway-signature') || payload.signature;

    // Verify signature if secret is configured
    if (secret && signature) {
      const isValid = verifyGatewayWebhookSignature(rawBody, signature, secret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    // Extract transaction identifiers
    const status = (payload.status || payload.txStatus || payload.data?.status || '').toUpperCase();
    const orderId = payload.order_id || payload.client_txn_id || payload.orderId || payload.data?.order_id;
    const utr = payload.utr || payload.bank_ref_num || payload.txn_id || payload.data?.utr || `UPI_WH_${Date.now()}`;
    const amount = Number(payload.amount || payload.data?.amount || 0);

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id in webhook payload' }, { status: 400 });
    }

    if (status !== 'SUCCESS' && status !== 'COMPLETED' && status !== 'PAID') {
      // Non-success status (e.g. FAILED, EXPIRED)
      return NextResponse.json({ received: true, status: 'IGNORED_NON_SUCCESS' });
    }

    // Find the payment record associated with this order
    const payment = await db.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: {
        booking: {
          include: {
            travellers: true,
            bus: true,
            tickets: true,
          },
        },
      },
    });

    if (!payment) {
      console.warn(`[WEBHOOK_UPI] Payment record not found for orderId: ${orderId}`);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const booking = payment.booking;

    // Idempotency: If already confirmed, return success immediately
    if (booking.bookingStatus === 'CONFIRMED' && payment.status === 'PAID') {
      return NextResponse.json({ success: true, message: 'Already confirmed' });
    }

    // Execute atomic confirmation transaction
    await db.$transaction(async (tx) => {
      // 1. Mark payment as PAID
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          razorpayPaymentId: utr,
          razorpaySignature: 'GATEWAY_WEBHOOK_VERIFIED',
        },
      });

      // 2. Mark booking as CONFIRMED
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
        },
      });

      // 3. Finalize seats
      for (const traveller of booking.travellers) {
        if (!traveller.assignedSeatNumber || !booking.busId) continue;

        const busSeat = await tx.busSeat.findUnique({
          where: {
            busId_seatNumber: {
              busId: booking.busId,
              seatNumber: traveller.assignedSeatNumber,
            },
          },
        });

        if (busSeat) {
          await tx.seatHold.deleteMany({ where: { busSeatId: busSeat.id } });

          await tx.seatBooking.upsert({
            where: { busSeatId: busSeat.id },
            update: {
              bookingId: booking.id,
              travellerId: traveller.id,
              status: 'CONFIRMED',
              confirmedAt: new Date(),
            },
            create: {
              bookingId: booking.id,
              travellerId: traveller.id,
              busSeatId: busSeat.id,
              status: 'CONFIRMED',
              confirmedAt: new Date(),
            },
          });

          await tx.busSeat.update({
            where: { id: busSeat.id },
            data: { status: 'BOOKED' },
          });
        }
      }

      // 4. Generate digital QR tickets if not yet created
      if (!booking.tickets || booking.tickets.length === 0) {
        for (const traveller of booking.travellers) {
          await tx.ticket.create({
            data: {
              ticketNumber: generateTicketNumber(),
              bookingId: booking.id,
              travellerId: traveller.id,
              qrToken: generateTicketQrToken(),
              status: 'ACTIVE',
            },
          });
        }
      }
    });

    // Audit Log
    await createAuditLog({
      action: 'UPI_WEBHOOK_PAYMENT_CAPTURED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      bookingId: booking.bookingId,
      performedBy: 'UPI_GATEWAY_WEBHOOK',
      newValue: `Payment auto-captured via webhook. Order: ${orderId}, UTR: ${utr}, Amount: ₹${amount}`,
      metadata: { orderId, utr, amount },
    });

    return NextResponse.json({ success: true, message: 'Payment captured and booking confirmed' });
  } catch (error: any) {
    console.error('[API_WEBHOOK_UPI_ERROR]:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
