export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUtrFormat } from '@/lib/upi-gateway';
import { generateTicketQrToken, generateTicketNumber } from '@/lib/qr';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, orderId, utr } = body;

    if (!bookingId || !orderId || !utr) {
      return NextResponse.json(
        { error: 'Missing booking ID, order reference, or 12-digit UTR number' },
        { status: 400 }
      );
    }

    const cleanUtr = String(utr).trim();

    // 1. Validate 12-Digit UTR format
    if (!verifyUtrFormat(cleanUtr)) {
      return NextResponse.json(
        { error: 'Invalid UTR format. Please enter the exact 12-digit UPI Reference Number / Transaction ID shown on your payment receipt.' },
        { status: 400 }
      );
    }

    // 2. Fetch booking with payments and travellers
    const booking = await db.booking.findUnique({
      where: { bookingId },
      include: {
        travellers: true,
        bus: true,
        payments: true,
        tickets: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // If already confirmed, return success immediately (idempotent)
    if (booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID') {
      const existingTicket = booking.tickets[0];
      return NextResponse.json({
        success: true,
        message: 'Booking is already confirmed',
        bookingId: booking.bookingId,
        ticketToken: existingTicket?.qrToken || null,
        booking,
      });
    }

    // 3. Prevent duplicate UTR replay attacks across the entire platform
    const duplicatePayment = await db.payment.findFirst({
      where: {
        razorpayPaymentId: cleanUtr,
        status: 'PAID',
        bookingId: { not: booking.id },
      },
    });

    if (duplicatePayment) {
      await createAuditLog({
        action: 'PAYMENT_UTR_REPLAY_REJECTED',
        entityType: 'PAYMENT',
        entityId: cleanUtr,
        bookingId: booking.bookingId,
        performedBy: booking.primaryEmail || 'STUDENT',
        newValue: `Attempted reuse of existing UTR ${cleanUtr} from another booking.`,
      });

      return NextResponse.json(
        { error: 'This UTR has already been submitted for another booking. Please check your bank receipt or contact coordinator.' },
        { status: 409 }
      );
    }

    // 4. Verify payment order reference matches this booking
    const matchingPayment = booking.payments.find((p) => p.razorpayOrderId === orderId);
    if (!matchingPayment) {
      return NextResponse.json(
        { error: 'Payment order reference mismatch for this booking.' },
        { status: 400 }
      );
    }

    // 5. Execute Atomic Confirmation Transaction
    const confirmedBooking = await db.$transaction(async (tx) => {
      // A. Update Payment status to PAID
      await tx.payment.update({
        where: { id: matchingPayment.id },
        data: {
          razorpayPaymentId: cleanUtr,
          razorpaySignature: 'UPI_UTR_AUTO_VERIFIED',
          status: 'PAID',
        },
      });

      // B. Update Booking status to CONFIRMED
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'PAID',
          bookingStatus: 'CONFIRMED',
        },
        include: {
          travellers: true,
          bus: true,
          payments: true,
        },
      });

      // C. Convert seat holds to permanent seat bookings
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
          // Release temporary hold
          await tx.seatHold.deleteMany({
            where: { busSeatId: busSeat.id },
          });

          // Lock permanent seat booking
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

          // Set seat status to BOOKED
          await tx.busSeat.update({
            where: { id: busSeat.id },
            data: { status: 'BOOKED' },
          });
        }
      }

      // D. Generate secure digital QR boarding passes for all travellers
      const createdTickets = [];
      for (const traveller of booking.travellers) {
        const qrToken = generateTicketQrToken();
        const ticketNumber = generateTicketNumber();

        const ticket = await tx.ticket.create({
          data: {
            ticketNumber,
            bookingId: booking.id,
            travellerId: traveller.id,
            qrToken,
            status: 'ACTIVE',
          },
        });
        createdTickets.push(ticket);
      }

      return { ...updatedBooking, tickets: createdTickets };
    });

    // 6. Audit log
    await createAuditLog({
      action: 'UPI_PAYMENT_CONFIRMED',
      entityType: 'BOOKING',
      entityId: booking.id,
      bookingId: booking.bookingId,
      performedBy: `Traveller UTR: ${cleanUtr}`,
      newValue: `Confirmed booking for ${booking.travellersCount} travellers. Deposit: ₹${matchingPayment.amount} confirmed via UTR ${cleanUtr}.`,
      metadata: { orderId, utr: cleanUtr, amount: matchingPayment.amount },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully. Boarding pass issued.',
      bookingId: confirmedBooking.bookingId,
      ticketToken: confirmedBooking.tickets?.[0]?.qrToken || null,
      booking: confirmedBooking,
    });
  } catch (error: any) {
    console.error('[API_BOOKINGS_VERIFY_UPI_UTR_ERROR]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify UPI transaction' },
      { status: 500 }
    );
  }
}
