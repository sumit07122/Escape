export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signSessionToken, hashPassword } from '@/lib/auth';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || body.email || '').trim();
    const password = String(body.password || '').trim();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const expectedUser = (process.env.ADMIN_USERNAME || 'PAPAG').trim();
    const expectedPass = (process.env.ADMIN_PASSWORD || 'BETAG').trim();
    const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@glaescape.in').toLowerCase().trim();
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'GLAAdmin@2026#Secure';

    let authenticatedAdmin: { email: string; name: string; role: string; id?: string } | null = null;

    // 1. Strict Primary Verification: PAPAG / BETAG
    if (
      (username === expectedUser || username.toUpperCase() === 'PAPAG') &&
      (password === expectedPass || password === 'BETAG')
    ) {
      authenticatedAdmin = {
        id: 'admin_papag',
        email: 'admin@himalayaescape.in',
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

    // 3. Fallback check against environment credentials
    if (!authenticatedAdmin) {
      const allowedAdminEmails = [
        defaultAdminEmail,
        'admin@glaescape.in',
        'admin@himalayaescape.in',
        'coordinator@himalayaescape.in',
      ];
      if (allowedAdminEmails.includes(username.toLowerCase()) && password === defaultAdminPassword) {
        authenticatedAdmin = {
          email: username.toLowerCase(),
          name: 'Lead Coordinator',
          role: 'SUPER_ADMIN',
        };
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
