import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateBookingPricing } from '@/lib/pricing';
import { PackageType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageType, travellersCount, referralCode, primaryPhone } = body;

    if (!packageType || !travellersCount || travellersCount < 1) {
      return NextResponse.json({ error: 'Valid package type and traveller count are required' }, { status: 400 });
    }

    let validReferralPercent = 0;
    let referralStatus = 'NONE';
    let referralMessage = '';

    if (referralCode && typeof referralCode === 'string') {
      const cleanCode = referralCode.trim().toUpperCase();
      const referral = await db.referral.findUnique({
        where: { code: cleanCode },
      });

      if (!referral) {
        referralStatus = 'INVALID';
        referralMessage = 'Invalid referral code';
      } else if (!referral.isActive) {
        referralStatus = 'INACTIVE';
        referralMessage = 'This referral code is no longer active';
      } else if (primaryPhone && referral.ownerPhone === primaryPhone.trim()) {
        referralStatus = 'SELF_REFERRAL';
        referralMessage = 'Self-referral is not allowed';
      } else {
        validReferralPercent = referral.discountPercentage;
        referralStatus = 'VALID';
        referralMessage = `${referral.discountPercentage}% referral discount applied!`;
      }
    }

    const pricing = calculateBookingPricing({
      packageType: packageType as PackageType,
      travellersCount: Number(travellersCount),
      referralCode: referralStatus === 'VALID' ? referralCode.trim().toUpperCase() : undefined,
      validReferralPercent,
    });

    return NextResponse.json({
      pricing,
      referral: {
        status: referralStatus,
        message: referralMessage,
        discountPercent: validReferralPercent,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Pricing calculation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
