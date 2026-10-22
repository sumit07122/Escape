import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

export async function GET() {
  try {
    const [settings, existingGlobal] = await Promise.all([
      db.settings.findMany({
        orderBy: { key: 'asc' },
      }),
      db.globalSettings.findFirst(),
    ]);

    let globalSettings = existingGlobal;
    if (!globalSettings) {
      globalSettings = await db.globalSettings.upsert({
        where: { id: 'global_default' },
        update: {},
        create: {
          id: 'global_default',
          tripCapacity: 75,
        },
      });
    }

    return NextResponse.json({
      settings,
      globalSettings,
      tripCapacity: globalSettings.tripCapacity,
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
    const { settings, tripCapacity } = body;

    let updatedCapacity: number | null = null;

    // 1. Direct tripCapacity update
    if (tripCapacity !== undefined && tripCapacity !== null) {
      const cap = parseInt(String(tripCapacity), 10);
      if (isNaN(cap) || cap < 1) {
        return NextResponse.json({ error: 'Invalid trip capacity numeric value' }, { status: 400 });
      }
      updatedCapacity = cap;

      await Promise.all([
        db.globalSettings.upsert({
          where: { id: 'global_default' },
          update: { tripCapacity: cap },
          create: { id: 'global_default', tripCapacity: cap },
        }),
        db.trip.updateMany({ data: { capacity: cap } }),
        db.settings.upsert({
          where: { key: 'trip_capacity' },
          update: { value: String(cap) },
          create: {
            key: 'trip_capacity',
            value: String(cap),
            category: 'GENERAL',
            description: 'Expedition passenger capacity limit across all buses',
          },
        }),
      ]);
    }

    // 2. Settings array update
    if (Array.isArray(settings)) {
      for (const item of settings) {
        if (item.key && item.value !== undefined) {
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

          if (item.key === 'trip_capacity') {
            const cap = parseInt(item.value, 10);
            if (!isNaN(cap) && cap >= 1) {
              updatedCapacity = cap;
              await Promise.all([
                db.globalSettings.upsert({
                  where: { id: 'global_default' },
                  update: { tripCapacity: cap },
                  create: { id: 'global_default', tripCapacity: cap },
                }),
                db.trip.updateMany({ data: { capacity: cap } }),
              ]);
            }
          }
        }
      }
    }

    const [updatedSettings, globalSettings] = await Promise.all([
      db.settings.findMany({ orderBy: { key: 'asc' } }),
      db.globalSettings.findFirst(),
    ]);

    await createAuditLog({
      action: 'ADMIN_SETTINGS_UPDATED',
      entityType: 'SETTINGS',
      entityId: 'global',
      performedBy: `Admin: ${admin.name} (${admin.email})`,
      newValue: updatedCapacity
        ? `Trip capacity updated to ${updatedCapacity}`
        : `Updated ${settings?.length || 0} settings`,
    });

    return NextResponse.json({
      success: true,
      tripCapacity: globalSettings?.tripCapacity ?? updatedCapacity ?? 75,
      globalSettings,
      settings: updatedSettings,
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
