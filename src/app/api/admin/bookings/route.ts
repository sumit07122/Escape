export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';



export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const busId = searchParams.get('busId') || '';

    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.bookingStatus = status;
    }

    if (busId && busId !== 'ALL') {
      where.busId = busId;
    }

    if (search) {
      where.OR = [
        { bookingId: { contains: search } },
        { primaryTravellerName: { contains: search } },
        { primaryPhone: { contains: search } },
        { primaryEmail: { contains: search } },
      ];
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        travellers: {
          include: { ticket: true },
        },
        bus: true,
        package: true,
        payments: true,
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, bookingStatus, paymentStatus, notes, remainingBalancePaid } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({ where: { bookingId } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (bookingStatus) updateData.bookingStatus = bookingStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    if (remainingBalancePaid) {
      const paidAmount = Number(remainingBalancePaid);
      updateData.remainingBalance = Math.max(0, booking.remainingBalance - paidAmount);
      if (updateData.remainingBalance === 0) {
        updateData.paymentStatus = 'PAID';
      }
    }

    const updated = await db.booking.update({
      where: { id: booking.id },
      data: updateData,
    });

    await createAuditLog({
      action: 'ADMIN_BOOKING_UPDATE',
      entityType: 'BOOKING',
      entityId: booking.id,
      bookingId,
      performedBy: `Admin: ${admin.name} (${admin.email})`,
      newValue: JSON.stringify(updateData),
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
