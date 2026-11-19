export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditLog, getCurrentAdmin } from '@/lib/server-utils';
import { canAccessBooking } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingSessionId, busId, seatNumbers, bookingId } = body;

    const admin = await getCurrentAdmin();

    if (!admin && !bookingSessionId && !bookingId) {
      return NextResponse.json(
        { error: 'bookingSessionId or authenticated session is required' },
        { status: 400 }
      );
    }

    // Verify ownership before allowing cancellation of a pending booking
    if (bookingId) {
      const targetBooking = await db.booking.findUnique({
        where: { bookingId },
        select: { id: true, primaryEmail: true, primaryPhone: true, userId: true, primaryTravellerName: true, bookingStatus: true },
      });

      if (targetBooking && targetBooking.bookingStatus === 'PENDING') {
        let isAuthorized = !!admin;
        if (!isAuthorized) {
          isAuthorized = await canAccessBooking(request, targetBooking);
        }
        if (!isAuthorized && bookingSessionId) {
          const sessionHold = await db.seatHold.findFirst({
            where: {
              bookingSessionId,
              status: 'ACTIVE',
            },
          });
          if (sessionHold) isAuthorized = true;
        }

        if (!isAuthorized) {
          return NextResponse.json(
            { error: 'Unauthorized: You do not have permission to cancel this booking' },
            { status: 403 }
          );
        }
      }
    }

    const releasedHolds = await db.$transaction(async (tx) => {
      // 1. Identify active holds owned by this session (or any if admin)
      const whereCondition: any = {
        status: 'ACTIVE',
      };

      if (!admin || bookingSessionId) {
        whereCondition.bookingSessionId = bookingSessionId;
      }

      if (busId && seatNumbers && Array.isArray(seatNumbers)) {
        whereCondition.busSeat = {
          busId,
          seatNumber: { in: seatNumbers },
        };
      }

      const holds = await tx.seatHold.findMany({
        where: whereCondition,
        include: {
          busSeat: {
            include: { seatBooking: true },
          },
        },
      });

      const seatIdsToRelease: string[] = [];
      const holdIds: string[] = [];

      for (const hold of holds) {
        holdIds.push(hold.id);
        // Only revert seat to AVAILABLE if it is not confirmed by another booking
        if (
          hold.busSeat &&
          hold.busSeat.status !== 'BOOKED' &&
          !hold.busSeat.seatBooking
        ) {
          seatIdsToRelease.push(hold.busSeat.id);
        }
      }

      // 2. Mark holds as RELEASED
      if (holdIds.length > 0) {
        await tx.seatHold.updateMany({
          where: { id: { in: holdIds } },
          data: { status: 'RELEASED' },
        });
      }

      // 3. Revert bus seats to AVAILABLE
      if (seatIdsToRelease.length > 0) {
        await tx.busSeat.updateMany({
          where: { id: { in: seatIdsToRelease } },
          data: {
            status: 'AVAILABLE',
            isAvailable: true,
          },
        });
      }

      // 4. If bookingId provided and booking is still PENDING, mark as CANCELLED
      if (bookingId) {
        const booking = await tx.booking.findUnique({
          where: { bookingId },
        });

        if (booking && booking.bookingStatus === 'PENDING') {
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              bookingStatus: 'CANCELLED',
              paymentStatus: 'CANCELLED',
            },
          });

          await tx.payment.updateMany({
            where: { bookingId: booking.id, status: 'PENDING' },
            data: { status: 'CANCELLED' },
          });
        }
      }

      return holds;
    });

    if (releasedHolds.length > 0) {
      await createAuditLog({
        action: 'SEATS_RELEASED_ABANDONED_CHECKOUT',
        entityType: 'SEAT',
        entityId: bookingSessionId || bookingId || 'batch',
        bookingId: bookingId || undefined,
        performedBy: 'Checkout Modal Dismissal',
        newValue: `Released ${releasedHolds.length} seat holds due to cancelled/dismissed checkout`,
      });
    }

    return NextResponse.json({
      success: true,
      releasedCount: releasedHolds.length,
      message: 'Temporary seat holds released successfully',
    });
  } catch (error) {
    console.error('Error in /api/seats/release-batch:', error);
    return NextResponse.json(
      { error: 'Failed to release abandoned seats' },
      { status: 500 }
    );
  }
}
