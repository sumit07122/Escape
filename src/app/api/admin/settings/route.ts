export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';
import { updateTripConfig } from '@/lib/trip-config';

async function getActiveFleetCapacity() {
  const trip = await db.trip.findFirst({ select: { id: true } });
  if (!trip) return 0;
  const buses = await db.bus.findMany({
    where: { tripId: trip.id, status: 'ACTIVE' },
    select: { passengerCapacity: true },
  });
  return buses.reduce((total, bus) => total + bus.passengerCapacity, 0);
}

export async function GET() {
  try {
    // Ensure essential settings exist
    const essentialDefaults = [
      {
        key: 'upi_vpa',
        value: process.env.COORDINATOR_UPI_ID || 'gdark909@okicici',
        category: 'PAYMENT',
        description: 'Coordinator UPI ID for direct 0% fee deposit collections',
      },
      {
        key: 'itinerary_disclaimer',
        value: 'Trip itinerary and timings may be adjusted due to mountain weather, road conditions, traffic, or security guidelines.',
        category: 'LEGAL',
        description: 'Legal disclaimer displayed at the bottom of public itinerary pages',
      },
    ];

    for (const def of essentialDefaults) {
      await db.settings.upsert({
        where: { key: def.key },
        update: {},
        create: def,
      });
    }

    const [settings, existingGlobal, tripCapacity] = await Promise.all([
      db.settings.findMany({
        orderBy: { key: 'asc' },
      }),
      db.globalSettings.findFirst(),
      getActiveFleetCapacity(),
    ]);

    const globalSettings = existingGlobal ? { ...existingGlobal, tripCapacity } : { tripCapacity };

    return NextResponse.json({
      settings,
      globalSettings,
      tripCapacity,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

async function handleUpdateSettings(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    const configSyncUpdates: Record<string, any> = {};

    // 2. Settings array update
    if (Array.isArray(settings)) {
      for (const item of settings) {
        if (!item.key || item.key === 'trip_capacity' || item.value === undefined) {
          continue;
        }

        let cleanValue = String(item.value).trim();

        // Normalize emergency_helplines to clean JSON string
        if (item.key === 'emergency_helplines') {
          try {
            if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
              const parsed = JSON.parse(cleanValue);
              if (Array.isArray(parsed)) {
                cleanValue = JSON.stringify(parsed.map((p) => String(p).trim().replace(/[^0-9]/g, '')));
                configSyncUpdates.emergencyHelplines = parsed.map((p) => String(p).trim().replace(/[^0-9]/g, ''));
              }
            } else {
              // Comma-separated
              const numbers = cleanValue.split(',').map((n) => n.trim().replace(/[^0-9]/g, '')).filter(Boolean);
              cleanValue = JSON.stringify(numbers);
              configSyncUpdates.emergencyHelplines = numbers;
            }
          } catch {
            cleanValue = JSON.stringify(['8126854850', '6398412828']);
            configSyncUpdates.emergencyHelplines = ['8126854850', '6398412828'];
          }
        }

        // Map setting keys to TripConfig properties
        if (item.key === 'trip_name') configSyncUpdates.tripTitle = cleanValue;
        if (item.key === 'trip_subtitle') configSyncUpdates.subtitle = cleanValue;
        if (item.key === 'price_single') configSyncUpdates.packagePrice = Number(cleanValue) || 6199;
        if (item.key === 'price_group') configSyncUpdates.groupPackagePrice = Number(cleanValue) || 5800;
        if (item.key === 'price_reservation') configSyncUpdates.depositPrice = Number(cleanValue) || 1000;
        if (item.key === 'group_size_threshold') configSyncUpdates.groupSizeThreshold = Number(cleanValue) || 3;
        if (item.key === 'departure_date') configSyncUpdates.departureDate = cleanValue;
        if (item.key === 'return_date') configSyncUpdates.returnDate = cleanValue;
        if (item.key === 'reporting_time') configSyncUpdates.reportingTime = cleanValue;
        if (item.key === 'pickup_location') configSyncUpdates.pickupLocation = cleanValue;
        if (item.key === 'announcement_banner') configSyncUpdates.announcementBanner = cleanValue;
        if (item.key === 'announcement_active') configSyncUpdates.announcementActive = cleanValue === 'true';
        if (item.key === 'custom_seats_display_enabled') configSyncUpdates.customSeatsDisplayEnabled = cleanValue === 'true';
        if (item.key === 'custom_available_seats') configSyncUpdates.customAvailableSeats = Number(cleanValue) || 35;
        if (item.key === 'custom_total_capacity') configSyncUpdates.customTotalCapacity = Number(cleanValue) || 50;

        await db.settings.upsert({
          where: { key: item.key },
          update: { value: cleanValue },
          create: {
            key: item.key,
            value: cleanValue,
            category: item.category || 'GENERAL',
            description: item.description,
          },
        });
      }
    }

    // 3. Keep TripConfig, Trip, and Package models 100% in sync
    if (Object.keys(configSyncUpdates).length > 0) {
      try {
        await updateTripConfig(configSyncUpdates);

        // Also sync price to trip and package models if applicable
        if (configSyncUpdates.packagePrice !== undefined || configSyncUpdates.depositPrice !== undefined) {
          const pkgPrice = configSyncUpdates.packagePrice;
          const depPrice = configSyncUpdates.depositPrice;

          await db.trip.updateMany({
            data: {
              ...(pkgPrice !== undefined && { packagePrice: pkgPrice, packagePricePerTraveller: pkgPrice }),
              ...(depPrice !== undefined && { reservationAmountPerTraveller: depPrice }),
            },
          });

          await db.package.updateMany({
            data: {
              ...(pkgPrice !== undefined && { price: pkgPrice }),
              ...(depPrice !== undefined && { reservationAmount: depPrice }),
            },
          });
        }
      } catch (syncErr) {
        console.warn('[SETTINGS_TRIP_CONFIG_SYNC_WARN]:', syncErr);
      }
    }

    const [updatedSettings, globalSettings, tripCapacity] = await Promise.all([
      db.settings.findMany({ orderBy: { key: 'asc' } }),
      db.globalSettings.findFirst(),
      getActiveFleetCapacity(),
    ]);

    await createAuditLog({
      action: 'ADMIN_SETTINGS_UPDATED',
      entityType: 'SETTINGS',
      entityId: 'global',
      performedBy: `Admin: ${admin.name} (${admin.email})`,
      newValue: `Updated ${settings?.length || 0} settings with full SSOT TripConfig sync`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/book', 'page');
      revalidatePath('/admin', 'page');
      revalidatePath('/my-bookings', 'page');
      revalidatePath('/pricing', 'page');
      revalidatePath('/itinerary', 'page');
    } catch (revalErr) {
      console.warn('[SETTINGS_REVALIDATION_WARN]:', revalErr);
    }

    return NextResponse.json({
      success: true,
      tripCapacity,
      globalSettings: globalSettings ? { ...globalSettings, tripCapacity } : { tripCapacity },
      settings: updatedSettings,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleUpdateSettings(request);
}

export async function PUT(request: NextRequest) {
  return handleUpdateSettings(request);
}
