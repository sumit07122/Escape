export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getTripConfig } from '@/lib/trip-config';

export async function GET() {
  try {
    const config = await getTripConfig();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('[API_GET_TRIP_CONFIG_ERROR]:', error);
    return NextResponse.json({ error: 'Failed to retrieve trip config' }, { status: 500 });
  }
}
