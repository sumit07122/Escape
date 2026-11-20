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

  const standardPackagePrice = Number(config.packagePrice) || 6200;
  const duoPackagePrice = Number(config.duoPackagePrice) || 5999;
  const groupPackagePrice = Number(config.groupPackagePrice) || 5800;
  const groupThreshold = Number(config.groupSizeThreshold) || 3;

  // Student Offer Rules:
  // 1: Solo (₹6,200)
  // 2: Duo Explorer (₹5,999/head)
  // 3+: Squad Cabin (₹5,800/head)
  let pricePerTraveller = standardPackagePrice;
  let isGroupRate = false;
  let savingsPerTraveller = 0;

  if (travellersCount === 2) {
    pricePerTraveller = duoPackagePrice;
    isGroupRate = true;
    savingsPerTraveller = Math.max(0, standardPackagePrice - duoPackagePrice);
  } else if (travellersCount >= groupThreshold) {
    pricePerTraveller = groupPackagePrice;
    isGroupRate = true;
    savingsPerTraveller = Math.max(0, standardPackagePrice - groupPackagePrice);
  }

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
      // In offline/fallback mode, no unauthorized arbitrary coupon discounts
      couponDiscount = 0;
      appliedCouponCode = null;
    }
  }

  const finalTotal = Math.max(0, rawTotal - couponDiscount);
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
    discountAmount: couponDiscount + (travellersCount * savingsPerTraveller),
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

  const standardPackagePrice = 6200;
  const duoPackagePrice = 5999;
  const groupPackagePrice = 5800;
  const groupThreshold = 3;

  let pricePerTraveller = standardPackagePrice;
  let isGroupRate = false;
  let savingsPerTraveller = 0;

  if (travellersCount === 2) {
    pricePerTraveller = duoPackagePrice;
    isGroupRate = true;
    savingsPerTraveller = Math.max(0, standardPackagePrice - duoPackagePrice);
  } else if (travellersCount >= groupThreshold) {
    pricePerTraveller = groupPackagePrice;
    isGroupRate = true;
    savingsPerTraveller = Math.max(0, standardPackagePrice - groupPackagePrice);
  }

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
    discountAmount: travellersCount * savingsPerTraveller,
    isGroupRate,
    groupThreshold,
    groupPackagePrice,
    standardPackagePrice,
    savingsPerTraveller,
  };
}
