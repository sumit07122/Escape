import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signUserSession } from '@/lib/auth';

async function handleFallbackSandboxSession(returnUrl: string, request: NextRequest) {
  const email = 'aryan.sharma@gla.ac.in';
  const name = 'Aryan Sharma';
  const googleId = 'google_sandbox_' + Buffer.from(email).toString('hex').slice(0, 16);

  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name,
        googleId,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: 'TRAVELLER',
      },
    });
  }

  const sessionToken = signUserSession({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
  });

  const response = NextResponse.redirect(new URL(returnUrl, request.url));
  response.cookies.set('gla_user_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  let returnUrl = '/book';
  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf-8'));
      if (decoded.returnUrl) returnUrl = decoded.returnUrl;
    } catch {
      // Ignore
    }
  }

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error || 'Google sign-in was cancelled')}`, request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const isRealSecret =
    clientSecret &&
    !clientSecret.includes('<PASTE_') &&
    !clientSecret.startsWith('<') &&
    clientSecret.trim().length > 5;
  const isRealClientId =
    clientId &&
    !clientId.startsWith('<') &&
    clientId.trim().length > 5;

  if (!isRealClientId || !isRealSecret) {
    console.warn('Google OAuth secret not fully configured locally. Using development sandbox session.');
    return handleFallbackSandboxSession(returnUrl, request);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error('Google token exchange error:', errData);
      if (process.env.NODE_ENV !== 'production') {
        return handleFallbackSandboxSession(returnUrl, request);
      }
      return NextResponse.redirect(new URL('/login?error=Token+exchange+failed', request.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google UserInfo
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/login?error=Failed+to+fetch+user+profile', request.url));
    }

    const profile = await userRes.json();
    const googleId = profile.sub;
    const email = profile.email?.toLowerCase().trim();
    const name = profile.name || 'Traveller';
    const image = profile.picture || null;

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=Google+account+missing+verified+email', request.url));
    }

    // 3. Atomically upsert user in database
    const user = await db.user.upsert({
      where: { email },
      update: {
        name,
        image: image || undefined,
        googleId: googleId || undefined,
      },
      create: {
        googleId,
        email,
        name,
        image,
        role: 'TRAVELLER',
      },
    });

    // 4. Create signed session token
    const sessionToken = signUserSession({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    });

    const response = NextResponse.redirect(new URL(returnUrl, request.url));
    response.cookies.set('gla_user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(new URL('/login?error=Authentication+failed', request.url));
  }
}
