import { PRICING_DEFAULTS } from './constants';
import { BookingPricing } from '@/types';
import { getTripConfig } from './trip-config';

export interface PricingCalculationInput {
  travellersCount: number;
  packageType?: string; // Optional legacy parameter, ignored
  referralCode?: string | null; // Ignored: no referrals allowed
  validReferralPercent?: number; // Ignored: no discounts allowed
}

/**
 * Server-side Profit-Safe Pricing Engine for HIMALAYAN ESCAPE
 * Dynamic source of truth loaded from TripConfig with fallback to defaults.
 */
export async function calculateDynamicBookingPricing(input: PricingCalculationInput): Promise<BookingPricing> {
  const config = await getTripConfig();
  const rawCount = Number(input.travellersCount) || 1;
  const travellersCount = Math.max(1, Math.min(rawCount, config.totalCapacity || 75));

  const pricePerTraveller = config.packagePrice || PRICING_DEFAULTS.pricePerTraveller;
  const reservationAmountPerTraveller = config.depositPrice || PRICING_DEFAULTS.reservationAmountPerTraveller;
  const remainingBalancePerTraveller = Math.max(0, pricePerTraveller - reservationAmountPerTraveller);

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

/**
 * Synchronous fallback pricing calculation
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
