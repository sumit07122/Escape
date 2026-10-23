export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';
import { canAccessBooking, getAdminSessionFromRequest, getUserSessionFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingIdentifier } = await params;
    const { searchParams } = new URL(request.url);
    const verifyEmail = searchParams.get('email');
    const verifyPhone = searchParams.get('phone');

    const booking = await db.booking.findFirst({
      where: {
        OR: [
          { id: bookingIdentifier },
          { bookingId: bookingIdentifier.toUpperCase() },
        ],
      },
      include: {
        travellers: {
          include: {
            ticket: true,
          },
        },
        bus: true,
        package: true,
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Server-side ownership / authorization check:
    // 1. Admin session has full access
    const admin = await getAdminSessionFromRequest(request);
    let isAuthorized = !!admin;

    // 2. Customer user session
    if (!isAuthorized) {
      const user = await getUserSessionFromRequest(request);
      if (user) {
        if (booking.userId && user.id === booking.userId) isAuthorized = true;
        if (user.email.toLowerCase().trim() === booking.primaryEmail.toLowerCase().trim()) isAuthorized = true;
      }
    }

    // 3. Email / Phone lookup verification (for manual ticket lookup form)
    if (!isAuthorized && verifyEmail) {
      if (verifyEmail.toLowerCase().trim() === booking.primaryEmail.toLowerCase().trim()) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized && verifyPhone) {
      const cleanInput = verifyPhone.replace(/[^0-9]/g, '');
      const cleanStored = booking.primaryPhone.replace(/[^0-9]/g, '');
      if (cleanInput && cleanStored && cleanInput.slice(-10) === cleanStored.slice(-10)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have permission to view this booking' },
        { status: 403 }
      );
    }

    // Generate QR code data URLs for all tickets
    const travellersWithQr = await Promise.all(
      booking.travellers.map(async (t) => {
        let qrDataUrl = '';
        if (t.ticket?.qrToken) {
          try {
            const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${t.ticket.qrToken}`;
            qrDataUrl = await QRCode.toDataURL(verifyUrl, {
              width: 300,
              margin: 2,
              color: { dark: '#0D2B1D', light: '#FFFFFF' },
            });
          } catch {
            // Fallback
          }
        }
        return {
          ...t,
          ticket: t.ticket ? { ...t.ticket, qrDataUrl } : null,
        };
      })
    );

    return NextResponse.json({
      booking: {
        ...booking,
        travellers: travellersWithQr,
      },
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
