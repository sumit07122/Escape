import crypto from 'crypto';

/**
 * Generate a cryptographically secure random verification token for tickets
 * Never contains personal traveller data directly.
 */
export function generateTicketQrToken(): string {
  const bytes = crypto.randomBytes(16).toString('hex').toUpperCase();
  // Format: GHE-XXXX-XXXX-XXXX
  return `GHE-VERIFY-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}-${bytes.slice(8, 12)}-${bytes.slice(12, 16)}`;
}

/**
 * Generate a unique Booking ID: GHE-XXXXXX
 */
export function generateBookingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GHE-${code}`;
}

/**
 * Generate unique Ticket Number: TKT-GHE-XXXXX
 */
export function generateTicketNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `TKT-GHE-${num}`;
}

/**
 * Generate unique Referral Code for traveller: GLA-NAME-XX
 */
export function generateReferralCode(travellerName: string): string {
  const cleanName = travellerName.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'GLA';
  const rand = Math.floor(10 + Math.random() * 90);
  return `GLA-${cleanName}${rand}`;
}
