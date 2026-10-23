export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { getTripConfig, getSeatAvailability } from '@/lib/trip-config';

export async function GET() {
  try {
    const config = await getTripConfig();
    const availability = await getSeatAvailability();

    const response = NextResponse.json({
      success: true,
      config,
      availability,
      timestamp: Date.now(),
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('[API_GET_TRIP_CONFIG_ERROR]:', error);
    return NextResponse.json({ error: 'Failed to retrieve trip config' }, { status: 500 });
  }
}
