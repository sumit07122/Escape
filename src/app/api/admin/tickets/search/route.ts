export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    const travellers = await db.traveller.findMany({
      where: {
        booking: {
          bookingStatus: 'CONFIRMED',
        },
        ...(query
          ? {
              OR: [
                { fullName: { contains: query, mode: 'insensitive' } },
                { rollNumber: { contains: query, mode: 'insensitive' } },
                { collegeId: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } },
                { assignedSeatNumber: { contains: query, mode: 'insensitive' } },
                { assignedBusNumber: { contains: query, mode: 'insensitive' } },
                { ticket: { qrToken: { contains: query, mode: 'insensitive' } } },
                { ticket: { ticketNumber: { contains: query, mode: 'insensitive' } } },
                { booking: { bookingId: { contains: query, mode: 'insensitive' } } },
                { booking: { primaryPhone: { contains: query } } },
              ],
            }
          : {}),
      },
      include: {
        ticket: true,
        booking: {
          include: {
            bus: true,
          },
        },
      },
      orderBy: [
        { checkInStatus: 'asc' }, // PENDING first, then CHECKED_IN
        { fullName: 'asc' },
      ],
      take: query ? 30 : 15,
    });

    const results = travellers.map((t) => ({
      travellerId: t.id,
      ticketId: t.ticket?.id || null,
      ticketNumber: t.ticket?.ticketNumber || 'TKT-PENDING',
      qrToken: t.ticket?.qrToken || null,
      fullName: t.fullName,
      rollNumber: t.rollNumber || t.collegeId || 'N/A',
      phone: t.phone,
      busNumber: t.assignedBusNumber || t.booking.bus?.busNumber || 'Bus 01',
      seatNumber: t.assignedSeatNumber || 'Unassigned',
      checkInStatus: t.checkInStatus,
      checkedInAt: t.checkedInAt?.toISOString() || null,
      bookingId: t.booking.bookingId,
      remainingBalance: t.booking.remainingBalance,
    }));

    return NextResponse.json({ success: true, count: results.length, travellers: results });
  } catch (error: unknown) {
    console.error('Error searching travellers:', error);
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
