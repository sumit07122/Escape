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
<head>
  <title>Google Contacts Sync</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAF9F5; color: #163C32; }
    .card { background: #fff; padding: 32px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); text-align: center; max-width: 380px; border: 1px solid #D8D2C4; }
    .spinner { width: 36px; height: 36px; border: 3px solid #E7E2D8; border-top-color: #163C32; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h3 { margin: 0 0 8px; font-size: 18px; font-weight: 800; color: #163C32; }
    p { margin: 0; font-size: 13px; color: #646864; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3>Connecting Google Contacts...</h3>
    <p>Loading your contact address book for Himalayan Escape quick-fill.</p>
  </div>
  <script>
    setTimeout(function() {
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_CONTACTS_AUTH_SUCCESS',
          accessToken: 'demo_google_contacts_access_token'
        }, window.location.origin);
        setTimeout(function() { window.close(); }, 400);
      } else {
        window.close();
      }
    }, 600);
  </script>
</body>
</html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
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

