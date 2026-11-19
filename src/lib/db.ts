import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbOfflineUntil: number | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Maintain singleton across warm serverless invocations and dev HMR
globalForPrisma.prisma = db;

export function isDbTemporarilyOffline(): boolean {
  return typeof globalForPrisma.dbOfflineUntil === 'number' && Date.now() < globalForPrisma.dbOfflineUntil;
}

export function markDbOffline(durationMs: number = 10000): void {
  globalForPrisma.dbOfflineUntil = Date.now() + durationMs;
}

export async function safeDbQuery<T>(queryFn: () => Promise<T>, fallback: T, timeoutMs = 3500): Promise<T> {
  if (isDbTemporarilyOffline()) {
    return fallback;
  }
  try {
    const result = await Promise.race([
      queryFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), timeoutMs)
      ),
    ]);
    return result;
  } catch {
    markDbOffline(10000);
    return fallback;
  }
}
