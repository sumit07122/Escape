export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized coordinator session' }, { status: 401 });
    }

    const travellers = await db.traveller.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            bookingId: true,
            bookingStatus: true,
            paymentStatus: true,
            totalAmount: true,
            reservationAmount: true,
            finalAmount: true,
            remainingBalance: true,
            primaryPhone: true,
            primaryEmail: true,
          },
        },
        seatBooking: {
          include: {
            busSeat: {
              include: {
                bus: {
                  select: { id: true, busNumber: true, vehicleName: true },
                },
              },
            },
          },
        },
        ticket: {
          select: { id: true, ticketNumber: true, qrToken: true, status: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      travellers: travellers.map((t) => ({
        id: t.id,
        fullName: t.fullName,
        phone: t.phone,
        email: t.email,
        gender: t.gender,
        rollNumber: t.rollNumber || t.collegeId || '',
        emergencyContactName: t.emergencyContactName || '',
        emergencyContactPhone: t.emergencyContactPhone || '',
        assignedBusNumber: t.seatBooking?.busSeat?.bus?.busNumber || t.assignedBusNumber || 'Unassigned',
        assignedSeatNumber: t.seatBooking?.busSeat?.seatNumber || t.assignedSeatNumber || 'Unassigned',
        busId: t.seatBooking?.busSeat?.busId || null,
        seatId: t.seatBooking?.busSeatId || null,
        checkInStatus: t.checkInStatus || 'PENDING',
        checkedInAt: t.checkedInAt,
        bookingId: t.booking?.bookingId || '',
        bookingDbId: t.booking?.id || '',
        bookingStatus: t.booking?.bookingStatus || 'CONFIRMED',
        paymentStatus: t.booking?.paymentStatus || 'PENDING',
        totalAmount: t.booking?.totalAmount || 6200,
        reservationAmount: t.booking?.reservationAmount || 1000,
        remainingBalance: t.booking?.remainingBalance || 5200,
        ticketToken: t.ticket?.qrToken || null,
        ticketNumber: t.ticket?.ticketNumber || null,
      })),
    });
  } catch (error) {
    console.error('[API_ADMIN_GET_TRAVELLERS_ERROR]:', error);
    return NextResponse.json({ error: 'Failed to fetch manifest' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminSessionFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized coordinator session' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, travellerId, data } = body;

    if (!travellerId || !action) {
      return NextResponse.json({ error: 'travellerId and action are required' }, { status: 400 });
    }

    const traveller = await db.traveller.findUnique({
      where: { id: travellerId },
      include: {
        booking: true,
        seatBooking: { include: { busSeat: { include: { bus: true } } } },
        ticket: true,
      },
    });

    if (!traveller) {
      return NextResponse.json({ error: 'Traveller not found' }, { status: 404 });
    }

    const now = new Date();
    const adminName = admin.name || admin.email;

    // 1. ACTION: CHECK_IN or TOGGLE_CHECKIN
    if (action === 'TOGGLE_CHECKIN') {
      const isCurrentlyCheckedIn = traveller.checkInStatus === 'CHECKED_IN';
      const newStatus = isCurrentlyCheckedIn ? 'PENDING' : 'CHECKED_IN';

      await db.traveller.update({
        where: { id: travellerId },
        data: {
          checkInStatus: newStatus,
          checkedInAt: newStatus === 'CHECKED_IN' ? now : null,
        },
      });

      if (traveller.ticket) {
        await db.ticket.update({
          where: { id: traveller.ticket.id },
          data: {
            status: newStatus === 'CHECKED_IN' ? 'CHECKED_IN' : 'VALID',
            checkInTime: newStatus === 'CHECKED_IN' ? now : null,
          },
        });
      }

      await createAuditLog({
        action: newStatus === 'CHECKED_IN' ? 'TRAVELLER_GATE_CHECKIN' : 'TRAVELLER_CHECKIN_REVERTED',
        entityType: 'TRAVELLER',
        entityId: travellerId,
        performedBy: `Admin: ${adminName}`,
        newValue: `Status changed to ${newStatus}`,
      });

      return NextResponse.json({
        success: true,
        message: `${traveller.fullName} marked as ${newStatus === 'CHECKED_IN' ? 'Gate Checked-In' : 'Not Checked-In'}`,
        checkInStatus: newStatus,
      });
    }

    // 2. ACTION: COLLECT_BALANCE_AND_CHECKIN
    if (action === 'COLLECT_BALANCE_AND_CHECKIN') {
      await db.$transaction(async (tx) => {
        // Mark traveller checked in
        await tx.traveller.update({
          where: { id: travellerId },
          data: {
            checkInStatus: 'CHECKED_IN',
            checkedInAt: now,
          },
        });

        // Mark ticket checked in
        if (traveller.ticket) {
          await tx.ticket.update({
            where: { id: traveller.ticket.id },
            data: {
              status: 'CHECKED_IN',
              checkInTime: now,
            },
          });
        }

        // Update booking remainingBalance to 0 and paymentStatus to PAID
        await tx.booking.update({
          where: { id: traveller.bookingId },
          data: {
            remainingBalance: 0,
            paymentStatus: 'PAID',
          },
        });

        // Create gate payment entry
        await tx.payment.create({
          data: {
            bookingId: traveller.bookingId,
            razorpayOrderId: `gate_cash_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            razorpayPaymentId: `gate_collected_by_${admin.email.split('@')[0]}`,
            amount: traveller.booking.remainingBalance || 5200,
            currency: 'INR',
            paymentType: 'REMAINING_BALANCE',
            status: 'PAID',
            verifiedAt: now,
            payload: JSON.stringify({ collectedBy: adminName, mode: 'GATE_CASH_UPI' }),
          },
        });
      });

      await createAuditLog({
        action: 'GATE_BALANCE_COLLECTED',
        entityType: 'BOOKING',
        entityId: traveller.bookingId,
        performedBy: `Admin: ${adminName}`,
        newValue: `Collected ₹${traveller.booking.remainingBalance} & Gate Checked-In`,
      });

      return NextResponse.json({
        success: true,
        message: `Gate balance collected (₹${traveller.booking.remainingBalance}) & ${traveller.fullName} Checked In!`,
      });
    }

    // 3. ACTION: EDIT_DETAILS
    if (action === 'EDIT_DETAILS') {
      const { fullName, phone, email, rollNumber, emergencyContactName, emergencyContactPhone } = data || {};

      const updated = await db.traveller.update({
        where: { id: travellerId },
        data: {
          ...(fullName && { fullName: String(fullName).trim() }),
          ...(phone && { phone: String(phone).trim() }),
          ...(email && { email: String(email).trim() }),
          ...(rollNumber !== undefined && {
            rollNumber: String(rollNumber).trim(),
            collegeId: String(rollNumber).trim(),
          }),
          ...(emergencyContactName !== undefined && { emergencyContactName: String(emergencyContactName).trim() }),
          ...(emergencyContactPhone !== undefined && { emergencyContactPhone: String(emergencyContactPhone).trim() }),
        },
      });

      await createAuditLog({
        action: 'TRAVELLER_INFO_UPDATED',
        entityType: 'TRAVELLER',
        entityId: travellerId,
        performedBy: `Admin: ${adminName}`,
        newValue: JSON.stringify(data),
      });

      return NextResponse.json({
        success: true,
        message: `Passenger details for ${updated.fullName} updated successfully`,
        traveller: updated,
      });
    }

    // 4. ACTION: CANCEL_BOOKING
    if (action === 'CANCEL_BOOKING') {
      await db.$transaction(async (tx) => {
        // Clear seat booking
        if (traveller.seatBooking) {
          await tx.busSeat.update({
            where: { id: traveller.seatBooking.busSeatId },
            data: { status: 'AVAILABLE', isAvailable: true, isBookable: true },
          });
          await tx.seatBooking.delete({ where: { id: traveller.seatBooking.id } });
        }

        // Cancel traveller ticket
        if (traveller.ticket) {
          await tx.ticket.update({
            where: { id: traveller.ticket.id },
            data: { status: 'CANCELLED' },
          });
        }

        // Update traveller
        await tx.traveller.update({
          where: { id: travellerId },
          data: {
            assignedSeatNumber: null,
            assignedBusNumber: null,
            checkInStatus: 'CANCELLED',
          },
        });

        // Update booking status
        await tx.booking.update({
          where: { id: traveller.bookingId },
          data: { bookingStatus: 'CANCELLED' },
        });
      });

      await createAuditLog({
        action: 'ADMIN_CANCELLED_PASSENGER',
        entityType: 'TRAVELLER',
        entityId: travellerId,
        performedBy: `Admin: ${adminName}`,
        newValue: `Booking ${traveller.booking.bookingId} cancelled and seat vacated`,
      });

      return NextResponse.json({
        success: true,
        message: `Booking for ${traveller.fullName} has been cancelled and seat released.`,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[API_ADMIN_UPDATE_TRAVELLER_ERROR]:', error);
    return NextResponse.json({ error: 'Failed to update passenger' }, { status: 500 });
  }
}
