export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signSessionToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || body.email || '').trim();
    const password = String(body.password || '');

    if (!username || !password.trim()) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const expectedUser = process.env.ADMIN_USERNAME?.trim();
    const expectedPass = process.env.ADMIN_PASSWORD;

    let authenticatedAdmin: { email: string; name: string; role: string; id?: string } | null = null;

    // Optional environment admin account. Never fall back to public example credentials.
    if (expectedUser && expectedPass && username === expectedUser && password === expectedPass) {
      authenticatedAdmin = {
        id: 'admin_environment',
        email: (process.env.ADMIN_DEFAULT_EMAIL || expectedUser).toLowerCase().trim(),
        name: 'Lead Coordinator',
        role: 'SUPER_ADMIN',
      };
    }

    // 2. Check database Admin record
    if (!authenticatedAdmin) {
      try {
        const adminRecord = await db.admin.findUnique({
          where: { email: username.toLowerCase() },
        });
        if (adminRecord && verifyPassword(password, adminRecord.passwordHash)) {
          authenticatedAdmin = {
            id: adminRecord.id,
            email: adminRecord.email,
            name: adminRecord.name,
            role: adminRecord.role,
          };
        }
      } catch (e) {
        console.warn('[ADMIN_LOOKUP_WARN]', e);
      }
    }

    if (!authenticatedAdmin) {
      return NextResponse.json({ error: 'Invalid coordinator credentials' }, { status: 401 });
    }

    // Issue admin session token
    const token = signSessionToken({
      email: authenticatedAdmin.email,
      role: authenticatedAdmin.role,
      name: authenticatedAdmin.name,
    });

    createAuditLog({
      action: 'ADMIN_LOGIN',
      entityType: 'ADMIN',
      entityId: authenticatedAdmin.id || 'admin_session',
      performedBy: authenticatedAdmin.email,
      newValue: 'Successful Coordinator Portal Login',
    }).catch(() => {});

    const response = NextResponse.json({
      success: true,
      admin: {
        id: authenticatedAdmin.id || 'admin_session',
        email: authenticatedAdmin.email,
        name: authenticatedAdmin.name,
        role: authenticatedAdmin.role,
      },
    });

    // Set signed cookies for route protection
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
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
    console.error('[ADMIN_LOGIN_ERROR]', error);
    return NextResponse.json({ error: 'Invalid coordinator credentials' }, { status: 401 });
  }
}
