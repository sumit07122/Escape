export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, createAuditLog } from '@/lib/server-utils';
import { ITINERARY_DAYS } from '@/lib/constants';

async function checkAdminAuth(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (admin) return admin;

  const adminSecretHeader = request.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || 'Trip@2026';
  if (adminSecretHeader && adminSecretHeader === expectedSecret) {
    return { name: 'System Coordinator', email: 'admin@glaescape.in', role: 'SUPER_ADMIN' };
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdminAuth(request);
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
    const admin = await checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, dayId, itemId, title, subtitle, stayLocation, mealsConfig, description, time, location, activity, isOptional, extraCost } = body;

    if (action === 'SYNC_DEFAULT_ITINERARY') {
      const trip = await db.trip.findFirst();
      if (!trip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      for (const dayDef of ITINERARY_DAYS) {
        const day = await db.itineraryDay.upsert({
          where: {
            tripId_dayNumber: {
              tripId: trip.id,
              dayNumber: dayDef.dayNumber,
            },
          },
          update: {
            title: dayDef.title,
            subtitle: dayDef.subtitle,
            stayLocation: dayDef.stayLocation,
            mealsConfig: dayDef.mealsConfig,
            description: dayDef.description,
            isPublic: true,
          },
          create: {
            tripId: trip.id,
            dayNumber: dayDef.dayNumber,
            title: dayDef.title,
            subtitle: dayDef.subtitle,
            stayLocation: dayDef.stayLocation,
            mealsConfig: dayDef.mealsConfig,
            description: dayDef.description,
            isPublic: true,
          },
        });

        // Replace activities with updated schedule
        await db.itineraryItem.deleteMany({ where: { dayId: day.id } });
        for (let idx = 0; idx < dayDef.items.length; idx++) {
          const itemDef = dayDef.items[idx];
          await db.itineraryItem.create({
            data: {
              dayId: day.id,
              time: itemDef.time,
              location: itemDef.location,
              activity: itemDef.activity,
              description: itemDef.description,
              isOptional: itemDef.isOptional,
              orderIndex: idx,
            },
          });
        }
      }

      await createAuditLog({
        action: 'ADMIN_ITINERARY_SYNCED_DEFAULT',
        entityType: 'ITINERARY',
        entityId: trip.id,
        performedBy: `Admin: ${admin.name}`,
        newValue: 'Synced with 6D/5N Itinerary',
      });

      return NextResponse.json({ success: true, message: 'Itinerary synced with 6D/5N master schedule' });
    }

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
