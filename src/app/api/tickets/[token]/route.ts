import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const ticket = await db.ticket.findFirst({
      where: {
        OR: [
          { qrToken: token },
          { ticketNumber: token.toUpperCase() },
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

    return NextResponse.json({
      ticket: {
        ...ticket,
        qrDataUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}
