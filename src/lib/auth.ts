import crypto from 'crypto';

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'gla-himalayan-escape-super-secret-jwt-key-2026';

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
export function signSessionToken(payload: { email: string; role: string; name: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const base64Data = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Data).digest('base64url');
  return `${base64Data}.${signature}`;
}

/**
 * Verify a signed admin session token
 */
export function verifySessionToken(token: string): { email: string; role: string; name: string } | null {
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
