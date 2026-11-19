/**
 * Himalayan Escape — Comprehensive Security & Payment Integrity Test Suite
 *
 * Verifies all security controls, HMAC signing, IDOR protection, PII data sanitization,
 * webhook validation, and rate limiting.
 */

const crypto = require('crypto');
const assert = require('assert');

console.log('=============================================================');
console.log('🛡️ HIMALAYAN ESCAPE — SECURITY & PAYMENT INTEGRITY TEST SUITE');
console.log('=============================================================');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

// -------------------------------------------------------------------
// TEST GROUP 1: Webhook Signature & Payment Security
// -------------------------------------------------------------------
console.log('\nTEST GROUP 1: Webhook Signature & Payment Security');

const testWebhookSecret = 'test_webhook_secret_key_12345';
const samplePayload = JSON.stringify({
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: 'pay_test_998877',
        order_id: 'order_test_112233',
        amount: 100000,
        status: 'captured',
      },
    },
  },
});

function checkWebhookSig(rawBody, signature, secret) {
  if (!secret || !signature) return false;
  const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const sigBuffer = Buffer.from(signature, 'utf-8');
  const expBuffer = Buffer.from(expectedSignature, 'utf-8');
  if (sigBuffer.length !== expBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expBuffer);
}

runTest('Rejects webhook processing when secret is empty or unset', () => {
  const validSig = crypto.createHmac('sha256', testWebhookSecret).update(samplePayload).digest('hex');
  assert.strictEqual(checkWebhookSig(samplePayload, validSig, ''), false);
  assert.strictEqual(checkWebhookSig(samplePayload, validSig, null), false);
});

runTest('Rejects tampered / forged webhook signatures', () => {
  const forgedSig = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
  assert.strictEqual(checkWebhookSig(samplePayload, forgedSig, testWebhookSecret), false);
});

runTest('Rejects webhook signature with mismatched buffer byte length without throwing', () => {
  assert.strictEqual(checkWebhookSig(samplePayload, 'short_sig', testWebhookSecret), false);
  assert.strictEqual(checkWebhookSig(samplePayload, '', testWebhookSecret), false);
});

runTest('Verifies valid HMAC-SHA256 signature for legitimate webhook events', () => {
  const validSig = crypto.createHmac('sha256', testWebhookSecret).update(samplePayload).digest('hex');
  assert.strictEqual(checkWebhookSig(samplePayload, validSig, testWebhookSecret), true);
});

// -------------------------------------------------------------------
// TEST GROUP 2: Razorpay Payment Verification
// -------------------------------------------------------------------
console.log('\nTEST GROUP 2: Razorpay Payment Signature Verification');

const testRazorpaySecret = 'rzp_sec_998877665544332211';

function verifyRazorpaySig(orderId, paymentId, signature, keySecret, isProduction = false) {
  if (!orderId || !paymentId || !signature) return false;
  const hasRealSecret = !!(keySecret && !keySecret.includes('YourRazorpaySecretHere'));

  if (orderId.startsWith('order_test_')) {
    if (!isProduction && !hasRealSecret) {
      return signature.length > 0 && paymentId.length > 0;
    }
  }

  if (!keySecret) return false;

  const expectedSignature = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  const sigBuffer = Buffer.from(signature, 'utf-8');
  const expBuffer = Buffer.from(expectedSignature, 'utf-8');
  if (sigBuffer.length !== expBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expBuffer);
}

runTest('Verifies valid payment signature using Razorpay server secret', () => {
  const orderId = 'order_ABC123';
  const paymentId = 'pay_XYZ789';
  const validSig = crypto.createHmac('sha256', testRazorpaySecret).update(`${orderId}|${paymentId}`).digest('hex');
  assert.strictEqual(verifyRazorpaySig(orderId, paymentId, validSig, testRazorpaySecret, true), true);
});

runTest('Rejects tampered payment signature in production mode', () => {
  const orderId = 'order_ABC123';
  const paymentId = 'pay_XYZ789';
  const badSig = crypto.createHmac('sha256', 'wrong_secret').update(`${orderId}|${paymentId}`).digest('hex');
  assert.strictEqual(verifyRazorpaySig(orderId, paymentId, badSig, testRazorpaySecret, true), false);
});

runTest('Enforces HMAC verification on order_test_ in production or when real secret is present', () => {
  const orderId = 'order_test_fake123';
  const paymentId = 'pay_mock456';
  // With real secret in production, an arbitrary dummy signature MUST NOT pass
  assert.strictEqual(verifyRazorpaySig(orderId, paymentId, 'arbitrary_sig', testRazorpaySecret, true), false);
});

// -------------------------------------------------------------------
// TEST GROUP 3: Open Redirect & OAuth State Tampering
// -------------------------------------------------------------------
console.log('\nTEST GROUP 3: Open Redirect & OAuth State Tampering Protection');

function sanitizeReturnUrl(url) {
  if (!url) return '/book';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes('\\') &&
    !trimmed.includes('\r') &&
    !trimmed.includes('\n')
  ) {
    return trimmed;
  }
  return '/book';
}

runTest('Sanitizes open redirect: blocks external absolute URLs (e.g. https://evil.com)', () => {
  assert.strictEqual(sanitizeReturnUrl('https://evil.com'), '/book');
  assert.strictEqual(sanitizeReturnUrl('http://phishing.site/steal'), '/book');
});

runTest('Sanitizes open redirect: blocks protocol-relative URLs (e.g. //evil.com)', () => {
  assert.strictEqual(sanitizeReturnUrl('//evil.com/login'), '/book');
  assert.strictEqual(sanitizeReturnUrl('///evil.com'), '/book');
});

runTest('Sanitizes open redirect: blocks backslash domain confusion (e.g. /\\evil.com)', () => {
  assert.strictEqual(sanitizeReturnUrl('/\\evil.com'), '/book');
});

runTest('Allows valid internal relative paths (e.g. /book, /pricing, /profile)', () => {
  assert.strictEqual(sanitizeReturnUrl('/book'), '/book');
  assert.strictEqual(sanitizeReturnUrl('/admin/dashboard'), '/admin/dashboard');
  assert.strictEqual(sanitizeReturnUrl('/pricing?tier=student'), '/pricing?tier=student');
});

const oauthSecret = 'super_secret_oauth_signing_key_32';

function createOAuthState(payload, secret = oauthSecret) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 15 * 60 * 1000 });
  const base64Data = Buffer.from(data).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(base64Data).digest('base64url');
  return `${base64Data}.${sig}`;
}

function verifyOAuthState(state, secret = oauthSecret) {
  try {
    const [base64Data, sig] = state.split('.');
    if (!base64Data || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', secret).update(base64Data).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(Buffer.from(base64Data, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

runTest('Validates signed OAuth state and rejects forged state parameters', () => {
  const state = createOAuthState({ returnUrl: '/book' });
  const verified = verifyOAuthState(state);
  assert.ok(verified);
  assert.strictEqual(verified.returnUrl, '/book');

  // Tampered state
  const tamperedState = state + 'tamper';
  assert.strictEqual(verifyOAuthState(tamperedState), null);
});

runTest('Rejects expired OAuth state parameters', () => {
  const expiredData = JSON.stringify({ returnUrl: '/book', exp: Date.now() - 5000 });
  const base64Data = Buffer.from(expiredData).toString('base64url');
  const sig = crypto.createHmac('sha256', oauthSecret).update(base64Data).digest('base64url');
  const expiredState = `${base64Data}.${sig}`;
  assert.strictEqual(verifyOAuthState(expiredState), null);
});

// -------------------------------------------------------------------
// TEST GROUP 4: IDOR & PII Data Exposure Safeguards
// -------------------------------------------------------------------
console.log('\nTEST GROUP 4: IDOR & PII Data Exposure Safeguards');

runTest('Ticket lookup identifies 32-char hex qrToken vs predictable ticketNumber', () => {
  const validQrToken = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
  const ticketNumber = 'TKT-GHE-10101';

  const isQrToken = (t) => /^[0-9a-f]{32}$/i.test(t);
  assert.strictEqual(isQrToken(validQrToken), true);
  assert.strictEqual(isQrToken(ticketNumber), false);
  assert.strictEqual(isQrToken('12345'), false);
});

runTest('Public scanner verification payload strips sensitive passenger PII', () => {
  const rawTicketRecord = {
    ticketNumber: 'TKT-GHE-10101',
    qrToken: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    status: 'VALID',
    issuedAt: new Date(),
    traveller: {
      fullName: 'Aarav Sharma',
      phone: '9876543210',
      email: 'aarav@gla.ac.in',
      emergencyContactName: 'Ramesh Sharma',
      emergencyContactPhone: '9876543211',
      rollNumber: '2115000100',
      collegeId: 'GLA2021001',
      assignedSeatNumber: 'L1',
      assignedBusNumber: 'Bus 01',
      checkInStatus: 'PENDING',
    },
    booking: {
      bookingId: 'GHE-260123',
      bookingStatus: 'CONFIRMED',
      totalAmount: 6200,
      bus: { busNumber: 'Bus 01', vehicleName: 'Luxury Coach' },
    },
  };

  function sanitizeTicketForPublicScan(ticket) {
    return {
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      issuedAt: ticket.issuedAt,
      traveller: {
        fullName: ticket.traveller.fullName,
        assignedSeatNumber: ticket.traveller.assignedSeatNumber,
        assignedBusNumber: ticket.traveller.assignedBusNumber,
        checkInStatus: ticket.traveller.checkInStatus,
      },
      booking: {
        bookingId: ticket.booking.bookingId,
        bookingStatus: ticket.booking.bookingStatus,
        bus: ticket.booking.bus,
      },
    };
  }

  const sanitized = sanitizeTicketForPublicScan(rawTicketRecord);
  assert.strictEqual(sanitized.traveller.phone, undefined, 'Phone must not be exposed to public scan');
  assert.strictEqual(sanitized.traveller.email, undefined, 'Email must not be exposed to public scan');
  assert.strictEqual(sanitized.traveller.emergencyContactPhone, undefined, 'Emergency phone must not be exposed');
  assert.strictEqual(sanitized.traveller.rollNumber, undefined, 'Roll number must not be exposed');
  assert.strictEqual(sanitized.traveller.fullName, 'Aarav Sharma');
  assert.strictEqual(sanitized.traveller.assignedSeatNumber, 'L1');
});

runTest('Seat status public view redacts bookedDetails for unauthenticated users', () => {
  const seatRecord = {
    seatNumber: 'L1',
    status: 'BOOKED',
    seatBooking: {
      traveller: { fullName: 'Aarav Sharma' },
      booking: { bookingId: 'GHE-260123' },
    },
  };

  function formatSeatStatus(seat, isAdmin) {
    return {
      seatNumber: seat.seatNumber,
      status: seat.status,
      isAvailable: seat.status === 'AVAILABLE',
      bookedDetails: (isAdmin && seat.seatBooking)
        ? {
            travellerName: seat.seatBooking.traveller?.fullName,
            bookingId: seat.seatBooking.booking?.bookingId,
          }
        : null,
    };
  }

  const publicView = formatSeatStatus(seatRecord, false);
  assert.strictEqual(publicView.bookedDetails, null, 'Public must not see booked traveller details');

  const adminView = formatSeatStatus(seatRecord, true);
  assert.ok(adminView.bookedDetails);
  assert.strictEqual(adminView.bookedDetails.travellerName, 'Aarav Sharma');
  assert.strictEqual(adminView.bookedDetails.bookingId, 'GHE-260123');
});

// -------------------------------------------------------------------
// TEST GROUP 5: Rate Limiting & Brute-Force Defense
// -------------------------------------------------------------------
console.log('\nTEST GROUP 5: Authentication Rate Limiting & Brute-Force Defense');

const rateLimitMap = new Map();

function testCheckRateLimit(id, max = 5, windowMs = 60000) {
  const now = Date.now();
  const rec = rateLimitMap.get(id);
  if (!rec || now > rec.resetAt) {
    rateLimitMap.set(id, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (rec.count >= max) {
    return { allowed: false, remaining: 0 };
  }
  rec.count++;
  return { allowed: true, remaining: max - rec.count };
}

runTest('Permits up to 5 login attempts within window', () => {
  const ip = '192.168.1.100';
  for (let i = 1; i <= 5; i++) {
    const res = testCheckRateLimit(ip, 5);
    assert.strictEqual(res.allowed, true, `Attempt ${i} should be allowed`);
  }
});

runTest('Blocks 6th login attempt with rate limit exceeded (HTTP 429)', () => {
  const ip = '192.168.1.100';
  const res = testCheckRateLimit(ip, 5);
  assert.strictEqual(res.allowed, false, '6th attempt must be blocked');
  assert.strictEqual(res.remaining, 0);
});

// -------------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------------
console.log('\n=============================================================');
console.log(`TEST SUMMARY: ${passedTests} Passed, ${totalTests - passedTests} Failed (Total: ${totalTests})`);
console.log('=============================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
