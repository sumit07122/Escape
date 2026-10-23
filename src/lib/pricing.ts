import { PRICING_DEFAULTS } from './constants';
import { BookingPricing } from '@/types';
import { getTripConfig } from './trip-config';
import { db } from './db';

export interface PricingCalculationInput {
  travellersCount: number;
  packageType?: string;
  couponCode?: string | null;
  referralCode?: string | null;
}

/**
 * Server-side Tiered Squad Pricing Engine for HIMALAYAN ESCAPE
 * Dynamic source of truth loaded from TripConfig with group discount thresholds & coupon discounts.
 */
export async function calculateDynamicBookingPricing(input: PricingCalculationInput): Promise<BookingPricing> {
  const config = await getTripConfig();
  const rawCount = Number(input.travellersCount) || 1;
  const travellersCount = Math.max(1, Math.min(rawCount, config.totalCapacity || 75));

  const standardPackagePrice = Number(config.packagePrice) || 6500;
  const groupPackagePrice = Number(config.groupPackagePrice) || 6200;
  const groupThreshold = Number(config.groupSizeThreshold) || 5;

  const isGroupRate = travellersCount >= groupThreshold;
  const pricePerTraveller = isGroupRate ? groupPackagePrice : standardPackagePrice;
  const reservationAmountPerTraveller = Number(config.depositPrice) || 1000;

  const rawTotal = travellersCount * pricePerTraveller;
  const depositTotal = travellersCount * reservationAmountPerTraveller;

  // Coupon lookup & discount
  let couponDiscount = 0;
  let appliedCouponCode: string | null = null;
  if (input.couponCode) {
    const cleanCode = input.couponCode.trim().toUpperCase();
    try {
      const coupon = await db.coupon.findUnique({
        where: { code: cleanCode },
      });
      if (coupon && coupon.isActive && (coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses)) {
        if (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) {
          couponDiscount = Number(coupon.discountAmount) || 0;
          appliedCouponCode = coupon.code;
        }
      }
    } catch {
      // In-memory fallback coupons
      if (cleanCode === 'EARLYBIRD') {
        couponDiscount = 200;
        appliedCouponCode = 'EARLYBIRD';
      } else if (cleanCode === 'SQUAD5') {
        couponDiscount = 500;
        appliedCouponCode = 'SQUAD5';
      }
    }
  }

  const finalTotal = Math.max(0, rawTotal - couponDiscount);
  const gateBalanceDue = Math.max(0, finalTotal - depositTotal);
  const savingsPerTraveller = isGroupRate ? Math.max(0, standardPackagePrice - groupPackagePrice) : 0;

  return {
    travellersCount,
    baseAmount: rawTotal,
    totalAmount: finalTotal,
    pricePerTraveller,
    reservationAmountPerTraveller,
    reservationAmount: depositTotal,
    remainingBalance: gateBalanceDue,
    finalAmount: finalTotal,
    discountAmount: couponDiscount,
    isGroupRate,
    groupThreshold,
    groupPackagePrice,
    standardPackagePrice,
    savingsPerTraveller,
    couponCode: appliedCouponCode,
    couponDiscount,
  };
}

/**
 * Synchronous fallback pricing calculation
 */
export function calculateBookingPricing(input: PricingCalculationInput): BookingPricing {
  const rawCount = Number(input.travellersCount) || 1;
  const travellersCount = Math.max(1, Math.min(rawCount, 75));

  const standardPackagePrice = 6500;
  const groupPackagePrice = 6200;
  const groupThreshold = 5;

  const isGroupRate = travellersCount >= groupThreshold;
  const pricePerTraveller = isGroupRate ? groupPackagePrice : standardPackagePrice;
  const reservationAmountPerTraveller = 1000;

  const rawTotal = travellersCount * pricePerTraveller;
  const depositTotal = travellersCount * reservationAmountPerTraveller;
  const finalTotal = rawTotal;
  const gateBalanceDue = Math.max(0, finalTotal - depositTotal);

  return {
    travellersCount,
    baseAmount: rawTotal,
    totalAmount: finalTotal,
    pricePerTraveller,
    reservationAmountPerTraveller,
    reservationAmount: depositTotal,
    remainingBalance: gateBalanceDue,
    finalAmount: finalTotal,
    discountAmount: 0,
    isGroupRate,
    groupThreshold,
    groupPackagePrice,
    standardPackagePrice,
    savingsPerTraveller: isGroupRate ? 300 : 0,
  };
}
