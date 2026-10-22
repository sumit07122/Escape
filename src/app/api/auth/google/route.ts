import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get('returnUrl') || '/book';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || 'localhost:3000';
  const proto = request.headers.get("x-forwarded-proto") || (request.url.startsWith('https') ? 'https' : 'http');
  const origin = process.env.NEXTAUTH_URL || `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const isRealSecret =
    clientSecret &&
    !clientSecret.includes('<PASTE_') &&
    !clientSecret.startsWith('<') &&
    clientSecret.trim().length > 5;
  const isRealClientId =
    clientId &&
    !clientId.startsWith('<') &&
    clientId.trim().length > 5;

  if (isRealClientId && isRealSecret) {
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

  return NextResponse.redirect(new URL('/login?error=Google+OAuth+not+configured', request.url));
}
