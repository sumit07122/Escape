export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signUserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Mobile number and password are required' },
        { status: 400 }
      );
    }

    const rawDigits = String(phone).replace(/[^0-9]/g, '');
    const cleanPhone = rawDigits.length === 12 && rawDigits.startsWith('91')
      ? rawDigits.slice(2)
      : rawDigits.length > 10
      ? rawDigits.slice(-10)
      : rawDigits;

    // Find user by phone
    const user = await db.user.findFirst({
      where: { phone: cleanPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this mobile number. Please create an account.' },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            'This account was created with Google sign-in. Please click "Continue with Google".',
        },
        { status: 400 }
      );
    }

    // Verify password with bcryptjs
    const isPasswordValid = await bcrypt.compare(String(password), user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid mobile number or password' },
        { status: 401 }
      );
    }

    // Issue session token
    const sessionToken = signUserSession({
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name || 'Traveller',
      image: user.image,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    response.cookies.set('gla_user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error('[AUTH_LOGIN_PHONE_ERROR]:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
