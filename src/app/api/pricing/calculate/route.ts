export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
import { NextRequest, NextResponse } from 'next/server';
import { calculateDynamicBookingPricing } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { travellersCount: rawCount, couponCode } = body;
    const travellersCount = Number(rawCount) || 1;

    if (travellersCount < 1) {
      return NextResponse.json(
        { error: 'Valid traveller count is required (minimum 1)' },
        { status: 400 }
      );
    }

    const pricing = await calculateDynamicBookingPricing({ travellersCount, couponCode });

    return NextResponse.json({
      pricing,
      success: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Pricing calculation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
