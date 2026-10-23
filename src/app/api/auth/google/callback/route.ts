import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signUserSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
      // Ignore invalid state
    }
  }

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error || 'Google sign-in was cancelled')}`, request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Standardize Redirect URI Resolution dynamically
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'himalaya-escape.vercel.app';
  const proto = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
  const redirectUri = `${proto}://${host}/api/auth/google/callback`;

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
    return NextResponse.redirect(new URL('/login?error=Google+OAuth+not+configured', request.url));
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
      const tokenErrorText = await tokenRes.text().catch(() => '');
      console.error('[GOOGLE_TOKEN_EXCHANGE_ERROR]:', tokenRes.status, tokenErrorText);
      return NextResponse.redirect(new URL('/login?error=Token+exchange+failed', request.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google UserInfo
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      const userErrorText = await userRes.text().catch(() => '');
      console.error('[GOOGLE_USERINFO_ERROR]:', userRes.status, userErrorText);
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

    // 3. Safeguard the Database User Upsert
    let dbUser: { id: string; email: string | null; name: string | null; image?: string | null; role: string } | null = null;
    try {
      dbUser = await db.user.upsert({
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
          role: 'USER',
        },
      });
    } catch (dbError) {
      console.error('[AUTH_DB_UPSERT_WARNING]: Failed to upsert user profile', dbError);
      try {
        dbUser = await db.user.findUnique({ where: { email } });
      } catch {
        // Continue login session even if db fails
      }
    }

    const finalUserId = dbUser?.id || googleId || `usr_${Date.now()}`;
    const finalName = dbUser?.name || name || 'Traveller';
    const finalImage = dbUser?.image || image || null;
    const finalRole = dbUser?.role || 'USER';

    // 4. Create signed session token with internal user.id
    const sessionToken = signUserSession({
      id: finalUserId,
      email,
      name: finalName,
      image: finalImage,
      role: finalRole,
    });

    // 5. Session Cookie Configuration
    const response = NextResponse.redirect(new URL(returnUrl, request.url));
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
  } catch (err: unknown) {
    console.error('[GOOGLE_AUTH_CALLBACK_EXCEPTION]:', err);
    return NextResponse.redirect(new URL('/login?error=Authentication+failed', request.url));
  }
}
