export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GOOGLE_CONTACTS_SCOPE } from '@/lib/google-contacts';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
  const origin = process.env.NEXTAUTH_URL
    ? process.env.NEXTAUTH_URL.replace(/\/$/, '')
    : `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/google/contacts/callback`;

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
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head><title>Configuration Error</title></head>
<body style="font-family:sans-serif;padding:24px;background:#fef2f2;color:#991b1b;">
  <h3>Google OAuth Not Configured</h3>
  <p>GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing or invalid in server environment.</p>
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'GOOGLE_CONTACTS_AUTH_ERROR', error: 'Google OAuth not configured on server' }, window.location.origin);
      setTimeout(() => window.close(), 1500);
    }
  </script>
</body>
</html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const state = Buffer.from(JSON.stringify({ nonce: Math.random().toString(36).substring(2), ts: Date.now() })).toString('base64url');
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId!);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  // Request contacts.readonly along with standard profile/openid
  googleAuthUrl.searchParams.set('scope', `openid email profile ${GOOGLE_CONTACTS_SCOPE}`);
  // Force consent prompt so contacts permission is explicitly requested
  googleAuthUrl.searchParams.set('prompt', 'consent');
  googleAuthUrl.searchParams.set('access_type', 'online');
  googleAuthUrl.searchParams.set('include_granted_scopes', 'true');
  googleAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(googleAuthUrl.toString());
}

