import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const days = await db.itineraryDay.findMany({
      orderBy: { dayNumber: 'asc' },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return NextResponse.json({ days });
  } catch (error) {
    console.error('Error fetching admin itinerary:', error);
    return NextResponse.json({ error: 'Failed to fetch itinerary' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, dayId, itemId, title, subtitle, stayLocation, mealsConfig, description, time, location, activity, isOptional, extraCost } = body;

    if (action === 'UPDATE_DAY') {
      const updated = await db.itineraryDay.update({
        where: { id: dayId },
        data: {
          title,
          subtitle,
          stayLocation,
          mealsConfig,
          description,
        },
      });

      await createAuditLog({
        action: 'ADMIN_ITINERARY_DAY_UPDATED',
        entityType: 'ITINERARY',
        entityId: dayId,
        performedBy: `Admin: ${admin.name}`,
        newValue: title,
      });

      return NextResponse.json({ success: true, day: updated });
    }

    if (action === 'CREATE_ITEM') {
      const count = await db.itineraryItem.count({ where: { dayId } });
      const item = await db.itineraryItem.create({
        data: {
          dayId,
          time,
          location: location || 'Manali / Kasol',
          activity,
          description,
          isOptional: Boolean(isOptional),
          extraCost: extraCost ? Number(extraCost) : null,
          orderIndex: count + 1,
        },
      });

      await createAuditLog({
        action: 'ADMIN_ITINERARY_ITEM_CREATED',
        entityType: 'ITINERARY',
        entityId: item.id,
        performedBy: `Admin: ${admin.name}`,
        newValue: activity,
      });

      return NextResponse.json({ success: true, item });
    }

    if (action === 'UPDATE_ITEM') {
      const item = await db.itineraryItem.update({
        where: { id: itemId },
        data: {
          time,
          location,
          activity,
          description,
          isOptional: Boolean(isOptional),
          extraCost: extraCost ? Number(extraCost) : null,
        },
      });

      return NextResponse.json({ success: true, item });
    }

    if (action === 'DELETE_ITEM') {
      await db.itineraryItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true, message: 'Item deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error modifying itinerary:', error);
    return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 });
  }
}
