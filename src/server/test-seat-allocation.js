/**
 * Test Suite: Himalayan Escape Smart Seat Allocation
 * Tests adjacent clustering, pair detection, rear bench handling, and fallback logic.
 */

const assert = require('assert');

// Simulate the findBestAdjacentSeats algorithm
const PAIR_MAP = {
  L1: ['L2'], L2: ['L1'],
  L3: ['L4'], L4: ['L3'],
  L5: ['L6'], L6: ['L5'],
  L7: ['L8'], L8: ['L7'],
  R1: ['R2'], R2: ['R1'],
  R3: ['R4'], R4: ['R3'],
  R5: ['R6'], R6: ['R5'],
  R7: ['R8'], R8: ['R7'],
  B1: ['B2'], B2: ['B1', 'B3'], B3: ['B2', 'B4'], B4: ['B3', 'B5'], B5: ['B4'],
};

function testAllocationLogic() {
  console.log('🧪 Starting Smart Seat Allocation Unit Tests...\n');

  // Load from TS compiled or simulate exact function
  const { findBestAdjacentSeats } = require('../../dist-test-seat-alloc.js');

  let passed = 0;
  let total = 0;

  function runTest(desc, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${desc}: ${err.message}`);
    }
  }

  // 1. Single traveller allocation
  runTest('1 traveller default selects front window L1 when available', () => {
    const seats = findBestAdjacentSeats(['L1', 'L2', 'R1', 'R2'], 1);
    assert.deepStrictEqual(seats, ['L1']);
  });

  runTest('1 traveller selects aisle seat when AISLE preferred', () => {
    const seats = findBestAdjacentSeats(['L1', 'L2', 'R1', 'R2'], 1, 'AISLE');
    assert.deepStrictEqual(seats, ['L2']);
  });

  runTest('1 traveller selects window seat when WINDOW preferred', () => {
    const seats = findBestAdjacentSeats(['L2', 'R2', 'R1'], 1, 'WINDOW');
    assert.deepStrictEqual(seats, ['R2']);
  });

  // 2. Pair allocation
  runTest('2 travellers allocates adjacent pair L1, L2', () => {
    const seats = findBestAdjacentSeats(['L1', 'L2', 'R1', 'R3'], 2);
    assert.deepStrictEqual(seats, ['L1', 'L2']);
  });

  runTest('2 travellers allocates right pair R1, R2 if left side taken', () => {
    const seats = findBestAdjacentSeats(['L1', 'R1', 'R2', 'B1'], 2);
    assert.deepStrictEqual(seats, ['R1', 'R2']);
  });

  // 3. 3 travellers
  runTest('3 travellers allocates rear bench trio B1, B2, B3 when available', () => {
    const seats = findBestAdjacentSeats(['B1', 'B2', 'B3', 'L5'], 3);
    assert.deepStrictEqual(seats, ['B1', 'B2', 'B3']);
  });

  // 4. 4 travellers (Squad quad across aisle)
  runTest('4 travellers allocates row quad L1, L2, R1, R2 together', () => {
    const seats = findBestAdjacentSeats(['L1', 'L2', 'R1', 'R2', 'B5'], 4);
    assert.deepStrictEqual(seats, ['L1', 'L2', 'R1', 'R2']);
  });

  // 5. 5 travellers (Full rear bench)
  runTest('5 travellers allocates entire 5-seat rear bench B1-B5 together', () => {
    const seats = findBestAdjacentSeats(['B1', 'B2', 'B3', 'B4', 'B5', 'L7'], 5);
    assert.deepStrictEqual(seats, ['B1', 'B2', 'B3', 'B4', 'B5']);
  });

  // 6. 6 travellers (Adjacent two full rows)
  runTest('6 travellers allocates two adjacent full rows L1, L2, R1, R2, L3, L4', () => {
    const allSeats = ['L1', 'L2', 'R1', 'R2', 'L3', 'L4', 'R3', 'R4'];
    const seats = findBestAdjacentSeats(allSeats, 6);
    assert.deepStrictEqual(seats, ['L1', 'L2', 'R1', 'R2', 'L3', 'L4']);
  });

  console.log(`\n🎉 Results: ${passed}/${total} tests passed.\n`);
  if (passed !== total) process.exit(1);
}

// Write temporary transpiled version to execute directly with node
const fs = require('fs');
const tsContent = fs.readFileSync(__dirname + '/../lib/bus-seating.ts', 'utf8');

// Simple regex extraction of findBestAdjacentSeats
const match = tsContent.match(/export function findBestAdjacentSeats[\s\S]*?\n\}/);
if (match) {
  // Strip TS types
  let jsCode = match[0]
    .replace('export function', 'function')
    .replace(/:\s*string\[\]/g, '')
    .replace(/:\s*number/g, '')
    .replace(/:\s*SittingPreference\s*=\s*'NO_PREFERENCE'/g, " = 'NO_PREFERENCE'")
    .replace(/:\s*Array<.*?>/g, '')
    .replace(/:\s*string/g, '')
    .replace(/<.*?>/g, '');
  jsCode += '\nmodule.exports = { findBestAdjacentSeats };';
  fs.writeFileSync(__dirname + '/../../dist-test-seat-alloc.js', jsCode);
  testAllocationLogic();
  try {
    fs.unlinkSync(__dirname + '/../../dist-test-seat-alloc.js');
  } catch {}
} else {
  console.error('Could not locate findBestAdjacentSeats in bus-seating.ts');
  process.exit(1);
}
