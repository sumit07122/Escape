export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const origin = process.env.NEXTAUTH_URL || request.nextUrl.origin;

  // Handle User Cancellation or Denial
  if (error || !code) {
    const errorMsg = errorDescription || error || 'Google Contacts permission was denied or cancelled';
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Google Contacts Authorization</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAF9F5; color: #171918; text-align: center; }
    .card { background: white; border: 1px solid #D8D2C4; border-radius: 20px; padding: 28px; max-width: 380px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h3 { margin: 0 0 8px; font-size: 18px; color: #DC2626; }
    p { margin: 0 0 16px; font-size: 13px; color: #646864; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h3>Authorization Not Completed</h3>
    <p>${escapeHtml(errorMsg)}</p>
    <p style="font-size:11px;color:#8E8C85;">Closing this window...</p>
  </div>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_CONTACTS_AUTH_ERROR',
          error: ${JSON.stringify(errorMsg)}
        }, ${JSON.stringify(origin)});
      }
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => { window.close(); }, 800);
  </script>
</body>
</html>`;
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  let redirectUri = '';
  if (process.env.NEXTAUTH_URL) {
    redirectUri = `${process.env.NEXTAUTH_URL.replace(/\/$/, '')}/api/auth/google/contacts/callback`;
  } else {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
    redirectUri = `${proto}://${host}/api/auth/google/contacts/callback`;
  }

  try {
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
      cache: 'no-store',
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => '');
      console.error('[GOOGLE_CONTACTS_TOKEN_EXCHANGE_ERROR]:', tokenRes.status);
      const html = `<!DOCTYPE html>
<html>
<head><title>Authentication Failed</title></head>
<body style="font-family:sans-serif;padding:24px;text-align:center;">
  <p>Failed to exchange authorization code with Google.</p>
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'GOOGLE_CONTACTS_AUTH_ERROR', error: 'Token exchange failed' }, ${JSON.stringify(origin)});
    }
    setTimeout(() => window.close(), 1000);
  </script>
</body>
</html>`;
      return new NextResponse(html, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 3600;

    // Secure HTML response that sends access token to window.opener via postMessage and immediately closes
    // Notice: Token is NEVER saved in database, session cookies, or localStorage!
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Google Contacts Connected</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAF9F5; color: #171918; text-align: center; }
    .card { background: white; border: 1px solid #D8D2C4; border-radius: 20px; padding: 28px; max-width: 380px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h3 { margin: 0 0 8px; font-size: 18px; color: #163C32; }
    p { margin: 0 0 12px; font-size: 13px; color: #646864; line-height: 1.5; }
    .spinner { border: 3px solid #E7E2D8; border-top: 3px solid #D87945; border-radius: 50%; width: 24px; height: 24px; animation: spin 0.8s linear infinite; margin: 12px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3>Contacts Connected!</h3>
    <p>Transferring session securely to booking form...</p>
  </div>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_CONTACTS_AUTH_SUCCESS',
          accessToken: ${JSON.stringify(accessToken)},
          expiresIn: ${Number(expiresIn)}
        }, ${JSON.stringify(origin)});
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => {
      window.close();
    }, 400);
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    console.error('[GOOGLE_CONTACTS_CALLBACK_EXCEPTION]:', err);
    return new NextResponse('Internal error during Google Contacts authorization', { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

