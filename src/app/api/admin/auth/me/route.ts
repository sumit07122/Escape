export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/server-utils';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, admin });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('gla_admin_token');
  return response;
}
