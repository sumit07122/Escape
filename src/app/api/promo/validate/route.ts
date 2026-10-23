export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawCode = body.code || body.promoCode || body.couponCode;

    if (!rawCode || typeof rawCode !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const cleanCode = rawCode.trim().toUpperCase();

    // 1. Database Lookup
    try {
      const coupon = await db.coupon.findUnique({
        where: { code: cleanCode },
      });

      if (coupon) {
        if (!coupon.isActive) {
          return NextResponse.json({
            valid: false,
            error: 'This promo code is no longer active.',
          });
        }

        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
          return NextResponse.json({
            valid: false,
            error: 'This promo code has reached its maximum redemptions.',
          });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) <= new Date()) {
          return NextResponse.json({
            valid: false,
            error: 'This promo code has expired.',
          });
        }

        return NextResponse.json({
          valid: true,
          code: coupon.code,
          discountAmount: coupon.discountAmount,
          message: `Promo code ${coupon.code} applied! ₹${coupon.discountAmount} discount deducted.`,
        });
      }
    } catch {
      // In-memory fallback
    }

    // 2. Pre-configured Fallback Coupons
    if (cleanCode === 'EARLYBIRD') {
      return NextResponse.json({
        valid: true,
        code: 'EARLYBIRD',
        discountAmount: 200,
        message: 'Early Bird discount of ₹200 applied!',
      });
    }

    if (cleanCode === 'SQUAD5') {
      return NextResponse.json({
        valid: true,
        code: 'SQUAD5',
        discountAmount: 500,
        message: 'Squad special promo discount of ₹500 applied!',
      });
    }

    return NextResponse.json({
      valid: false,
      error: 'Invalid promo code. Please check your spelling.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to validate promo code';
    return NextResponse.json({ valid: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ valid: false, error: 'Code parameter required' }, { status: 400 });
  }

  // Handle via POST handler logic
  const mockReq = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return POST(mockReq);
}
