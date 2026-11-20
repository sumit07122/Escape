import { db } from './db';
import { cookies } from 'next/headers';
import { verifySessionToken } from './auth';

// In-memory throttling for cleanExpiredHolds to prevent database locking under rapid polling
let lastCleanExpiredHoldsTime = 0;
const CLEAN_HOLDS_THROTTLE_MS = 20000; // 20 seconds

/**
 * Automatically clean expired seat holds in the database
 * Throttled to execute at most once every 20 seconds, or immediately if force=true.
 */
export async function cleanExpiredHolds(force: boolean = false): Promise<number> {
  const nowMs = Date.now();
  if (!force && nowMs - lastCleanExpiredHoldsTime < CLEAN_HOLDS_THROTTLE_MS) {
    return 0;
  }
  lastCleanExpiredHoldsTime = nowMs;

  const now = new Date();

  try {
    // Find expired active holds
    const expiredHolds = await db.seatHold.findMany({
      where: {
        expiresAt: { lt: now },
      },
      select: { id: true, busSeatId: true },
    });

    if (expiredHolds.length === 0) return 0;

    const holdIds = expiredHolds.map((h) => h.id);
    const seatIds = expiredHolds.map((h) => h.busSeatId);

    await db.$transaction([
      // Eagerly delete expired holds
      db.seatHold.deleteMany({
        where: { id: { in: holdIds } },
      }),
      // Reset seats to AVAILABLE if currently HELD and not booked
      db.busSeat.updateMany({
        where: {
          id: { in: seatIds },
          status: 'HELD',
        },
        data: { status: 'AVAILABLE', isAvailable: true },
      }),
    ]);

    return expiredHolds.length;
  } catch (err) {
    console.warn('[CLEAN_HOLDS_WARNING]:', err);
    return 0;
  }
}

/**
 * Get current admin session from cookie
 */
export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('admin_session')?.value ||
    cookieStore.get('gla_admin_token')?.value;
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
