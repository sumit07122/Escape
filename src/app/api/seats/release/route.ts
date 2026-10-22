import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { busId, seatNumbers, bookingSessionId } = body;

    if (!bookingSessionId) {
      return NextResponse.json({ error: 'Booking session ID is required' }, { status: 400 });
    }

    const whereClause: {
      bookingSessionId: string;
      status: string;
      busSeat?: {
        busId?: string;
        seatNumber?: { in: string[] };
      };
    } = {
      bookingSessionId,
      status: 'ACTIVE',
    };

    if (busId || seatNumbers) {
      whereClause.busSeat = {};
      if (busId) whereClause.busSeat.busId = busId;
      if (seatNumbers && Array.isArray(seatNumbers)) {
        whereClause.busSeat.seatNumber = { in: seatNumbers };
      }
    }

    const activeHolds = await db.seatHold.findMany({
      where: whereClause,
      include: { busSeat: true },
    });

    if (activeHolds.length === 0) {
      return NextResponse.json({ success: true, releasedCount: 0 });
    }

    const holdIds = activeHolds.map((h) => h.id);
    const seatIds = activeHolds.map((h) => h.busSeatId);

    await db.$transaction([
      db.seatHold.updateMany({
        where: { id: { in: holdIds } },
        data: { status: 'RELEASED' },
      }),
      db.busSeat.updateMany({
        where: {
          id: { in: seatIds },
          status: 'HELD',
        },
        data: { status: 'AVAILABLE', isAvailable: true },
      }),
    ]);

    for (const hold of activeHolds) {
      await createAuditLog({
        action: 'SEAT_RELEASED',
        entityType: 'SEAT',
        entityId: hold.busSeatId,
        performedBy: `Session: ${bookingSessionId}`,
        seatNumber: hold.busSeat.seatNumber,
        busId: hold.busSeat.busId,
      });
    }

    return NextResponse.json({
      success: true,
      releasedCount: activeHolds.length,
      releasedSeats: activeHolds.map((h) => h.busSeat.seatNumber),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to release seat hold';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
