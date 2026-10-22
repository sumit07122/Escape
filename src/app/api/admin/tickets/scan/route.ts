import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { qrData } = body;

    if (!qrData || typeof qrData !== 'string') {
      return NextResponse.json({ error: 'QR token data is required' }, { status: 400 });
    }

    qrData = qrData.trim();
    // If QR data is a full URL like http://.../verify/GHE-VERIFY-XXXX
    let token = qrData;
    if (qrData.includes('/verify/')) {
      token = qrData.split('/verify/')[1]?.split('?')[0] || qrData;
    }

    const ticket = await db.ticket.findFirst({
      where: {
        OR: [
          { qrToken: token },
          { ticketNumber: token.toUpperCase() },
          { booking: { bookingId: token.toUpperCase() } },
        ],
      },
      include: {
        traveller: true,
        booking: {
          include: {
            bus: true,
            package: true,
            payments: true,
          },
        },
        checkIns: {
          orderBy: { checkInTime: 'desc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        error: 'INVALID / UNKNOWN TICKET: No matching registration found in database.',
      }, { status: 404 });
    }

    const isConfirmed = ticket.booking.bookingStatus === 'CONFIRMED';
    const isPaid = ticket.booking.paymentStatus === 'PAID';
    const isCheckedIn = ticket.status === 'CHECKED_IN' || ticket.traveller?.checkInStatus === 'CHECKED_IN';

    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        qrToken: ticket.qrToken,
        status: ticket.status,
        isCheckedIn,
        checkInTime: ticket.checkInTime || ticket.checkIns[0]?.checkInTime || null,
        traveller: ticket.traveller
          ? {
              id: ticket.traveller.id,
              fullName: ticket.traveller.fullName,
              phone: ticket.traveller.phone,
              email: ticket.traveller.email,
              gender: ticket.traveller.gender,
              assignedSeatNumber: ticket.traveller.assignedSeatNumber,
              assignedBusNumber: ticket.traveller.assignedBusNumber,
              emergencyContactName: ticket.traveller.emergencyContactName,
              emergencyContactPhone: ticket.traveller.emergencyContactPhone,
              isFreeGroupTraveller: ticket.traveller.isFreeGroupTraveller,
            }
          : null,
        booking: {
          bookingId: ticket.booking.bookingId,
          package: ticket.booking.package.name,
          busNumber: ticket.booking.bus?.busNumber || 'Bus 01',
          vehicleName: ticket.booking.bus?.vehicleName,
          vehicleNumber: ticket.booking.bus?.vehicleNumber,
          bookingStatus: ticket.booking.bookingStatus,
          paymentStatus: ticket.booking.paymentStatus,
          reservationPaid: ticket.booking.reservationAmount,
          remainingBalance: ticket.booking.remainingBalance,
          finalAmount: ticket.booking.finalAmount,
          isConfirmed,
          isPaid,
        },
      },
    });
  } catch (error) {
    console.error('QR scan error:', error);
    return NextResponse.json({ error: 'QR verification failed' }, { status: 500 });
  }
}
