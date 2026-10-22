import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { generateTicketQrToken, generateTicketNumber } from '@/lib/qr';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature if secret configured
    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity || event.payload?.order?.entity;
      const orderId = paymentEntity?.order_id || paymentEntity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const payment = await db.payment.findUnique({
          where: { razorpayOrderId: orderId },
          include: {
            booking: {
              include: {
                travellers: true,
                bus: true,
              },
            },
          },
        });

        if (payment && payment.booking && payment.booking.bookingStatus !== 'CONFIRMED') {
          const booking = payment.booking;

          // Confirm seats and booking
          await db.$transaction(async (tx) => {
            for (const traveller of booking.travellers) {
              if (!traveller.assignedSeatNumber || !booking.busId) continue;

              const seat = await tx.busSeat.findUnique({
                where: {
                  busId_seatNumber: {
                    busId: booking.busId,
                    seatNumber: traveller.assignedSeatNumber,
                  },
                },
              });

              if (seat) {
                await tx.busSeat.update({
                  where: { id: seat.id },
                  data: { status: 'BOOKED', isAvailable: false },
                });

                await tx.seatBooking.upsert({
                  where: { busSeatId: seat.id },
                  update: { bookingId: booking.id, travellerId: traveller.id, status: 'CONFIRMED' },
                  create: { busSeatId: seat.id, bookingId: booking.id, travellerId: traveller.id, status: 'CONFIRMED' },
                });

                const qrToken = generateTicketQrToken();
                const ticketNumber = generateTicketNumber();

                await tx.ticket.upsert({
                  where: { travellerId: traveller.id },
                  update: { status: 'VALID' },
                  create: {
                    ticketNumber,
                    bookingId: booking.id,
                    travellerId: traveller.id,
                    qrToken,
                    status: 'VALID',
                  },
                });
              }
            }

            await tx.payment.update({
              where: { id: payment.id },
              data: {
                razorpayPaymentId: paymentId,
                status: 'PAID',
                verifiedAt: new Date(),
              },
            });

            await tx.booking.update({
              where: { id: booking.id },
              data: {
                paymentStatus: 'PAID',
                bookingStatus: 'CONFIRMED',
              },
            });

            await createAuditLog({
              action: 'WEBHOOK_PAYMENT_CONFIRMED',
              entityType: 'PAYMENT',
              entityId: payment.id,
              bookingId: booking.bookingId,
              performedBy: 'Razorpay Webhook',
            });
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
