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
      // Right window: R2, R4, R6, R8, R10
      // Rear window: B1, B5
      return ['L1', 'L3', 'L5', 'L7', 'L9', 'R2', 'R4', 'R6', 'R8', 'R10', 'B1', 'B5'].includes(num);

    case 'AISLE':
      // Left aisle: L2, L4, L6, L8, L10
      // Right aisle: R1, R3, R5, R7, R9
      return ['L2', 'L4', 'L6', 'L8', 'L10', 'R1', 'R3', 'R5', 'R7', 'R9'].includes(num);

    case 'FRONT':
      // Rows 1 and 2
      return seat.rowNumber === 1 || seat.rowNumber === 2;

    case 'BACK':
      // Rows 5 (L9, L10, R9, R10) and 6 (B1-B5)
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
    ['L9', 'L10'],
    ['R9', 'R10'],
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
 * Intelligent seat allocator: automatically finds and clusters the best adjacent
 * seats for 1-6 travellers based on seat availability and seating preferences.
 */
export function findBestAdjacentSeats(
  availableSeats: string[],
  count: number,
  preference: SittingPreference = 'NO_PREFERENCE'
): string[] {
  if (count <= 0 || availableSeats.length === 0) return [];
  const targetCount = Math.min(count, availableSeats.length);
  const availableSet = new Set(availableSeats.map((s) => s.toUpperCase()));

  // 1 traveller: pick based on preference, defaulting to front window
  if (targetCount === 1) {
    if (preference === 'WINDOW') {
      const windows = ['L1', 'R2', 'L3', 'R4', 'L5', 'R6', 'L7', 'R8', 'L9', 'R10', 'B1', 'B5'];
      const pick = windows.find((s) => availableSet.has(s));
      if (pick) return [pick];
    } else if (preference === 'AISLE') {
      const aisles = ['L2', 'R1', 'L4', 'R3', 'L6', 'R5', 'L8', 'R7', 'L10', 'R9'];
      const pick = aisles.find((s) => availableSet.has(s));
      if (pick) return [pick];
    } else if (preference === 'FRONT') {
      const front = ['L1', 'L2', 'R1', 'R2', 'L3', 'L4', 'R3', 'R4'];
      const pick = front.find((s) => availableSet.has(s));
      if (pick) return [pick];
    } else if (preference === 'BACK') {
      const back = ['B1', 'B2', 'B3', 'B4', 'B5', 'L9', 'L10', 'R9', 'R10'];
      const pick = back.find((s) => availableSet.has(s));
      if (pick) return [pick];
    }

    // Default priority order: front window -> front aisle -> middle window -> middle aisle -> rear
    const generalPriority = [
      'L1', 'R2', 'L2', 'R1',
      'L3', 'R4', 'L4', 'R3',
      'L5', 'R6', 'L6', 'R5',
      'L7', 'R8', 'L8', 'R7',
      'L9', 'R10', 'L10', 'R9',
      'B1', 'B2', 'B3', 'B4', 'B5'
    ];
    const pick = generalPriority.find((s) => availableSet.has(s));
    if (pick) return [pick];
    return [availableSeats[0]];
  }

  // 2 travellers: find best adjacent pair
  if (targetCount === 2) {
    const pairs: Array<[string, string]> = [
      ['L1', 'L2'], ['R1', 'R2'],
      ['L3', 'L4'], ['R3', 'R4'],
      ['L5', 'L6'], ['R5', 'R6'],
      ['L7', 'L8'], ['R7', 'R8'],
      ['L9', 'L10'], ['R9', 'R10'],
      ['B1', 'B2'], ['B2', 'B3'], ['B3', 'B4'], ['B4', 'B5'],
    ];
    for (const [s1, s2] of pairs) {
      if (availableSet.has(s1) && availableSet.has(s2)) {
        return [s1, s2];
      }
    }
  }

  // 3 travellers: check rear bench trio or pair + nearby aisle
  if (targetCount === 3) {
    const rearTrios = [
      ['B1', 'B2', 'B3'],
      ['B2', 'B3', 'B4'],
      ['B3', 'B4', 'B5'],
    ];
    for (const trio of rearTrios) {
      if (trio.every((s) => availableSet.has(s))) {
        return trio;
      }
    }
    const pairPlusOne: Array<[string, string, string]> = [
      ['L1', 'L2', 'R1'], ['R1', 'R2', 'L2'],
      ['L3', 'L4', 'R3'], ['R3', 'R4', 'L4'],
      ['L1', 'L2', 'L3'], ['R1', 'R2', 'R3'],
      ['L5', 'L6', 'R5'], ['R5', 'R6', 'L6'],
    ];
    for (const trio of pairPlusOne) {
      if (trio.every((s) => availableSet.has(s))) {
        return trio;
      }
    }
  }

  // 4 travellers: check 4-seat quad (same row across aisle or 2 adjacent pairs)
  if (targetCount === 4) {
    const quads: Array<[string, string, string, string]> = [
      ['L1', 'L2', 'R1', 'R2'],
      ['L3', 'L4', 'R3', 'R4'],
      ['L5', 'L6', 'R5', 'R6'],
      ['L7', 'L8', 'R7', 'R8'],
      ['L9', 'L10', 'R9', 'R10'],
      ['L1', 'L2', 'L3', 'L4'],
      ['R1', 'R2', 'R3', 'R4'],
      ['B1', 'B2', 'B3', 'B4'],
      ['B2', 'B3', 'B4', 'B5'],
    ];
    for (const quad of quads) {
      if (quad.every((s) => availableSet.has(s))) {
        return quad;
      }
    }
  }

  // 5 travellers: full rear bench or 4-quad + 1
  if (targetCount === 5) {
    const rearBench = ['B1', 'B2', 'B3', 'B4', 'B5'];
    if (rearBench.every((s) => availableSet.has(s))) {
      return rearBench;
    }
    const quadPlusOne: Array<string[]> = [
      ['L1', 'L2', 'R1', 'R2', 'L3'],
      ['L1', 'L2', 'R1', 'R2', 'R3'],
      ['L3', 'L4', 'R3', 'R4', 'L5'],
      ['L3', 'L4', 'R3', 'R4', 'R5'],
    ];
    for (const cluster of quadPlusOne) {
      if (cluster.every((s) => availableSet.has(s))) {
        return cluster;
      }
    }
  }

  // 6 travellers: two adjacent full rows or rear bench + 1
  if (targetCount === 6) {
    const sixClusters: Array<string[]> = [
      ['L1', 'L2', 'R1', 'R2', 'L3', 'L4'],
      ['L3', 'L4', 'R3', 'R4', 'L5', 'L6'],
      ['B1', 'B2', 'B3', 'B4', 'B5', 'L7'],
      ['B1', 'B2', 'B3', 'B4', 'B5', 'R7'],
    ];
    for (const cluster of sixClusters) {
      if (cluster.every((s) => availableSet.has(s))) {
        return cluster;
      }
    }
  }

  // Fallback: Greedy adjacent clustering by row order
  const orderRank = [
    'L1', 'L2', 'R1', 'R2',
    'L3', 'L4', 'R3', 'R4',
    'L5', 'L6', 'R5', 'R6',
    'L7', 'L8', 'R7', 'R8',
    'B1', 'B2', 'B3', 'B4', 'B5',
  ];
  const orderedAvailable = orderRank.filter((s) => availableSet.has(s));
  if (orderedAvailable.length >= targetCount) {
    return orderedAvailable.slice(0, targetCount);
  }

  return availableSeats.slice(0, targetCount);
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
