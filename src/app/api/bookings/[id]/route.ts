import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingIdentifier } = await params;

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
        groupBooking: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Generate QR code data URLs for all tickets
    const travellersWithQr = await Promise.all(
      booking.travellers.map(async (t) => {
        let qrDataUrl = '';
        if (t.ticket?.qrToken) {
          try {
            // Encode verification URL with secure random token
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
