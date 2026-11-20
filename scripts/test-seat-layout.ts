import assert from 'assert';
import { BUS_25_SEATS_LAYOUT } from '../src/lib/constants';
import { generateBusSeatLayout, getPassengerCapacity } from '../src/lib/bus-layout';
import { isSeatRecommended, findAdjacentSeatPairs } from '../src/lib/bus-seating';

console.log('Testing 25 passenger seat bus layout...');

// 1. Check constants
assert.strictEqual(BUS_25_SEATS_LAYOUT.length, 27, 'Total seats in template must be 27');
const passengerSeats = BUS_25_SEATS_LAYOUT.filter(s => s.seatType === 'PASSENGER');
assert.strictEqual(passengerSeats.length, 25, 'Total passenger seats must be exactly 25');

const leftSeats = passengerSeats.filter(s => s.side === 'LEFT');
assert.strictEqual(leftSeats.length, 10, 'Left side must have 10 seats');

const rightSeats = passengerSeats.filter(s => s.side === 'RIGHT');
assert.strictEqual(rightSeats.length, 10, 'Right side must have 10 seats');

const rearSeats = passengerSeats.filter(s => s.side === 'REAR');
assert.strictEqual(rearSeats.length, 5, 'Rear bench must have 5 seats');

// Check row 5 seats
const l9 = BUS_25_SEATS_LAYOUT.find(s => s.seatNumber === 'L9');
const l10 = BUS_25_SEATS_LAYOUT.find(s => s.seatNumber === 'L10');
const r9 = BUS_25_SEATS_LAYOUT.find(s => s.seatNumber === 'R9');
const r10 = BUS_25_SEATS_LAYOUT.find(s => s.seatNumber === 'R10');

assert(l9 && l9.rowNumber === 5 && l9.position === 'WINDOW', 'L9 must be row 5 Window');
assert(l10 && l10.rowNumber === 5 && l10.position === 'AISLE', 'L10 must be row 5 Aisle under L8');
assert(r9 && r9.rowNumber === 5 && r9.position === 'AISLE', 'R9 must be row 5 Aisle under R7');
assert(r10 && r10.rowNumber === 5 && r10.position === 'WINDOW', 'R10 must be row 5 Window under R8');

// 2. Check generator
const generated = generateBusSeatLayout(5, 5);
assert.strictEqual(generated.length, 27, 'Generated layout must have 27 total seats');
const genPassenger = generated.filter(s => s.seatType === 'PASSENGER');
assert.strictEqual(genPassenger.length, 25, 'Generated passenger seats must be 25');
assert.strictEqual(getPassengerCapacity(5, 5), 25, 'Calculated passenger capacity for 5 rows + 5 rear seats must be 25');

// 3. Check seating logic
assert(isSeatRecommended(l10!, 'AISLE'), 'L10 should be recommended for AISLE');
assert(isSeatRecommended(r10!, 'WINDOW'), 'R10 should be recommended for WINDOW');

const pairs = findAdjacentSeatPairs(['L9', 'L10', 'R9', 'R10']);
assert(pairs.some(([s1, s2]) => s1 === 'L9' && s2 === 'L10'), 'Pair L9-L10 must be recognized');
assert(pairs.some(([s1, s2]) => s1 === 'R9' && s2 === 'R10'), 'Pair R9-R10 must be recognized');

console.log('✓ All 25 passenger seat layout unit tests PASSED successfully!');
