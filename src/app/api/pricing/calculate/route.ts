export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { calculateBookingPricing } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawCount = body.travellersCount;
    const travellersCount = Number(rawCount) || 1;

    if (travellersCount < 1) {
      return NextResponse.json(
        { error: 'Valid traveller count is required (minimum 1)' },
        { status: 400 }
      );
    }

    const pricing = calculateBookingPricing({ travellersCount });

    return NextResponse.json({
      pricing,
      success: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Pricing calculation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
