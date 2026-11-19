/**
 * In-memory sliding-window rate limiter for sensitive authentication endpoints
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

/**
 * Periodically purge stale records every 10 minutes to prevent memory leak
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of loginAttempts.entries()) {
    if (now > value.resetAt) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

export function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record || now > record.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count, retryAfterSeconds: 0 };
}

export function resetRateLimit(identifier: string) {
  loginAttempts.delete(identifier);
}
