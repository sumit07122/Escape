import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await db.settings.findMany({
      orderBy: { key: 'asc' },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body; // Array of { key, value }

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings array required' }, { status: 400 });
    }

    for (const item of settings) {
      if (item.key && item.value !== undefined) {
        await db.settings.upsert({
          where: { key: item.key },
          update: { value: String(item.value) },
          create: {
            key: item.key,
            value: String(item.value),
            category: item.category || 'GENERAL',
          },
        });

        // If trip capacity changed, also update Trip.capacity
        if (item.key === 'trip_capacity') {
          const cap = parseInt(item.value, 10);
          if (!isNaN(cap)) {
            await db.trip.updateMany({ data: { capacity: cap } });
          }
        }
      }
    }

    await createAuditLog({
      action: 'ADMIN_SETTINGS_UPDATED',
      entityType: 'SETTINGS',
      entityId: 'global',
      performedBy: `Admin: ${admin.name} (${admin.email})`,
      newValue: `Updated ${settings.length} settings`,
    });

    const updated = await db.settings.findMany({ orderBy: { key: 'asc' } });
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
