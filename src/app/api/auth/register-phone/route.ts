export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signUserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone, password, name } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Mobile number and password are required' },
        { status: 400 }
      );
    }

    // Sanitize and validate 10-digit Indian phone number
    const rawDigits = String(phone).replace(/[^0-9]/g, '');
    const cleanPhone = rawDigits.length === 12 && rawDigits.startsWith('91')
      ? rawDigits.slice(2)
      : rawDigits.length > 10
      ? rawDigits.slice(-10)
      : rawDigits;

    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)' },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check for duplicate registration
    const existingUser = await db.user.findFirst({
      where: { phone: cleanPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this mobile number already exists. Please sign in.' },
        { status: 400 }
      );
    }

    // Hash password using bcryptjs (salt rounds: 10)
    const passwordHash = await bcrypt.hash(String(password), 10);
    const cleanName = name ? String(name).trim() : 'Traveller';
    // Older deployed databases still require email even though phone-only auth does not.
    // A reserved .invalid address satisfies that legacy constraint without inventing a deliverable email.
    const accountEmail = `${cleanPhone}@phone.himalayaescape.invalid`;

    // Create user in database
    const newUser = await db.user.create({
      data: {
        phone: cleanPhone,
        email: accountEmail,
        passwordHash,
        name: cleanName,
        role: 'USER',
      },
    });

    // Create signed user session
    const sessionToken = signUserSession({
      id: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      name: newUser.name || 'Traveller',
      image: newUser.image,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        phone: newUser.phone,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
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
    const databaseError = error as { code?: string };
    if (databaseError?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this mobile number already exists. Please sign in.' },
        { status: 409 }
      );
    }
    console.error('[AUTH_REGISTER_PHONE_ERROR]:', databaseError?.code || 'unknown');
    return NextResponse.json(
      { error: 'We could not create your account right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
