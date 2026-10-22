import { db } from './db';
import { cookies } from 'next/headers';
import { verifySessionToken } from './auth';

/**
 * Automatically clean expired seat holds in the database
 * Any active hold with expiresAt < now is set to 'EXPIRED'
 * and the corresponding BusSeat.status is reset to 'AVAILABLE' if not confirmed.
 */
export async function cleanExpiredHolds(): Promise<number> {
  const now = new Date();

  // Find expired active holds
  const expiredHolds = await db.seatHold.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lt: now },
    },
    select: { id: true, busSeatId: true },
  });

  if (expiredHolds.length === 0) return 0;

  const holdIds = expiredHolds.map((h) => h.id);
  const seatIds = expiredHolds.map((h) => h.busSeatId);

  await db.$transaction([
    // Mark holds as EXPIRED
    db.seatHold.updateMany({
      where: { id: { in: holdIds } },
      data: { status: 'EXPIRED' },
    }),
    // Reset seats to AVAILABLE if not already booked
    db.busSeat.updateMany({
      where: {
        id: { in: seatIds },
        status: 'HELD',
      },
      data: { status: 'AVAILABLE', isAvailable: true },
    }),
  ]);

  return expiredHolds.length;
}

/**
 * Get current admin session from cookie
 */
export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('gla_admin_token')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Record an audit log entry
 */
export async function createAuditLog(params: {
  action: string;
  entityType: string;
  entityId: string;
  performedBy?: string;
  bookingId?: string | null;
  busSeatId?: string | null;
  seatNumber?: string | null;
  busId?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  try {
    let resolvedBookingDbId: string | null = null;
    if (params.bookingId) {
      const b = await db.booking.findFirst({
        where: {
          OR: [{ id: params.bookingId }, { bookingId: params.bookingId }],
        },
        select: { id: true },
      });
      resolvedBookingDbId = b?.id || null;
    }

    await db.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        performedBy: params.performedBy || 'SYSTEM',
        bookingId: resolvedBookingDbId,
        busSeatId: params.busSeatId,
        seatNumber: params.seatNumber,
        busId: params.busId,
        oldValue: params.oldValue,
        newValue: params.newValue,
        ipAddress: params.ipAddress,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (e) {
    console.error('Failed to create audit log:', e);
  }
}
