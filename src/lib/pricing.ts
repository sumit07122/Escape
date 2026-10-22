import { PRICING_DEFAULTS } from './constants';
import { BookingPricing, PackageType } from '@/types';

export interface PricingCalculationInput {
  packageType: PackageType;
  travellersCount: number;
  referralCode?: string | null;
  validReferralPercent?: number; // verified from DB, e.g. 5% or 10%
}

/**
 * Server-side Pricing Engine
 * Never trusts client-side totals.
 * 
 * Rules:
 * 1. Single: ₹6,200 per traveller
 * 2. Couple: ₹6,500 total for 2 travellers
 * 3. Group: 5 Paid + 1 Free (so every 6 travellers pay for 5)
 * 4. Reservation amount: ₹1,000 to confirm seat
 * 5. Referral discount: 5% per valid referral, maximum 10%
 * 6. Remaining balance = Final amount - Reservation amount
 */
export function calculateBookingPricing(input: PricingCalculationInput): BookingPricing {
  const { packageType, travellersCount, referralCode, validReferralPercent = 0 } = input;
  
  let baseAmount = 0;
  let groupDiscountAmount = 0;
  let paidTravellersCount = travellersCount;
  let freeTravellersCount = 0;
  let isGroupOffer = false;

  if (packageType === 'SINGLE') {
    baseAmount = PRICING_DEFAULTS.singlePrice * travellersCount;
  } else if (packageType === 'COUPLE') {
    // Couple package is strictly ₹6,500 for two travellers
    const couples = Math.floor(travellersCount / 2);
    const singles = travellersCount % 2;
    baseAmount = (couples * PRICING_DEFAULTS.couplePrice) + (singles * PRICING_DEFAULTS.singlePrice);
  } else if (packageType === 'GROUP') {
    // 5 Paid + 1 Free group offer
    // For 6 travellers: 5 paid (5 * 6200 = 31000) + 1 free (discount of 6200)
    const groupsOfSix = Math.floor(travellersCount / 6);
    freeTravellersCount = groupsOfSix * PRICING_DEFAULTS.groupFreeCount;
    paidTravellersCount = travellersCount - freeTravellersCount;
    
    // Base amount is total travellers * single price
    const fullPrice = travellersCount * PRICING_DEFAULTS.singlePrice;
    groupDiscountAmount = freeTravellersCount * PRICING_DEFAULTS.singlePrice;
    baseAmount = fullPrice - groupDiscountAmount;
    isGroupOffer = freeTravellersCount > 0;
  } else {
    baseAmount = PRICING_DEFAULTS.singlePrice * travellersCount;
  }

  // Referral discount calculation: capped at maxReferralDiscountPercent (10%)
  const effectiveReferralPercent = Math.min(
    Math.max(0, validReferralPercent),
    PRICING_DEFAULTS.maxReferralDiscountPercent
  );

  const referralDiscountAmount = referralCode && effectiveReferralPercent > 0
    ? Math.round((baseAmount * effectiveReferralPercent) / 100)
    : 0;

  const finalAmount = Math.max(0, baseAmount - referralDiscountAmount);
  
  // Reservation amount is ₹1,000 per booking deposit (or full amount if total is lower)
  const reservationAmount = Math.min(PRICING_DEFAULTS.reservationAmount, finalAmount);
  const remainingBalance = Math.max(0, finalAmount - reservationAmount);

  return {
    packageType,
    travellersCount,
    baseAmount: baseAmount + groupDiscountAmount, // Full sticker price
    groupDiscountAmount,
    referralCode: referralCode || undefined,
    referralDiscountPercent: effectiveReferralPercent,
    referralDiscountAmount,
    finalAmount,
    reservationAmount,
    remainingBalance,
    isGroupOffer,
    paidTravellersCount,
    freeTravellersCount,
  };
}
