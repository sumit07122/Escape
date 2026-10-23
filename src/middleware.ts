import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin sub-routes: redirect to /admin if unauthenticated
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const adminToken =
      request.cookies.get('admin_session')?.value ||
      request.cookies.get('gla_admin_token')?.value;

    if (!adminToken) {
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

    if (!adminToken) {
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
