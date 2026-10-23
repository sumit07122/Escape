export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

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

    // 2. Settings array update
    if (Array.isArray(settings)) {
      for (const item of settings) {
        if (item.key && item.key !== 'trip_capacity' && item.value !== undefined) {
          await db.settings.upsert({
            where: { key: item.key },
            update: { value: String(item.value) },
            create: {
              key: item.key,
              value: String(item.value),
              category: item.category || 'GENERAL',
              description: item.description,
            },
          });

        }
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
      newValue: `Updated ${settings?.length || 0} settings`,
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/book', 'page');
      revalidatePath('/admin', 'page');
      revalidatePath('/my-bookings', 'page');
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
