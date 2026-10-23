export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSessionFromRequest(request);
    return NextResponse.json({
      authenticated: !!user,
      user: user || null,
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
