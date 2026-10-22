import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ticketId, qrToken, notes } = body;

    if (!ticketId && !qrToken) {
      return NextResponse.json({ error: 'Ticket ID or QR token required' }, { status: 400 });
    }

    const ticket = await db.ticket.findFirst({
      where: ticketId ? { id: ticketId } : { qrToken },
      include: {
        traveller: true,
        booking: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.status === 'CHECKED_IN' && ticket.traveller?.checkInStatus === 'CHECKED_IN') {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        checkInTime: ticket.checkInTime,
        message: 'Traveller is already checked in',
      });
    }

    const now = new Date();
    const adminName = admin.name || admin.email;

    await db.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'CHECKED_IN',
          checkInTime: now,
        },
      });

      if (ticket.travellerId) {
        await tx.traveller.update({
          where: { id: ticket.travellerId },
          data: {
            checkInStatus: 'CHECKED_IN',
            checkedInAt: now,
          },
        });
      }

      await tx.checkIn.create({
        data: {
          ticketId: ticket.id,
          bookingId: ticket.bookingId,
          adminName,
          location: 'GLA University, Mathura Campus',
          checkInTime: now,
          notes,
        },
      });
    }, { timeout: 15000, maxWait: 10000 });

    // Asynchronously log outside transaction
    createAuditLog({
      action: 'TRAVELLER_CHECKED_IN',
      entityType: 'TICKET',
      entityId: ticket.id,
      bookingId: ticket.booking.bookingId,
      performedBy: `Admin: ${adminName}`,
      newValue: `CHECKED IN at ${now.toISOString()}`,
    }).catch((e) => console.error('Audit log error:', e));

    return NextResponse.json({
      success: true,
      message: `Successfully checked in ${ticket.traveller?.fullName || 'traveller'}!`,
      checkInTime: now.toISOString(),
      adminName,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 });
  }
}
