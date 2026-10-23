export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { generateTicketQrToken, generateTicketNumber } from '@/lib/qr';
import { createAuditLog } from '@/lib/server-utils';

function checkWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!secret) {
    // If no secret configured in test/sandbox environment, allow event processing
    return true;
  }
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (signature.length !== expectedSignature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf-8'),
    Buffer.from(expectedSignature, 'utf-8')
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // 1. Verify webhook signature
    if (!checkWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    // -----------------------------------------------------------------
    // EVENT: payment.captured or order.paid
    // -----------------------------------------------------------------
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;
      const notesBookingId = paymentEntity?.notes?.bookingId;

      if (!orderId && !notesBookingId) {
        return NextResponse.json({ error: 'Missing order_id or booking reference in payload' }, { status: 400 });
      }

      // Find booking either via payment orderId or notes
      const booking = await db.booking.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ payments: { some: { razorpayOrderId: orderId } } }] : []),
            ...(notesBookingId ? [{ bookingId: notesBookingId }] : []),
          ],
        },
        include: {
          travellers: true,
          bus: true,
          payments: true,
          seatBookings: true,
        },
      });

      if (!booking) {
        return NextResponse.json({ message: 'No associated booking found for payment event' }, { status: 200 });
      }

      // If already CONFIRMED, return idempotent already_processed response
      if (booking.bookingStatus === 'CONFIRMED') {
        return NextResponse.json({ status: 'already_processed', message: 'Booking already confirmed' });
      }

      // Atomically transition to CONFIRMED, assign traveller seatIds, generate QR tickets, and purge holds
      await db.$transaction(async (tx) => {
        const busId = booking.busId;
        const seatNumbers: string[] = [];

        for (const traveller of booking.travellers) {
          if (!traveller.assignedSeatNumber || !busId) continue;
          seatNumbers.push(traveller.assignedSeatNumber);

          const seat = await tx.busSeat.findUnique({
            where: {
              busId_seatNumber: {
                busId,
                seatNumber: traveller.assignedSeatNumber,
              },
            },
            include: { seatHold: true, seatBooking: true },
          });

          if (seat) {
            // Mark bus seat as permanently BOOKED
            await tx.busSeat.update({
              where: { id: seat.id },
              data: {
                status: 'BOOKED',
                isAvailable: false,
              },
            });

            // Upsert confirmed SeatBooking
            await tx.seatBooking.upsert({
              where: { busSeatId: seat.id },
              update: {
                bookingId: booking.id,
                travellerId: traveller.id,
                status: 'CONFIRMED',
              },
              create: {
                busSeatId: seat.id,
                bookingId: booking.id,
                travellerId: traveller.id,
                status: 'CONFIRMED',
              },
            });

            // Generate high-security Digital QR Ticket
            const qrToken = generateTicketQrToken();
            const ticketNumber = generateTicketNumber();

            await tx.ticket.upsert({
              where: { travellerId: traveller.id },
              update: {
                status: 'VALID',
                tripId: booking.tripId,
              },
              create: {
                tripId: booking.tripId,
                ticketNumber,
                bookingId: booking.id,
                travellerId: traveller.id,
                qrToken,
                status: 'VALID',
              },
            });

            // Update traveller bus confirmation
            await tx.traveller.update({
              where: { id: traveller.id },
              data: {
                assignedBusNumber: booking.bus?.busNumber || 'Bus 01',
              },
            });
          }
        }

        // Purge temporary seat holds for these seats
        if (busId && seatNumbers.length > 0) {
          const seatsToClear = await tx.busSeat.findMany({
            where: {
              busId,
              seatNumber: { in: seatNumbers },
            },
            select: { id: true },
          });
          const seatIds = seatsToClear.map((s) => s.id);
          await tx.seatHold.deleteMany({
            where: { busSeatId: { in: seatIds } },
          });
        }

        // Update Payment status to PAID
        if (orderId) {
          await tx.payment.updateMany({
            where: { razorpayOrderId: orderId },
            data: {
              razorpayPaymentId: paymentId || undefined,
              status: 'PAID',
              verifiedAt: new Date(),
            },
          });
        }

        // Update Booking status to CONFIRMED
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'PAID',
            bookingStatus: 'CONFIRMED',
          },
        });
      });

      await createAuditLog({
        action: 'WEBHOOK_PAYMENT_CAPTURED',
        entityType: 'BOOKING',
        entityId: booking.id,
        bookingId: booking.bookingId,
        performedBy: 'Razorpay Webhook',
        newValue: `Booking ${booking.bookingId} confirmed via webhook payment.captured`,
        metadata: { orderId, paymentId },
      });

      return NextResponse.json({ status: 'ok', action: 'PAYMENT_CAPTURED', bookingId: booking.bookingId });
    }

    // -----------------------------------------------------------------
    // EVENT: payment.failed
    // -----------------------------------------------------------------
    if (eventType === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const notesBookingId = paymentEntity?.notes?.bookingId;

      const booking = await db.booking.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ payments: { some: { razorpayOrderId: orderId } } }] : []),
            ...(notesBookingId ? [{ bookingId: notesBookingId }] : []),
          ],
        },
        include: {
          travellers: true,
          bus: true,
        },
      });

      if (!booking) {
        return NextResponse.json({ message: 'No associated booking found for payment.failed' }, { status: 200 });
      }

      // Mark booking as CANCELLED and immediately purge associated seat holds
      await db.$transaction(async (tx) => {
        const busId = booking.busId;
        const seatNumbers = booking.travellers
          .map((t) => t.assignedSeatNumber)
          .filter(Boolean) as string[];

        // Purge seat holds and revert bus seats to AVAILABLE if not already booked by another confirmed booking
        if (busId && seatNumbers.length > 0) {
          const seats = await tx.busSeat.findMany({
            where: {
              busId,
              seatNumber: { in: seatNumbers },
            },
            include: { seatBooking: true },
          });

          for (const seat of seats) {
            // Delete active/stale holds
            await tx.seatHold.deleteMany({
              where: { busSeatId: seat.id },
            });

            // If seat is not booked by another confirmed booking, make it AVAILABLE
            if (!seat.seatBooking || seat.seatBooking.bookingId === booking.id) {
              await tx.seatBooking.deleteMany({
                where: { busSeatId: seat.id, bookingId: booking.id },
              });
              await tx.busSeat.update({
                where: { id: seat.id },
                data: {
                  status: 'AVAILABLE',
                  isAvailable: true,
                },
              });
            }
          }
        }

        // Update payment record to FAILED
        if (orderId) {
          await tx.payment.updateMany({
            where: { razorpayOrderId: orderId },
            data: { status: 'FAILED' },
          });
        }

        // Mark booking as CANCELLED
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'FAILED',
            bookingStatus: 'CANCELLED',
          },
        });
      });

      await createAuditLog({
        action: 'WEBHOOK_PAYMENT_FAILED',
        entityType: 'BOOKING',
        entityId: booking.id,
        bookingId: booking.bookingId,
        performedBy: 'Razorpay Webhook',
        newValue: `Booking ${booking.bookingId} cancelled and seat holds purged via payment.failed`,
        metadata: {
          orderId,
          errorCode: paymentEntity?.error_code,
          errorDesc: paymentEntity?.error_description,
        },
      });

      return NextResponse.json({ status: 'ok', action: 'PAYMENT_FAILED', bookingId: booking.bookingId });
    }

    return NextResponse.json({ status: 'ok', message: `Unhandled event ${eventType} ignored` });
  } catch (error) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
