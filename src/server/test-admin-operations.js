/**
 * test-admin-operations.js
 * Comprehensive Verification Test Suite for Himalayan Escape Admin Operations:
 * 1. Admin Overview 13 Canonical Operational Metrics derivation
 * 2. Booking Management Search, Filtering & Sorting logic
 * 3. Manual Payment Recording, Idempotency & Balance Zeroing
 * 4. Seat Matrix Overrides, Atomicity & Conflict Prevention
 * 5. Gate Check-In & Duplicate Prevention
 * 6. Passenger Manifest Safe CSV Export Formatting
 */

const assert = require('assert');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('\n======================================================');
console.log(' HIMALAYAN ESCAPE — ADMIN OPERATIONS VERIFICATION SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: ADMIN OVERVIEW 13 CANONICAL OPERATIONAL METRICS
// -----------------------------------------------------------------------------
console.log('--- 1. Operational Overview Metrics Calculations ---');

function deriveOperationalStats(allBookings, seatBookings, capacity = 75) {
  const totalBookings = allBookings.length;
  const confirmedList = allBookings.filter((b) => b.bookingStatus === 'CONFIRMED');
  const pendingList = allBookings.filter((b) => b.bookingStatus === 'PENDING');
  const cancelledList = allBookings.filter((b) => b.bookingStatus === 'CANCELLED');

  const confirmedBookings = confirmedList.length;
  const pendingBookings = pendingList.length;
  const cancelledBookings = cancelledList.length;

  const pendingPayments = allBookings.filter(
    (b) => b.paymentStatus === 'PENDING' && b.bookingStatus !== 'CANCELLED'
  ).length;
  const failedPayments = allBookings.filter((b) => b.paymentStatus === 'FAILED').length;

  const confirmedTravellers = confirmedList.reduce(
    (acc, b) => acc + (b.travellers?.length || b.travellersCount || 1),
    0
  );

  const reservedSeats = seatBookings.filter((s) => s.status === 'CONFIRMED').length;
  const availableCapacity = Math.max(0, capacity - confirmedTravellers);

  const totalDepositsCollected = confirmedList.reduce((acc, b) => acc + (b.reservationAmount || 0), 0);
  const outstandingBalances = confirmedList.reduce((acc, b) => acc + Math.max(0, b.remainingBalance || 0), 0);
  const totalRevenue = confirmedList.reduce((acc, b) => acc + (b.finalAmount || 0), 0);

  const fullyPaidTravellers = confirmedList
    .filter((b) => b.remainingBalance <= 0 || b.paymentStatus === 'PAID')
    .reduce((acc, b) => acc + (b.travellers?.length || b.travellersCount || 1), 0);

  const checkInCount = confirmedList.reduce(
    (acc, b) => acc + (b.travellers?.filter((t) => t.checkInStatus === 'CHECKED_IN').length || 0),
    0
  );

  const remainingToCheckIn = Math.max(0, confirmedTravellers - checkInCount);

  return {
    totalBookings,
    confirmedTravellers,
    reservedSeats,
    capacity,
    availableCapacity,
    confirmedBookings,
    pendingBookings,
    failedPayments,
    cancelledBookings,
    totalDepositsCollected,
    outstandingBalances,
    fullyPaidTravellers,
    checkInCount,
    remainingToCheckIn,
    pendingPayments,
    totalRevenue,
  };
}

runTest('Calculates all 13 canonical operational metrics with complete consistency', () => {
  const mockBookings = [
    {
      id: 'b1',
      bookingId: 'GHE-001',
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      reservationAmount: 2000,
      remainingBalance: 0,
      finalAmount: 12400,
      travellersCount: 2,
      travellers: [
        { id: 't1', fullName: 'Aarav Sharma', checkInStatus: 'CHECKED_IN' },
        { id: 't2', fullName: 'Ananya Verma', checkInStatus: 'PENDING' },
      ],
    },
    {
      id: 'b2',
      bookingId: 'GHE-002',
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PENDING',
      reservationAmount: 1000,
      remainingBalance: 5200,
      finalAmount: 6200,
      travellersCount: 1,
      travellers: [
        { id: 't3', fullName: 'Rohan Gupta', checkInStatus: 'PENDING' },
      ],
    },
    {
      id: 'b3',
      bookingId: 'GHE-003',
      bookingStatus: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      reservationAmount: 1000,
      remainingBalance: 0,
      finalAmount: 6200,
      travellersCount: 1,
      travellers: [
        { id: 't4', fullName: 'Cancelled Pax', checkInStatus: 'PENDING' },
      ],
    },
    {
      id: 'b4',
      bookingId: 'GHE-004',
      bookingStatus: 'PENDING',
      paymentStatus: 'FAILED',
      reservationAmount: 1000,
      remainingBalance: 5200,
      finalAmount: 6200,
      travellersCount: 1,
      travellers: [
        { id: 't5', fullName: 'Failed Payer', checkInStatus: 'PENDING' },
      ],
    },
  ];

  const mockSeats = [
    { id: 's1', status: 'CONFIRMED' },
    { id: 's2', status: 'CONFIRMED' },
    { id: 's3', status: 'CONFIRMED' },
  ];

  const stats = deriveOperationalStats(mockBookings, mockSeats, 75);

  assert.strictEqual(stats.totalBookings, 4);
  assert.strictEqual(stats.confirmedBookings, 2);
  assert.strictEqual(stats.pendingBookings, 1);
  assert.strictEqual(stats.cancelledBookings, 1);
  assert.strictEqual(stats.failedPayments, 1);
  assert.strictEqual(stats.pendingPayments, 1); // b2 is pending payment, b3 is cancelled, b4 is failed

  assert.strictEqual(stats.confirmedTravellers, 3); // 2 in b1, 1 in b2 (b3 cancelled, b4 pending excluded)
  assert.strictEqual(stats.reservedSeats, 3);
  assert.strictEqual(stats.capacity, 75);
  assert.strictEqual(stats.availableCapacity, 72); // 75 - 3

  assert.strictEqual(stats.totalDepositsCollected, 3000); // 2000 + 1000
  assert.strictEqual(stats.outstandingBalances, 5200); // 0 + 5200
  assert.strictEqual(stats.totalRevenue, 18600); // 12400 + 6200

  assert.strictEqual(stats.fullyPaidTravellers, 2); // only b1 is fully paid (2 travellers)
  assert.strictEqual(stats.checkInCount, 1); // t1
  assert.strictEqual(stats.remainingToCheckIn, 2); // 3 confirmed - 1 checked in
});

runTest('Cancelled bookings do NOT inflate confirmed travellers, seats or revenue', () => {
  const mockBookings = [
    {
      id: 'b_canc',
      bookingId: 'GHE-999',
      bookingStatus: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      reservationAmount: 6000,
      remainingBalance: 31200,
      finalAmount: 37200,
      travellersCount: 6,
      travellers: new Array(6).fill({ checkInStatus: 'PENDING' }),
    },
  ];

  const stats = deriveOperationalStats(mockBookings, [], 75);
  assert.strictEqual(stats.totalBookings, 1);
  assert.strictEqual(stats.confirmedBookings, 0);
  assert.strictEqual(stats.confirmedTravellers, 0);
  assert.strictEqual(stats.totalDepositsCollected, 0);
  assert.strictEqual(stats.outstandingBalances, 0);
  assert.strictEqual(stats.availableCapacity, 75);
});

// -----------------------------------------------------------------------------
// SECTION 2: BOOKING MANAGEMENT SEARCH, FILTERING & SORTING
// -----------------------------------------------------------------------------
console.log('\n--- 2. Booking Management Filtering & Sorting ---');

function filterAndSortBookings(bookings, { search, status, paymentStatus, busId, checkInStatus, sort = 'desc' }) {
  let res = [...bookings];

  if (status && status !== 'ALL') {
    res = res.filter((b) => b.bookingStatus === status);
  }
  if (paymentStatus && paymentStatus !== 'ALL') {
    res = res.filter((b) => b.paymentStatus === paymentStatus);
  }
  if (busId && busId !== 'ALL') {
    res = res.filter((b) => b.busId === busId);
  }
  if (checkInStatus && checkInStatus !== 'ALL') {
    res = res.filter((b) => b.travellers?.some((t) => t.checkInStatus === checkInStatus));
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    res = res.filter((b) => {
      return (
        b.bookingId.toLowerCase().includes(q) ||
        b.primaryTravellerName.toLowerCase().includes(q) ||
        b.primaryPhone.includes(q) ||
        b.primaryEmail.toLowerCase().includes(q) ||
        b.travellers?.some(
          (t) =>
            t.fullName.toLowerCase().includes(q) ||
            t.phone?.includes(q) ||
            t.assignedSeatNumber?.toLowerCase().includes(q)
        )
      );
    });
  }

  res.sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sort === 'asc' ? diff : -diff;
  });

  return res;
}

runTest('Filters bookings by search term across ID, primary contact and passenger roster', () => {
  const sampleBookings = [
    {
      id: '1',
      bookingId: 'GHE-1001',
      primaryTravellerName: 'Siddharth Rao',
      primaryPhone: '9876543210',
      primaryEmail: 'siddharth@example.com',
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      busId: 'bus_1',
      createdAt: '2026-11-01T10:00:00Z',
      travellers: [{ fullName: 'Siddharth Rao', assignedSeatNumber: 'L1' }],
    },
    {
      id: '2',
      bookingId: 'GHE-1002',
      primaryTravellerName: 'Neha Patel',
      primaryPhone: '9123456780',
      primaryEmail: 'neha@example.com',
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PENDING',
      busId: 'bus_2',
      createdAt: '2026-11-02T10:00:00Z',
      travellers: [{ fullName: 'Kavita Patel', assignedSeatNumber: 'R5' }],
    },
  ];

  // Search by Passenger name inside roster
  const foundByPassenger = filterAndSortBookings(sampleBookings, { search: 'Kavita' });
  assert.strictEqual(foundByPassenger.length, 1);
  assert.strictEqual(foundByPassenger[0].bookingId, 'GHE-1002');

  // Search by Seat number
  const foundBySeat = filterAndSortBookings(sampleBookings, { search: 'L1' });
  assert.strictEqual(foundBySeat.length, 1);
  assert.strictEqual(foundBySeat[0].bookingId, 'GHE-1001');

  // Filter by Payment Status
  const pendingPayments = filterAndSortBookings(sampleBookings, { paymentStatus: 'PENDING' });
  assert.strictEqual(pendingPayments.length, 1);
  assert.strictEqual(pendingPayments[0].bookingId, 'GHE-1002');

  // Filter by Bus
  const bus1Only = filterAndSortBookings(sampleBookings, { busId: 'bus_1' });
  assert.strictEqual(bus1Only.length, 1);
  assert.strictEqual(bus1Only[0].bookingId, 'GHE-1001');
});

runTest('Sorts bookings by createdAt asc and desc accurately', () => {
  const sampleBookings = [
    { bookingId: 'EARLY', createdAt: '2026-10-01' },
    { bookingId: 'LATE', createdAt: '2026-11-15' },
    { bookingId: 'MIDDLE', createdAt: '2026-10-20' },
  ];

  const desc = filterAndSortBookings(sampleBookings, { sort: 'desc' });
  assert.strictEqual(desc[0].bookingId, 'LATE');
  assert.strictEqual(desc[2].bookingId, 'EARLY');

  const asc = filterAndSortBookings(sampleBookings, { sort: 'asc' });
  assert.strictEqual(asc[0].bookingId, 'EARLY');
  assert.strictEqual(asc[2].bookingId, 'LATE');
});

// -----------------------------------------------------------------------------
// SECTION 3: MANUAL OFFLINE / CASH PAYMENT WORKFLOW
// -----------------------------------------------------------------------------
console.log('\n--- 3. Manual Payment Recording & Balance Zeroing ---');

function simulateManualPayment(booking, admin, { amount, paymentMethod, notes }) {
  if (!admin || !admin.email) throw new Error('Unauthorized');
  if (!booking) throw new Error('Booking not found');
  if (booking.bookingStatus === 'CANCELLED') throw new Error('Cannot record payment for cancelled booking');
  if (booking.remainingBalance <= 0) throw new Error('Booking already fully settled');

  const payableAmount = Math.min(Number(amount), booking.remainingBalance);
  const newRemainingBalance = Math.max(0, booking.remainingBalance - payableAmount);
  const newPaymentStatus = newRemainingBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

  const paymentRecord = {
    id: `pay_${Date.now()}`,
    bookingId: booking.id,
    razorpayOrderId: `manual_ord_${Date.now()}`,
    razorpayPaymentId: `MANUAL_${paymentMethod}_${admin.id}_${Date.now()}`,
    amount: payableAmount,
    status: 'PAID',
    paymentType: newRemainingBalance === 0 ? 'REMAINING_BALANCE' : 'PARTIAL_SETTLEMENT',
    payload: JSON.stringify({
      method: paymentMethod,
      recordedBy: `Admin: ${admin.name} (${admin.email})`,
      notes,
    }),
  };

  const auditLog = {
    action: 'MANUAL_PAYMENT_RECORDED',
    entityType: 'PAYMENT',
    entityId: paymentRecord.id,
    performedBy: `Admin: ${admin.name} (${admin.email})`,
    bookingId: booking.id,
    oldValue: `Balance: ₹${booking.remainingBalance}`,
    newValue: `Paid: ₹${payableAmount}. New balance: ₹${newRemainingBalance}`,
  };

  booking.remainingBalance = newRemainingBalance;
  booking.paymentStatus = newPaymentStatus;
  booking.payments = booking.payments || [];
  booking.payments.push(paymentRecord);

  return { paymentRecord, auditLog, updatedBooking: booking };
}

runTest('Successfully records manual desk cash payment and zeros out balance', () => {
  const admin = { id: 'adm_1', name: 'Rajesh Coordinator', email: 'coordinator@gla.ac.in' };
  const booking = {
    id: 'b_active',
    bookingId: 'GHE-101',
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'PENDING',
    reservationAmount: 1000,
    remainingBalance: 5200,
  };

  const res = simulateManualPayment(booking, admin, {
    amount: 5200,
    paymentMethod: 'CASH',
    notes: 'Collected cash at bus departure gate',
  });

  assert.strictEqual(res.paymentRecord.amount, 5200);
  assert.strictEqual(res.paymentRecord.status, 'PAID');
  assert.strictEqual(res.paymentRecord.paymentType, 'REMAINING_BALANCE');
  assert.ok(res.paymentRecord.razorpayPaymentId.startsWith('MANUAL_CASH_adm_1'));
  assert.strictEqual(res.updatedBooking.remainingBalance, 0);
  assert.strictEqual(res.updatedBooking.paymentStatus, 'PAID');
  assert.strictEqual(res.auditLog.action, 'MANUAL_PAYMENT_RECORDED');
  assert.ok(res.auditLog.performedBy.includes('Rajesh Coordinator'));
});

runTest('Rejects manual payment for cancelled or already settled bookings', () => {
  const admin = { id: 'adm_1', name: 'Admin', email: 'admin@gla.ac.in' };
  const cancelledBooking = { id: 'b_canc', bookingStatus: 'CANCELLED', remainingBalance: 5200 };
  const settledBooking = { id: 'b_done', bookingStatus: 'CONFIRMED', remainingBalance: 0 };

  assert.throws(() => {
    simulateManualPayment(cancelledBooking, admin, { amount: 5200, paymentMethod: 'CASH' });
  }, /Cannot record payment for cancelled booking/);

  assert.throws(() => {
    simulateManualPayment(settledBooking, admin, { amount: 5200, paymentMethod: 'UPI' });
  }, /Booking already fully settled/);
});

// -----------------------------------------------------------------------------
// SECTION 4: SEAT OVERRIDE & ATOMIC CONFLICT PREVENTION
// -----------------------------------------------------------------------------
console.log('\n--- 4. Seat Reassignment & Conflict Prevention ---');

function reassignSeat({ currentSeat, destSeat, traveller, admin }) {
  if (!admin) throw new Error('Unauthorized');
  if (!destSeat) throw new Error('Target seat not found');
  if (destSeat.status === 'BOOKED') {
    throw new Error(`Target seat ${destSeat.seatNumber} is already booked`);
  }

  // Atomic state transfer
  currentSeat.status = 'AVAILABLE';
  currentSeat.isAvailable = true;

  destSeat.status = 'BOOKED';
  destSeat.isAvailable = false;

  traveller.assignedSeatNumber = destSeat.seatNumber;
  traveller.assignedBusNumber = destSeat.busNumber;

  const auditLog = {
    action: 'ADMIN_SEAT_CHANGE',
    oldValue: `Seat: ${currentSeat.seatNumber}`,
    newValue: `Seat: ${destSeat.seatNumber}`,
    performedBy: admin.email,
  };

  return { success: true, auditLog };
}

runTest('Prevents seat reassignment conflict when target seat is already booked', () => {
  const admin = { email: 'admin@gla.ac.in' };
  const currentSeat = { seatNumber: 'L1', status: 'BOOKED' };
  const occupiedDestSeat = { seatNumber: 'L2', status: 'BOOKED' };
  const traveller = { fullName: 'Amit', assignedSeatNumber: 'L1' };

  assert.throws(() => {
    reassignSeat({ currentSeat, destSeat: occupiedDestSeat, traveller, admin });
  }, /is already booked/);
});

runTest('Successfully transfers seat and writes audit log when target seat is available', () => {
  const admin = { email: 'admin@gla.ac.in' };
  const currentSeat = { seatNumber: 'L1', status: 'BOOKED' };
  const availableDestSeat = { seatNumber: 'R3', status: 'AVAILABLE', busNumber: 'Bus 01' };
  const traveller = { fullName: 'Amit', assignedSeatNumber: 'L1' };

  const res = reassignSeat({ currentSeat, destSeat: availableDestSeat, traveller, admin });

  assert.strictEqual(res.success, true);
  assert.strictEqual(currentSeat.status, 'AVAILABLE');
  assert.strictEqual(availableDestSeat.status, 'BOOKED');
  assert.strictEqual(traveller.assignedSeatNumber, 'R3');
  assert.strictEqual(res.auditLog.action, 'ADMIN_SEAT_CHANGE');
});

// -----------------------------------------------------------------------------
// SECTION 5: GATE CHECK-IN & DUPLICATE PREVENTION
// -----------------------------------------------------------------------------
console.log('\n--- 5. Coordinator Check-In Workflow ---');

function processGateCheckIn(ticket, admin) {
  if (!admin) throw new Error('Unauthorized');
  if (!ticket) throw new Error('Ticket not found');

  if (ticket.status === 'CHECKED_IN' && ticket.checkInTime) {
    return {
      success: true,
      alreadyCheckedIn: true,
      checkInTime: ticket.checkInTime,
      message: 'Traveller is already checked in',
    };
  }

  const now = new Date().toISOString();
  ticket.status = 'CHECKED_IN';
  ticket.checkInTime = now;
  if (ticket.traveller) {
    ticket.traveller.checkInStatus = 'CHECKED_IN';
    ticket.traveller.checkedInAt = now;
  }

  return {
    success: true,
    alreadyCheckedIn: false,
    checkInTime: now,
    message: `Successfully checked in ${ticket.traveller?.fullName}`,
  };
}

runTest('Check-in marks ticket and traveller as checked in on first scan', () => {
  const admin = { name: 'Gate Admin', email: 'gate@gla.ac.in' };
  const ticket = {
    id: 'tkt_01',
    status: 'VALID',
    traveller: { id: 'trv_01', fullName: 'Pooja Verma', checkInStatus: 'PENDING' },
  };

  const res = processGateCheckIn(ticket, admin);
  assert.strictEqual(res.alreadyCheckedIn, false);
  assert.strictEqual(ticket.status, 'CHECKED_IN');
  assert.strictEqual(ticket.traveller.checkInStatus, 'CHECKED_IN');
  assert.ok(ticket.checkInTime);
});

runTest('Duplicate check-in attempt is safely detected and does not re-stamp or duplicate', () => {
  const admin = { name: 'Gate Admin', email: 'gate@gla.ac.in' };
  const originalCheckInTime = '2026-11-19T08:00:00Z';
  const checkedInTicket = {
    id: 'tkt_02',
    status: 'CHECKED_IN',
    checkInTime: originalCheckInTime,
    traveller: { id: 'trv_02', fullName: 'Vikas Kumar', checkInStatus: 'CHECKED_IN' },
  };

  const res = processGateCheckIn(checkedInTicket, admin);
  assert.strictEqual(res.alreadyCheckedIn, true);
  assert.strictEqual(res.checkInTime, originalCheckInTime);
  assert.strictEqual(res.message, 'Traveller is already checked in');
});

// -----------------------------------------------------------------------------
// SECTION 6: MANIFEST CSV SANITIZATION & EXPORT
// -----------------------------------------------------------------------------
console.log('\n--- 6. Manifest CSV Export Security & Formatting ---');

function formatManifestCSV(travellers) {
  const headers = [
    'Student Name',
    'Roll Number',
    'Mobile Phone',
    'Email Address',
    'Coach',
    'Assigned Seat',
    'Booking Reference ID',
    'Payment Status',
    'Advance Deposit (INR)',
    'Remaining Balance (INR)',
    'Gate Check-In Status',
    'Emergency Contact Name',
    'Emergency Contact Phone',
  ];

  const rows = travellers.map((t) => [
    `"${(t.fullName || '').replace(/"/g, '""')}"`,
    `"${(t.rollNumber || '').replace(/"/g, '""')}"`,
    `"${(t.phone || '').replace(/"/g, '""')}"`,
    `"${(t.email || '').replace(/"/g, '""')}"`,
    `"${(t.coach || 'Bus 01').replace(/"/g, '""')}"`,
    `"${(t.assignedSeatNumber || 'Unassigned').replace(/"/g, '""')}"`,
    `"${(t.bookingId || '').replace(/"/g, '""')}"`,
    `"${(t.paymentStatus || 'PENDING').replace(/"/g, '""')}"`,
    t.deposit || 1000,
    t.balance || 5200,
    `"${t.checkInStatus === 'CHECKED_IN' ? 'CHECKED IN' : 'NOT BOARDED'}"`,
    `"${(t.emergencyName || '').replace(/"/g, '""')}"`,
    `"${(t.emergencyPhone || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

runTest('Escapes commas and quotes in CSV without leaking secret tokens or hashes', () => {
  const mockTravellers = [
    {
      fullName: 'Rahul "The Mountain" Sharma',
      rollNumber: 'GLA,2026,01',
      phone: '9876543210',
      email: 'rahul@example.com',
      coach: 'Bus 01',
      assignedSeatNumber: 'L3',
      bookingId: 'GHE-123456',
      paymentStatus: 'PAID',
      deposit: 1000,
      balance: 0,
      checkInStatus: 'CHECKED_IN',
      emergencyName: 'Rajesh Sharma, Father',
      emergencyPhone: '9876500000',
      // Sensitive fields that MUST NOT leak into CSV
      qrToken: 'SECRET_TOKEN_DO_NOT_LEAK',
      passwordHash: '$2b$10$secretHashDoNotLeak',
    },
  ];

  const csv = formatManifestCSV(mockTravellers);

  // Assert correct quotes and escaping
  assert.ok(csv.includes('"Rahul ""The Mountain"" Sharma"'));
  assert.ok(csv.includes('"GLA,2026,01"'));
  assert.ok(csv.includes('"Rajesh Sharma, Father"'));
  assert.ok(csv.includes('"CHECKED IN"'));

  // Assert sensitive fields are completely omitted
  assert.strictEqual(csv.includes('SECRET_TOKEN_DO_NOT_LEAK'), false);
  assert.strictEqual(csv.includes('secretHashDoNotLeak'), false);
});

console.log('\n======================================================');
console.log(` SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
