import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingSessionId, busId, seatNumbers, bookingId } = body;

    if (!bookingSessionId && !bookingId && (!busId || !seatNumbers)) {
      return NextResponse.json(
        { error: 'bookingSessionId or bookingId or busId/seatNumbers required' },
        { status: 400 }
      );
    }

    const releasedHolds = await db.$transaction(async (tx) => {
      // 1. Identify active holds
      const holds = await tx.seatHold.findMany({
        where: {
          OR: [
            ...(bookingSessionId ? [{ bookingSessionId, status: 'ACTIVE' }] : []),
            ...(busId && seatNumbers && Array.isArray(seatNumbers)
              ? [
                  {
                    status: 'ACTIVE',
                    busSeat: {
                      busId,
                      seatNumber: { in: seatNumbers },
                    },
                  },
                ]
              : []),
          ],
        },
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
