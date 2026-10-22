import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signSessionToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const admin = await db.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signSessionToken({
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    await createAuditLog({
      action: 'ADMIN_LOGIN',
      entityType: 'ADMIN',
      entityId: admin.id,
      performedBy: admin.email,
      newValue: 'Successful Admin Login',
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set('gla_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
