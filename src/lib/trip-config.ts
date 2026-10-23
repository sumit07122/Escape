import { db } from '@/lib/db';
import { cleanExpiredHolds } from '@/lib/server-utils';
import { TripConfigData, DEFAULT_TRIP_CONFIG } from './trip-config-shared';

export type { TripConfigData };
export { DEFAULT_TRIP_CONFIG };

// In-memory cache for ultra-fast response and graceful offline fallback
let memoryConfigCache: TripConfigData = { ...DEFAULT_TRIP_CONFIG };

const LEGACY_CONFIG_KEYS = {
  tripTitle: 'trip_name',
  subtitle: 'trip_subtitle',
  totalCapacity: 'trip_capacity',
  packagePrice: 'price_single',
  groupPackagePrice: 'price_group',
  groupSizeThreshold: 'group_size_threshold',
  depositPrice: 'price_reservation',
  departureDate: 'departure_date',
  returnDate: 'return_date',
  reportingTime: 'reporting_time',
  pickupLocation: 'pickup_location',
  emergencyHelplines: 'emergency_helplines',
  announcementBanner: 'announcement_banner',
  announcementActive: 'announcement_active',
} as const;

async function readLegacyTripConfig() {
  try {
    const keys = Object.values(LEGACY_CONFIG_KEYS);
    const [settings, globalSettings] = await Promise.all([
      db.settings.findMany({ where: { key: { in: [...keys] } } }),
      db.globalSettings.findUnique({ where: { id: 'global_default' } }),
    ]);
    const values = new Map(settings.map((setting) => [setting.key, setting.value]));
    const getNumber = (key: keyof typeof LEGACY_CONFIG_KEYS, fallback: number) => {
      const value = Number(values.get(LEGACY_CONFIG_KEYS[key]));
      return Number.isFinite(value) ? value : fallback;
    };
    const legacyConfig: TripConfigData = {
      ...memoryConfigCache,
      tripTitle: values.get(LEGACY_CONFIG_KEYS.tripTitle) || memoryConfigCache.tripTitle,
      subtitle: values.get(LEGACY_CONFIG_KEYS.subtitle) || memoryConfigCache.subtitle,
      totalCapacity: getNumber('totalCapacity', Number(globalSettings?.tripCapacity ?? memoryConfigCache.totalCapacity)),
      packagePrice: getNumber('packagePrice', memoryConfigCache.packagePrice),
      groupPackagePrice: getNumber('groupPackagePrice', memoryConfigCache.groupPackagePrice),
      groupSizeThreshold: getNumber('groupSizeThreshold', memoryConfigCache.groupSizeThreshold),
      depositPrice: getNumber('depositPrice', memoryConfigCache.depositPrice),
      departureDate: values.get(LEGACY_CONFIG_KEYS.departureDate) || memoryConfigCache.departureDate,
      returnDate: values.get(LEGACY_CONFIG_KEYS.returnDate) || memoryConfigCache.returnDate,
      reportingTime: values.get(LEGACY_CONFIG_KEYS.reportingTime) || memoryConfigCache.reportingTime,
      pickupLocation: values.get(LEGACY_CONFIG_KEYS.pickupLocation) || memoryConfigCache.pickupLocation,
      emergencyHelplines: (() => {
        try {
          const parsed = JSON.parse(values.get(LEGACY_CONFIG_KEYS.emergencyHelplines) || '[]');
          return Array.isArray(parsed) && parsed.length ? parsed.map(String) : memoryConfigCache.emergencyHelplines;
        } catch { return memoryConfigCache.emergencyHelplines; }
      })(),
      announcementBanner: values.get(LEGACY_CONFIG_KEYS.announcementBanner) ?? memoryConfigCache.announcementBanner,
      announcementActive: values.get(LEGACY_CONFIG_KEYS.announcementActive) === undefined
        ? memoryConfigCache.announcementActive
        : values.get(LEGACY_CONFIG_KEYS.announcementActive) === 'true',
    };
    if (settings.length || globalSettings) memoryConfigCache = legacyConfig;
  } catch (error) {
    console.warn('[TRIP_CONFIG_LEGACY_FETCH_WARNING]:', error);
  }
}

async function persistLegacyTripConfig(config: TripConfigData) {
  const categories: Record<keyof typeof LEGACY_CONFIG_KEYS, string> = {
    tripTitle: 'GENERAL', subtitle: 'GENERAL', totalCapacity: 'PRICING',
    packagePrice: 'PRICING', groupPackagePrice: 'PRICING', groupSizeThreshold: 'PRICING',
    depositPrice: 'PRICING', departureDate: 'GENERAL', returnDate: 'GENERAL',
    reportingTime: 'GENERAL', pickupLocation: 'GENERAL', emergencyHelplines: 'CONTACTS',
    announcementBanner: 'GENERAL', announcementActive: 'GENERAL',
  };
  const values = Object.entries(LEGACY_CONFIG_KEYS).map(([field, key]) => {
    const typedField = field as keyof typeof LEGACY_CONFIG_KEYS;
    const rawValue = config[typedField];
    return { key, category: categories[typedField], value: Array.isArray(rawValue) ? JSON.stringify(rawValue) : String(rawValue ?? '') };
  });
  await Promise.all(values.map(({ key, category, value }) => db.settings.upsert({
    where: { key },
    update: { value, category },
    create: { key, value, category },
  })));
  await db.globalSettings.upsert({
    where: { id: 'global_default' },
    update: { tripCapacity: config.totalCapacity },
    create: { id: 'global_default', tripCapacity: config.totalCapacity },
  });
}

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
        totalCapacity: Number.isFinite(Number(config.totalCapacity)) ? Math.max(0, Number(config.totalCapacity)) : DEFAULT_TRIP_CONFIG.totalCapacity,
        packagePrice: Number(config.packagePrice) || DEFAULT_TRIP_CONFIG.packagePrice,
        groupPackagePrice: Number(config.groupPackagePrice) || DEFAULT_TRIP_CONFIG.groupPackagePrice,
        groupSizeThreshold: Number(config.groupSizeThreshold) || DEFAULT_TRIP_CONFIG.groupSizeThreshold,
        depositPrice: Number(config.depositPrice) || DEFAULT_TRIP_CONFIG.depositPrice,
        pickupLocation: config.pickupLocation || DEFAULT_TRIP_CONFIG.pickupLocation,
        reportingTime: config.reportingTime || DEFAULT_TRIP_CONFIG.reportingTime,
        departureDate: config.departureDate || DEFAULT_TRIP_CONFIG.departureDate,
        returnDate: config.returnDate || DEFAULT_TRIP_CONFIG.returnDate,
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
    await readLegacyTripConfig();
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
        groupPackagePrice: Number(merged.groupPackagePrice),
        groupSizeThreshold: Number(merged.groupSizeThreshold),
        depositPrice: Number(merged.depositPrice),
        pickupLocation: merged.pickupLocation,
        reportingTime: merged.reportingTime,
        departureDate: merged.departureDate,
        returnDate: merged.returnDate,
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
        groupPackagePrice: Number(merged.groupPackagePrice),
        groupSizeThreshold: Number(merged.groupSizeThreshold),
        depositPrice: Number(merged.depositPrice),
        pickupLocation: merged.pickupLocation,
        reportingTime: merged.reportingTime,
        departureDate: merged.departureDate,
        returnDate: merged.returnDate,
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
      groupPackagePrice: Number(updated.groupPackagePrice),
      groupSizeThreshold: Number(updated.groupSizeThreshold),
      depositPrice: Number(updated.depositPrice),
      pickupLocation: updated.pickupLocation,
      reportingTime: updated.reportingTime,
      departureDate: updated.departureDate,
      returnDate: updated.returnDate,
      emergencyHelplines: updated.emergencyHelplines,
      announcementBanner: updated.announcementBanner,
      announcementActive: Boolean(updated.announcementActive),
    };
    return memoryConfigCache;
  } catch (error) {
    console.warn('[TRIP_CONFIG_DB_UPDATE_WARNING]: Falling back to legacy settings storage', error);
    try {
      await persistLegacyTripConfig(merged);
    } catch (legacyError) {
      console.error('[TRIP_CONFIG_LEGACY_UPDATE_ERROR]:', legacyError);
    }
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
  const totalCapacity = Math.max(0, Number(tripConfig.totalCapacity));

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
