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
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const busId = searchParams.get('busId') || '';
    const checkInStatus = searchParams.get('checkInStatus') || '';
    const sort = searchParams.get('sort') === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.bookingStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (busId && busId !== 'ALL') {
      where.busId = busId;
    }

    if (checkInStatus && checkInStatus !== 'ALL') {
      if (checkInStatus === 'CHECKED_IN') {
        where.travellers = {
          some: { checkInStatus: 'CHECKED_IN' },
        };
      } else if (checkInStatus === 'PENDING') {
        where.travellers = {
          some: { checkInStatus: 'PENDING' },
        };
      }
    }

    if (search) {
      where.OR = [
        { bookingId: { contains: search, mode: 'insensitive' } },
        { primaryTravellerName: { contains: search, mode: 'insensitive' } },
        { primaryPhone: { contains: search } },
        { primaryEmail: { contains: search, mode: 'insensitive' } },
        {
          travellers: {
            some: {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
                { assignedSeatNumber: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: sort },
      include: {
        travellers: {
          include: {
            ticket: true,
            seatBooking: {
              include: {
                busSeat: true,
              },
            },
          },
        },
        bus: true,
        package: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Also get buses list for filter dropdown
    const buses = await db.bus.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, busNumber: true, vehicleName: true },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({
      success: true,
      totalCount: bookings.length,
      bookings,
      buses,
    });
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

    const booking = await db.booking.findUnique({
      where: { bookingId },
      include: {
        seatBookings: true,
        travellers: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (bookingStatus) updateData.bookingStatus = bookingStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    if (remainingBalancePaid !== undefined && remainingBalancePaid !== null) {
      const paidAmount = Number(remainingBalancePaid);
      if (!isNaN(paidAmount) && paidAmount > 0) {
        updateData.remainingBalance = Math.max(0, booking.remainingBalance - paidAmount);
        if (updateData.remainingBalance === 0) {
          updateData.paymentStatus = 'PAID';
        }
      }
    }

    const adminIdentity = admin.name ? `Admin: ${admin.name} (${admin.email})` : `Admin: ${admin.email}`;

    // Handle cancellation seat release atomically
    if (bookingStatus === 'CANCELLED') {
      const seatIds = booking.seatBookings.map((sb) => sb.busSeatId);

      await db.$transaction(async (tx) => {
        // 1. Update booking
        await tx.booking.update({
          where: { id: booking.id },
          data: updateData,
        });

        // 2. Mark seat bookings as cancelled
        if (booking.seatBookings.length > 0) {
          await tx.seatBooking.updateMany({
            where: { bookingId: booking.id },
            data: { status: 'CANCELLED' },
          });
        }

        // 3. Free bus seats
        if (seatIds.length > 0) {
          await tx.busSeat.updateMany({
            where: { id: { in: seatIds } },
            data: { status: 'AVAILABLE', isAvailable: true },
          });
        }

        // 4. Cancel tickets
        await tx.ticket.updateMany({
          where: { bookingId: booking.id },
          data: { status: 'CANCELLED' },
        });
      });
    } else {
      // Normal booking update
      await db.booking.update({
        where: { id: booking.id },
        data: updateData,
      });
    }

    await createAuditLog({
      action: bookingStatus === 'CANCELLED' ? 'BOOKING_CANCELLED' : 'ADMIN_BOOKING_UPDATE',
      entityType: 'BOOKING',
      entityId: booking.id,
      bookingId,
      performedBy: adminIdentity,
      oldValue: JSON.stringify({
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        remainingBalance: booking.remainingBalance,
      }),
      newValue: JSON.stringify(updateData),
    });

    const refreshedBooking = await db.booking.findUnique({
      where: { bookingId },
      include: {
        travellers: {
          include: {
            ticket: true,
            seatBooking: {
              include: {
                busSeat: true,
              },
            },
          },
        },
        bus: true,
        package: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, booking: refreshedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
