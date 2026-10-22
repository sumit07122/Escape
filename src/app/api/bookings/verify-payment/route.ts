import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { generateTicketQrToken, generateTicketNumber } from '@/lib/qr';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing payment verification credentials' }, { status: 400 });
    }

    // 1. Verify Razorpay Signature server-side
    const isSignatureValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature || ''
    );

    if (!isSignatureValid) {
      await createAuditLog({
        action: 'PAYMENT_SIGNATURE_FAILED',
        entityType: 'PAYMENT',
        entityId: razorpayOrderId,
        bookingId,
        metadata: { razorpayOrderId, razorpayPaymentId },
      });
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    // 2. Fetch booking
    const booking = await db.booking.findUnique({
      where: { bookingId },
      include: {
        travellers: true,
        bus: true,
        package: true,
        payments: true,
        tickets: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // If already confirmed, return current details
    if (booking.bookingStatus === 'CONFIRMED') {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        bookingId: booking.bookingId,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        tickets: booking.tickets,
        booking,
      });
    }

    // 3. Atomically confirm booking and seats in transaction
    const confirmationResult = await db.$transaction(async (tx) => {
      // Confirm each seat
      for (const traveller of booking.travellers) {
        if (!traveller.assignedSeatNumber || !booking.busId) continue;

        const seat = await tx.busSeat.findUnique({
          where: {
            busId_seatNumber: {
              busId: booking.busId,
              seatNumber: traveller.assignedSeatNumber,
            },
          },
          include: { seatHold: true, seatBooking: true },
        });

        if (!seat) {
          throw new Error(`Seat ${traveller.assignedSeatNumber} not found on Bus`);
        }

        // If seat was already booked by someone else, abort!
        if (seat.seatBooking && seat.seatBooking.bookingId !== booking.id) {
          throw new Error(`Double-booking prevented: Seat ${seat.seatNumber} is already confirmed by another booking.`);
        }

        // Convert seat to BOOKED
        await tx.busSeat.update({
          where: { id: seat.id },
          data: {
            status: 'BOOKED',
            isAvailable: false,
          },
        });

        // Upsert SeatBooking
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

        // Release/clean the temporary hold
        if (seat.seatHold) {
          await tx.seatHold.update({
            where: { id: seat.seatHold.id },
            data: { status: 'CONVERTED' },
          });
        }

        // Generate Digital QR Ticket for this traveller
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

        await tx.traveller.update({
          where: { id: traveller.id },
          data: {
            assignedBusNumber: booking.bus?.busNumber || 'Bus 01',
          },
        });
      }

      // Update payment record
      await tx.payment.updateMany({
        where: {
          bookingId: booking.id,
          razorpayOrderId,
        },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: 'PAID',
          verifiedAt: new Date(),
        },
      });

      // Update booking to CONFIRMED
      const confirmedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'PAID',
          bookingStatus: 'CONFIRMED',
        },
        include: {
          travellers: {
            include: { ticket: true },
          },
          bus: true,
          package: true,
          tickets: true,
        },
      });

      // Queue confirmation notification
      await tx.notification.create({
        data: {
          recipient: booking.primaryEmail,
          channel: 'EMAIL',
          type: 'BOOKING_CONFIRMATION',
          title: `Confirmed: GLA Himalayan Escape [${booking.bookingId}]`,
          message: `Dear ${booking.primaryTravellerName}, your reservation for Manali x Kasol is confirmed! Bus: ${booking.bus?.busNumber}, Seat(s): ${booking.travellers.map((t) => t.assignedSeatNumber).join(', ')}.`,
          status: 'QUEUED',
        },
      });

      return {
        confirmedBooking,
        bookingDbId: booking.id,
        bookingId: booking.bookingId,
        reservationAmount: booking.reservationAmount,
      };
    }, { timeout: 15000, maxWait: 10000 });

    // Audit Log asynchronously outside transaction
    createAuditLog({
      action: 'PAYMENT_CONFIRMED',
      entityType: 'BOOKING',
      entityId: confirmationResult.bookingDbId,
      bookingId: confirmationResult.bookingId,
      performedBy: `Razorpay: ${razorpayPaymentId}`,
      newValue: `CONFIRMED - ₹${confirmationResult.reservationAmount} received`,
    }).catch((e) => console.error('Audit log error:', e));

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed and seats locked successfully!',
      booking: confirmationResult.confirmedBooking,
    });
  } catch (error: unknown) {
    console.error('Payment confirmation error:', error);
    const message = error instanceof Error ? error.message : 'Payment confirmation failed';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
