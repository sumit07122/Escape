export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';
import { getCurrentAdmin } from '@/lib/server-utils';
import { canAccessBooking } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const cleanToken = (token || '').trim();

    if (!cleanToken) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const isQrToken = /^[0-9a-f]{32}$/i.test(cleanToken);

    // If searching by sequential/predictable ticketNumber, require authentication
    const admin = await getCurrentAdmin();

    const ticket = await db.ticket.findFirst({
      where: {
        OR: [
          { qrToken: cleanToken },
          { ticketNumber: cleanToken.toUpperCase() },
        ],
      },
      include: {
        traveller: true,
        booking: {
          include: {
            bus: true,
            package: true,
          },
        },
        checkIns: {
          orderBy: { checkInTime: 'desc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found or invalid QR token' }, { status: 404 });
    }

    // Check ownership authorization
    let isAuthorized = !!admin;
    if (!isAuthorized && ticket.booking) {
      isAuthorized = await canAccessBooking(request, ticket.booking);
    }

    // Prevent IDOR: unauthenticated public callers cannot query by predictable ticketNumber
    if (!isQrToken && !isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Ticket number lookup requires authentication' },
        { status: 403 }
      );
    }

    let qrDataUrl = '';
    try {
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${ticket.qrToken}`;
      qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#0D2B1D', light: '#FFFFFF' },
      });
    } catch {
      // Fallback
    }

    // If authorized as admin or booking owner, return full record
    if (isAuthorized) {
      return NextResponse.json({
        ticket: {
          ...ticket,
          qrDataUrl,
        },
      });
    }

    // For public verification scans using the unguessable 32-char qrToken,
    // return only sanitized operational verification data (zero PII exposure)
    return NextResponse.json({
      ticket: {
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        checkInTime: ticket.checkInTime,
        issuedAt: ticket.issuedAt,
        traveller: {
          fullName: ticket.traveller?.fullName,
          assignedSeatNumber: ticket.traveller?.assignedSeatNumber,
          assignedBusNumber: ticket.traveller?.assignedBusNumber,
          checkInStatus: ticket.traveller?.checkInStatus,
        },
        booking: {
          bookingId: ticket.booking?.bookingId,
          bookingStatus: ticket.booking?.bookingStatus,
          bus: ticket.booking?.bus
            ? {
                busNumber: ticket.booking.bus.busNumber,
                vehicleName: ticket.booking.bus.vehicleName,
              }
            : null,
        },
        qrDataUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}
