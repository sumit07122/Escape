import { BUS_25_SEATS_LAYOUT, SeatTemplate, PRICING_DEFAULTS } from './constants';
import { SeatInfo, SeatStatus, SittingPreference } from '@/types';

export function getBaseSeatTemplate(): SeatTemplate[] {
  return [...BUS_25_SEATS_LAYOUT];
}

/**
 * Checks whether a seat matches a sitting preference recommendation
 */
export function isSeatRecommended(
  seat: { seatNumber: string; position: string; rowNumber: number; side: string },
  preference: SittingPreference
): boolean {
  if (preference === 'NO_PREFERENCE') return false;

  const num = seat.seatNumber;

  switch (preference) {
    case 'WINDOW':
      // Left window: L1, L3, L5, L7, L9
      // Right window: R2, R4, R6, R8, R9
      // Rear window: B1, B5
      return ['L1', 'L3', 'L5', 'L7', 'L9', 'R2', 'R4', 'R6', 'R8', 'R9', 'B1', 'B5'].includes(num);

    case 'AISLE':
      // Left aisle: L2, L4, L6, L8
      // Right aisle: R1, R3, R5, R7
      return ['L2', 'L4', 'L6', 'L8', 'R1', 'R3', 'R5', 'R7'].includes(num);

    case 'FRONT':
      // Rows 1 and 2
      return seat.rowNumber === 1 || seat.rowNumber === 2;

    case 'BACK':
      // Rows 5 (L9, R9) and 6 (B1-B5)
      return seat.rowNumber === 5 || seat.rowNumber === 6;

    default:
      return false;
  }
}

/**
 * Identify best adjacent pairs for couples or group members
 */
export function findAdjacentSeatPairs(availableSeatNumbers: string[]): Array<[string, string]> {
  const preferredPairs: Array<[string, string]> = [
    ['L1', 'L2'],
    ['R1', 'R2'],
    ['L3', 'L4'],
    ['R3', 'R4'],
    ['L5', 'L6'],
    ['R5', 'R6'],
    ['L7', 'L8'],
    ['R7', 'R8'],
    ['B1', 'B2'],
    ['B2', 'B3'],
    ['B3', 'B4'],
    ['B4', 'B5'],
  ];

  return preferredPairs.filter(([s1, s2]) => 
    availableSeatNumbers.includes(s1) && availableSeatNumbers.includes(s2)
  );
}

/**
 * Determine hold expiration timestamp (10 minutes from now)
 */
export function calculateHoldExpiration(minutes: number = PRICING_DEFAULTS.seatHoldMinutes): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
  return expiresAt;
}

/**
 * Format remaining seconds into MM:SS for countdown timer
 */
export function formatHoldCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
