export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Demo students seeding into database is permanently disabled. Social proof operates exclusively via frontend notifications without modifying real database registrations.',
  });
}
