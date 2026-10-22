import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const days = await db.itineraryDay.findMany({
      where: { isPublic: true },
      orderBy: { dayNumber: 'asc' },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    const disclaimerSetting = await db.settings.findUnique({
      where: { key: 'itinerary_disclaimer' },
    });

    return NextResponse.json({
      days,
      disclaimer: disclaimerSetting?.value || 'Trip itinerary may change due to weather, road conditions, traffic, permits, government restrictions or safety requirements.',
    });
  } catch (error) {
    console.error('Error fetching public itinerary:', error);
    return NextResponse.json({ error: 'Failed to fetch itinerary' }, { status: 500 });
  }
}
