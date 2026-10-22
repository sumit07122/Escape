import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signUserSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get('returnUrl') || '/book';
  const demoEmail = searchParams.get('email');
  const demoName = searchParams.get('name');

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

  // 1. If real Google credentials exist and not explicit demo request:
  if (isRealClientId && isRealSecret && !demoEmail) {
    const state = Buffer.from(JSON.stringify({ returnUrl })).toString('base64url');
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId!);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    googleAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // 2. Friction-free Local Development / Offline Sandbox Mode
  // Used when Google OAuth API keys are not yet provided in .env
  const email = (demoEmail || 'aryan.sharma@gla.ac.in').toLowerCase().trim();
  const name = demoName || 'Aryan Sharma';
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
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}
