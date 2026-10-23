export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/server-utils';

interface FallbackCoupon {
  id: string;
  code: string;
  discountAmount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

let fallbackCoupons: FallbackCoupon[] = [
  {
    id: 'cpn_earlybird',
    code: 'EARLYBIRD',
    discountAmount: 200,
    maxUses: 100,
    usedCount: 12,
    isActive: true,
    expiresAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cpn_squad5',
    code: 'SQUAD5',
    discountAmount: 500,
    maxUses: 50,
    usedCount: 5,
    isActive: true,
    expiresAt: null,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const coupons = await db.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (coupons && coupons.length > 0) {
        return NextResponse.json({ coupons, success: true });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ coupons: fallbackCoupons, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch coupons';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const code = String(body.code || '').trim().toUpperCase();
    const discountAmount = Number(body.discountAmount) || 200;
    const maxUses = Number(body.maxUses) || 100;
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    let createdCoupon: any = null;

    try {
      createdCoupon = await db.coupon.create({
        data: {
          code,
          discountAmount,
          maxUses,
          isActive: true,
          expiresAt,
        },
      });
    } catch {
      // Memory fallback
      createdCoupon = {
        id: 'cpn_' + Date.now(),
        code,
        discountAmount,
        maxUses,
        usedCount: 0,
        isActive: true,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        createdAt: new Date().toISOString(),
      };
      fallbackCoupons = [createdCoupon, ...fallbackCoupons.filter((c) => c.code !== code)];
    }

    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/book', 'page');

    return NextResponse.json({ coupon: createdCoupon, success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create coupon';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    try {
      await db.coupon.update({
        where: { id },
        data: { isActive: Boolean(isActive) },
      });
    } catch {
      fallbackCoupons = fallbackCoupons.map((c) =>
        c.id === id ? { ...c, isActive: Boolean(isActive) } : c
      );
    }

    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/book', 'page');

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update coupon';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    try {
      await db.coupon.delete({
        where: { id },
      });
    } catch {
      fallbackCoupons = fallbackCoupons.filter((c) => c.id !== id);
    }

    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/book', 'page');

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete coupon';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
