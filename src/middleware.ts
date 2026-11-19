import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function isValidAdminToken(token: string, secret?: string): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [base64Data, signature] = parts;
    if (!base64Data || !signature) return false;

    // Decode and check expiry
    const payloadStr = atob(base64Data.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);
    if (payload.exp && Date.now() > payload.exp) return false;

    // If secret available, cryptographically verify HMAC-SHA256 signature
    if (secret) {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(base64Data));
      const bytes = new Uint8Array(sigBuf);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const expectedSig = btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      if (signature !== expectedSig) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSecret = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;

  // Protect /admin sub-routes: redirect to /admin if unauthenticated or token is invalid
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const adminToken =
      request.cookies.get('admin_session')?.value ||
      request.cookies.get('gla_admin_token')?.value;

    const valid = adminToken ? await isValidAdminToken(adminToken, adminSecret) : false;

    if (!valid) {
      const loginUrl = new URL('/admin', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin API routes (except login endpoints)
  if (pathname.startsWith('/api/admin')) {
    if (
      pathname === '/api/admin/login' ||
      pathname === '/api/admin/auth/login'
    ) {
      return NextResponse.next();
    }

    const adminToken =
      request.cookies.get('admin_session')?.value ||
      request.cookies.get('gla_admin_token')?.value ||
      request.headers.get('x-admin-token');

    const valid = adminToken ? await isValidAdminToken(adminToken, adminSecret) : false;

    if (!valid) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*', '/admin/:path*'],
};
