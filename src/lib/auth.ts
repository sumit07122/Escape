import crypto from 'crypto';
import { NextRequest } from 'next/server';

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'gla-himalayan-escape-super-secret-jwt-key-2026';

export interface UserSessionPayload {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: string;
}

export interface AdminSessionPayload {
  email: string;
  role: string;
  name: string;
}

/**
 * Hash password using scrypt with random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify password against salt:key
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Create a signed admin session token
 */
export function signSessionToken(payload: AdminSessionPayload): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const base64Data = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Data).digest('base64url');
  return `${base64Data}.${signature}`;
}

/**
 * Verify a signed admin session token
 */
export function verifySessionToken(token: string): AdminSessionPayload | null {
  try {
    const [base64Data, signature] = token.split('.');
    if (!base64Data || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(base64Data, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return { email: payload.email, role: payload.role, name: payload.name };
  } catch {
    return null;
  }
}

/**
 * Create a signed customer user session token
 */
export function signUserSession(payload: UserSessionPayload): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }); // 7 days
  const base64Data = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Data).digest('base64url');
  return `${base64Data}.${signature}`;
}

/**
 * Verify a signed customer user session token
 */
export function verifyUserSession(token: string): UserSessionPayload | null {
  try {
    const [base64Data, signature] = token.split('.');
    if (!base64Data || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(base64Data, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      image: payload.image || null,
      role: payload.role || 'TRAVELLER',
    };
  } catch {
    return null;
  }
}

/**
 * Extract customer session from NextRequest cookies or Authorization header
 */
export async function getUserSessionFromRequest(request: NextRequest): Promise<UserSessionPayload | null> {
  const cookie = request.cookies.get('gla_user_session')?.value;
  if (cookie) {
    const session = verifyUserSession(cookie);
    if (session) return session;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = verifyUserSession(token);
    if (session) return session;
  }

  return null;
}

/**
 * Extract admin session from NextRequest cookies or Authorization header
 */
export async function getAdminSessionFromRequest(request: NextRequest): Promise<AdminSessionPayload | null> {
  const cookie = request.cookies.get('gla_admin_token')?.value;
  if (cookie) {
    const session = verifySessionToken(cookie);
    if (session) return session;
  }

  const authHeader = request.headers.get('x-admin-token');
  if (authHeader) {
    const session = verifySessionToken(authHeader);
    if (session) return session;
  }

  return null;
}

/**
 * Server-side ownership verification:
 * Checks whether the current request is authenticated as the booking's owner or an admin.
 */
export async function canAccessBooking(
  request: NextRequest,
  booking: { primaryEmail: string; userId?: string | null }
): Promise<boolean> {
  // 1. Admin always has authorization
  const admin = await getAdminSessionFromRequest(request);
  if (admin) return true;

  // 2. Customer must match email or userId
  const user = await getUserSessionFromRequest(request);
  if (!user) return false;

  if (booking.userId && user.id === booking.userId) return true;
  if (booking.primaryEmail && user.email.toLowerCase().trim() === booking.primaryEmail.toLowerCase().trim()) return true;

  return false;
}
