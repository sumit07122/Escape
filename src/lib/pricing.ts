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
 * Server-side Pricing Engine for HIMALAYAN ESCAPE — CHRISTMAS SPECIAL 2026
 * Single Source of Truth:
 * - Package price: ₹6,199 per person.
 * - Booking deposit: ₹1,000 per traveller.
 * - Remaining balance: ₹5,199 per traveller.
 * - Group offer: ₹600 discount on the entire booking when 5 or more travellers book together.
 *   (Applied ONCE to the booking total, never stacked, applied to remaining balance).
 */
export async function calculateDynamicBookingPricing(input: PricingCalculationInput): Promise<BookingPricing> {
  const config = await getTripConfig();
  const rawCount = Number(input.travellersCount) || 1;
  const travellersCount = Math.max(1, Math.min(rawCount, config.totalCapacity || 50));

  const standardPackagePrice = Number(config.packagePrice) || PRICING_DEFAULTS.pricePerTraveller;
  const reservationAmountPerTraveller = Number(config.depositPrice) || PRICING_DEFAULTS.reservationAmountPerTraveller;
  const groupThreshold = Number(config.groupSizeThreshold) || PRICING_DEFAULTS.groupThreshold;
  const groupDiscountTotal = Number(config.groupDiscountAmount) || PRICING_DEFAULTS.groupDiscountAmount;

  // Authoritative Pricing Formula
  const baseAmount = travellersCount * standardPackagePrice;
  const isGroupRate = travellersCount >= groupThreshold;
  const appliedGroupDiscount = isGroupRate ? groupDiscountTotal : 0;

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
      couponDiscount = 0;
      appliedCouponCode = null;
    }
  }

  const totalDiscount = appliedGroupDiscount + couponDiscount;
  const finalTotal = Math.max(0, baseAmount - totalDiscount);
  const depositTotal = travellersCount * reservationAmountPerTraveller;
  const remainingBalance = Math.max(0, finalTotal - depositTotal);

  return {
    travellersCount,
    baseAmount,
    totalAmount: finalTotal,
    pricePerTraveller: standardPackagePrice,
    reservationAmountPerTraveller,
    reservationAmount: depositTotal,
    remainingBalance,
    finalAmount: finalTotal,
    discountAmount: totalDiscount,
    groupDiscountAmount: appliedGroupDiscount,
    isGroupRate,
    groupThreshold,
    groupPackagePrice: standardPackagePrice,
    standardPackagePrice,
    savingsPerTraveller: isGroupRate ? Math.round(appliedGroupDiscount / travellersCount) : 0,
    couponCode: appliedCouponCode,
    couponDiscount,
  };
}

/**
 * Synchronous fallback pricing calculation
 */
export function calculateBookingPricing(input: PricingCalculationInput): BookingPricing {
  const rawCount = Number(input.travellersCount) || 1;
  const travellersCount = Math.max(1, Math.min(rawCount, 50));

  const standardPackagePrice = PRICING_DEFAULTS.pricePerTraveller;
  const reservationAmountPerTraveller = PRICING_DEFAULTS.reservationAmountPerTraveller;
  const groupThreshold = PRICING_DEFAULTS.groupThreshold;
  const groupDiscountTotal = PRICING_DEFAULTS.groupDiscountAmount;

  const baseAmount = travellersCount * standardPackagePrice;
  const isGroupRate = travellersCount >= groupThreshold;
  const appliedGroupDiscount = isGroupRate ? groupDiscountTotal : 0;

  const finalTotal = Math.max(0, baseAmount - appliedGroupDiscount);
  const depositTotal = travellersCount * reservationAmountPerTraveller;
  const remainingBalance = Math.max(0, finalTotal - depositTotal);

  return {
    travellersCount,
    baseAmount,
    totalAmount: finalTotal,
    pricePerTraveller: standardPackagePrice,
    reservationAmountPerTraveller,
    reservationAmount: depositTotal,
    remainingBalance,
    finalAmount: finalTotal,
    discountAmount: appliedGroupDiscount,
    groupDiscountAmount: appliedGroupDiscount,
    isGroupRate,
    groupThreshold,
    groupPackagePrice: standardPackagePrice,
    standardPackagePrice,
    savingsPerTraveller: isGroupRate ? Math.round(appliedGroupDiscount / travellersCount) : 0,
  };
}
