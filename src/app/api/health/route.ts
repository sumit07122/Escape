export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();

  let dbStatus = 'DISCONNECTED';
  let dbLatencyMs = 0;
  let dbError: string | null = null;

  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1 as health_check`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'CONNECTED';
  } catch (error: unknown) {
    dbStatus = 'UNREACHABLE';
    dbError = error instanceof Error ? 'Database connection failure' : 'Unknown error';
  }

  const isHealthy = dbStatus === 'CONNECTED';
  const totalLatencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
      checks: {
        server: 'UP',
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          ...(dbError ? { error: dbError } : {}),
        },
      },
      latencyMs: totalLatencyMs,
      environment: process.env.NODE_ENV || 'production',
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
