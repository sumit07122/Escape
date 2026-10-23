import { db } from '@/lib/db';
import { cleanExpiredHolds } from '@/lib/server-utils';
import { TripConfigData, DEFAULT_TRIP_CONFIG } from './trip-config-shared';

export type { TripConfigData };
export { DEFAULT_TRIP_CONFIG };

// In-memory cache for ultra-fast response and graceful offline fallback
let memoryConfigCache: TripConfigData = { ...DEFAULT_TRIP_CONFIG };

/**
 * Fetch dynamic TripConfig from database (Zero-stale fresh Supabase lookup)
 */
export async function getTripConfig(): Promise<TripConfigData> {
  try {
    const config = await db.tripConfig.findUnique({
      where: { id: 'global' },
    });

    if (config) {
      const merged: TripConfigData = {
        id: config.id,
        tripTitle: config.tripTitle || DEFAULT_TRIP_CONFIG.tripTitle,
        subtitle: config.subtitle || DEFAULT_TRIP_CONFIG.subtitle,
        totalCapacity: Number(config.totalCapacity) || DEFAULT_TRIP_CONFIG.totalCapacity,
        packagePrice: Number(config.packagePrice) || DEFAULT_TRIP_CONFIG.packagePrice,
        depositPrice: Number(config.depositPrice) || DEFAULT_TRIP_CONFIG.depositPrice,
        pickupLocation: config.pickupLocation || DEFAULT_TRIP_CONFIG.pickupLocation,
        reportingTime: config.reportingTime || DEFAULT_TRIP_CONFIG.reportingTime,
        departureDate: config.departureDate || DEFAULT_TRIP_CONFIG.departureDate,
        emergencyHelplines: Array.isArray(config.emergencyHelplines) && config.emergencyHelplines.length > 0
          ? config.emergencyHelplines
          : DEFAULT_TRIP_CONFIG.emergencyHelplines,
        announcementBanner: config.announcementBanner,
        announcementActive: Boolean(config.announcementActive),
      };
      memoryConfigCache = merged;
      return merged;
    }
  } catch (error) {
    console.warn('[TRIP_CONFIG_DB_FETCH_WARNING]: Using cached or default configuration', error);
  }

  return memoryConfigCache;
}

/**
 * Persist trip config updates
 */
export async function updateTripConfig(data: Partial<TripConfigData>): Promise<TripConfigData> {
  const current = await getTripConfig();
  const merged: TripConfigData = {
    ...current,
    ...data,
    id: 'global',
  };

  try {
    const updated = await db.tripConfig.upsert({
      where: { id: 'global' },
      update: {
        tripTitle: merged.tripTitle,
        subtitle: merged.subtitle,
        totalCapacity: Number(merged.totalCapacity),
        packagePrice: Number(merged.packagePrice),
        depositPrice: Number(merged.depositPrice),
        pickupLocation: merged.pickupLocation,
        reportingTime: merged.reportingTime,
        departureDate: merged.departureDate,
        emergencyHelplines: merged.emergencyHelplines,
        announcementBanner: merged.announcementBanner,
        announcementActive: Boolean(merged.announcementActive),
      },
      create: {
        id: 'global',
        tripTitle: merged.tripTitle,
        subtitle: merged.subtitle,
        totalCapacity: Number(merged.totalCapacity),
        packagePrice: Number(merged.packagePrice),
        depositPrice: Number(merged.depositPrice),
        pickupLocation: merged.pickupLocation,
        reportingTime: merged.reportingTime,
        departureDate: merged.departureDate,
        emergencyHelplines: merged.emergencyHelplines,
        announcementBanner: merged.announcementBanner,
        announcementActive: Boolean(merged.announcementActive),
      },
    });

    memoryConfigCache = {
      id: updated.id,
      tripTitle: updated.tripTitle,
      subtitle: updated.subtitle,
      totalCapacity: Number(updated.totalCapacity),
      packagePrice: Number(updated.packagePrice),
      depositPrice: Number(updated.depositPrice),
      pickupLocation: updated.pickupLocation,
      reportingTime: updated.reportingTime,
      departureDate: updated.departureDate,
      emergencyHelplines: updated.emergencyHelplines,
      announcementBanner: updated.announcementBanner,
      announcementActive: Boolean(updated.announcementActive),
    };
    return memoryConfigCache;
  } catch (error) {
    console.warn('[TRIP_CONFIG_DB_UPDATE_WARNING]: Persisted to memory fallback', error);
    memoryConfigCache = merged;
    return merged;
  }
}

export interface SeatAvailabilityResult {
  totalCapacity: number;
  confirmedCount: number;
  heldCount: number;
  blockedCount: number;
  availableSeats: number;
  tripConfig: TripConfigData;
}

/**
 * SINGLE SOURCE OF TRUTH (SSOT) Seat Availability Calculation
 * Formula: availableSeats = max(0, totalCapacity - confirmedCount - heldCount - blockedCount)
 */
export async function getSeatAvailability(): Promise<SeatAvailabilityResult> {
  const tripConfig = await getTripConfig();
  const totalCapacity = tripConfig.totalCapacity || 75;

  let confirmedCount = 0;
  let heldCount = 0;
  let blockedCount = 0;

  try {
    // Eagerly purge any expired holds first
    await cleanExpiredHolds().catch(() => {});

    // 1. Confirmed bookings count (including multi-traveller groups)
    const confirmedBookings = await db.booking.findMany({
      where: { bookingStatus: 'CONFIRMED' },
      select: {
        travellersCount: true,
        travellers: { select: { id: true } },
      },
    });

    confirmedCount = confirmedBookings.reduce(
      (acc, b) => acc + Math.max(b.travellers?.length || 0, b.travellersCount || 1),
      0
    );

    // 2. Active temporary seat holds (within 10-minute validity)
    heldCount = await db.seatHold.count({
      where: {
        expiresAt: { gt: new Date() },
        status: 'ACTIVE',
      },
    });

    // 3. Blocked seats (reserved by coordinators/luggage)
    blockedCount = await db.busSeat.count({
      where: { status: 'BLOCKED' },
    });
  } catch (error) {
    console.error('[SSOT_CALCULATION_ERROR]:', error);
  }

  const availableSeats = Math.max(0, totalCapacity - confirmedCount - heldCount - blockedCount);

  return {
    totalCapacity,
    confirmedCount,
    heldCount,
    blockedCount,
    availableSeats,
    tripConfig,
  };
}
