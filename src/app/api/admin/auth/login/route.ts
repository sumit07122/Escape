import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signSessionToken, hashPassword } from '@/lib/auth';
import { createAuditLog } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@glaescape.in').toLowerCase().trim();
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'GLAAdmin@2026#Secure';

    let authenticatedAdmin: { email: string; name: string; role: string; id?: string } | null = null;

    // 1. Check database Admin record
    try {
      const adminRecord = await db.admin.findUnique({
        where: { email: cleanEmail },
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

    // 2. Check database User record with role ADMIN
    if (!authenticatedAdmin) {
      try {
        const userAdmin = await db.user.findFirst({
          where: {
            email: cleanEmail,
            role: 'ADMIN',
          },
        });
        if (userAdmin && password === defaultAdminPassword) {
          authenticatedAdmin = {
            id: userAdmin.id,
            email: userAdmin.email,
            name: userAdmin.name || 'Lead Coordinator',
            role: 'ADMIN',
          };
        }
      } catch (e) {
        console.warn('[USER_ADMIN_LOOKUP_WARN]', e);
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
      if (allowedAdminEmails.includes(cleanEmail) && password === defaultAdminPassword) {
        authenticatedAdmin = {
          email: cleanEmail,
          name: 'Lead Coordinator',
          role: 'SUPER_ADMIN',
        };

        // Auto-seed Admin and User record in background safely (non-blocking)
        try {
          db.admin.upsert({
            where: { email: cleanEmail },
            update: { role: 'SUPER_ADMIN', name: 'Lead Coordinator' },
            create: {
              email: cleanEmail,
              name: 'Lead Coordinator',
              passwordHash: hashPassword(defaultAdminPassword),
              role: 'SUPER_ADMIN',
            },
          }).catch((e) => console.warn('[AUTO_SEED_ADMIN_ERROR]', e));

          db.user.upsert({
            where: { email: cleanEmail },
            update: { role: 'ADMIN' },
            create: {
              email: cleanEmail,
              name: 'Lead Coordinator',
              role: 'ADMIN',
            },
          }).catch((e) => console.warn('[AUTO_SEED_USER_ADMIN_ERROR]', e));
        } catch (seedErr) {
          console.warn('[SEED_EXCEPTION]', seedErr);
        }
      }
    }

    if (!authenticatedAdmin) {
      return NextResponse.json({ error: 'Invalid coordinator email or password' }, { status: 401 });
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
    return NextResponse.json({ error: 'Invalid credentials or coordinator not found' }, { status: 401 });
  }
}
