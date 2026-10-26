export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/server-utils';

const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get('search') || '').trim().slice(0, 120);
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
    const where = {
      role: 'USER',
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { bookings: true } },
        },
      }),
    ]);

    return NextResponse.json({ users, total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
  } catch (error) {
    console.error('Could not load registered users:', error instanceof Error ? error.name : 'UnknownError');
    return NextResponse.json({ error: 'Could not load registered users.' }, { status: 500 });
  }
}
