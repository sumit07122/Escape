import { PRICING_DEFAULTS } from './constants';
import { BookingPricing } from '@/types';

export interface PricingCalculationInput {
  travellersCount: number;
  packageType?: string; // Optional legacy parameter, ignored
  referralCode?: string | null; // Ignored: no referrals allowed
  validReferralPercent?: number; // Ignored: no discounts allowed
}

/**
 * Server-side Profit-Safe Pricing Engine for HIMALAYAN ESCAPE
 * Single source of truth:
 * - ₹6,200 per traveller (total amount = travellers × 6,200)
 * - ₹1,000 reservation deposit per traveller (pay now = travellers × 1,000)
 * - ₹5,200 remaining balance per traveller (remaining = travellers × 5,200)
 * 
 * STRICT POLICY:
 * - NO referrals
 * - NO 5+1 free travellers
 * - NO couple discount
 * - NO early bird / coupon / festival discounts
 * - Zero discounts guaranteed
 */
export function calculateBookingPricing(input: PricingCalculationInput): BookingPricing {
  const rawCount = Number(input.travellersCount) || 1;
  const travellersCount = Math.max(1, Math.min(rawCount, 75));

  const pricePerTraveller = PRICING_DEFAULTS.pricePerTraveller; // ₹6,200
  const reservationAmountPerTraveller = PRICING_DEFAULTS.reservationAmountPerTraveller; // ₹1,000
  const remainingBalancePerTraveller = PRICING_DEFAULTS.remainingBalancePerTraveller; // ₹5,200

  const totalAmount = travellersCount * pricePerTraveller;
  const reservationAmount = travellersCount * reservationAmountPerTraveller;
  const remainingBalance = travellersCount * remainingBalancePerTraveller;
  const discountAmount = 0;
  const finalAmount = totalAmount;

  return {
    travellersCount,
    baseAmount: totalAmount,
    totalAmount,
    pricePerTraveller,
    reservationAmountPerTraveller,
    reservationAmount,
    remainingBalance,
    finalAmount,
    discountAmount,
  };
}
