import { db } from '@/lib/db';

export interface TripConfigData {
  id: string;
  tripTitle: string;
  subtitle: string;
  totalCapacity: number;
  packagePrice: number;
  depositPrice: number;
  pickupLocation: string;
  reportingTime: string;
  departureDate: string;
  emergencyHelplines: string[];
  announcementBanner?: string | null;
  announcementActive: boolean;
}

export const DEFAULT_TRIP_CONFIG: TripConfigData = {
  id: 'global',
  tripTitle: 'Himalayan Escape 2026',
  subtitle: 'Manali × Kasol Student Expedition',
  totalCapacity: 75,
  packagePrice: 6200,
  depositPrice: 1000,
  pickupLocation: 'Near Main Gate (NH-2), Mathura',
  reportingTime: '07:00 PM',
  departureDate: '2026-10-24',
  emergencyHelplines: ['7017936338', '9368287947'],
  announcementBanner: 'Reporting time updated: Buses will depart from NH-2 gate at 8:00 PM sharp.',
  announcementActive: false,
};

// In-memory cache for ultra-fast response and graceful offline fallback
let memoryConfigCache: TripConfigData = { ...DEFAULT_TRIP_CONFIG };

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
        totalCapacity: config.totalCapacity || DEFAULT_TRIP_CONFIG.totalCapacity,
        packagePrice: config.packagePrice || DEFAULT_TRIP_CONFIG.packagePrice,
        depositPrice: config.depositPrice || DEFAULT_TRIP_CONFIG.depositPrice,
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

export async function updateTripConfig(data: Partial<TripConfigData>): Promise<TripConfigData> {
  const merged: TripConfigData = {
    ...memoryConfigCache,
    ...data,
    id: 'global',
  };

  try {
    const updated = await db.tripConfig.upsert({
      where: { id: 'global' },
      update: {
        tripTitle: merged.tripTitle,
        subtitle: merged.subtitle,
        totalCapacity: merged.totalCapacity,
        packagePrice: merged.packagePrice,
        depositPrice: merged.depositPrice,
        pickupLocation: merged.pickupLocation,
        reportingTime: merged.reportingTime,
        departureDate: merged.departureDate,
        emergencyHelplines: merged.emergencyHelplines,
        announcementBanner: merged.announcementBanner,
        announcementActive: merged.announcementActive,
      },
      create: {
        id: 'global',
        tripTitle: merged.tripTitle,
        subtitle: merged.subtitle,
        totalCapacity: merged.totalCapacity,
        packagePrice: merged.packagePrice,
        depositPrice: merged.depositPrice,
        pickupLocation: merged.pickupLocation,
        reportingTime: merged.reportingTime,
        departureDate: merged.departureDate,
        emergencyHelplines: merged.emergencyHelplines,
        announcementBanner: merged.announcementBanner,
        announcementActive: merged.announcementActive,
      },
    });

    memoryConfigCache = {
      id: updated.id,
      tripTitle: updated.tripTitle,
      subtitle: updated.subtitle,
      totalCapacity: updated.totalCapacity,
      packagePrice: updated.packagePrice,
      depositPrice: updated.depositPrice,
      pickupLocation: updated.pickupLocation,
      reportingTime: updated.reportingTime,
      departureDate: updated.departureDate,
      emergencyHelplines: updated.emergencyHelplines,
      announcementBanner: updated.announcementBanner,
      announcementActive: updated.announcementActive,
    };
    return memoryConfigCache;
  } catch (error) {
    console.warn('[TRIP_CONFIG_DB_UPDATE_WARNING]: Persisted to memory fallback', error);
    memoryConfigCache = merged;
    return merged;
  }
}
