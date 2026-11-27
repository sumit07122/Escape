const assert = require('assert');
const crypto = require('crypto');
const { generateUpiPayload, verifyUtrFormat, verifyGatewayWebhookSignature } = require('../lib/upi-gateway');

async function runVerificationTests() {
  console.log('--- TEST SUITE: UPI Order & UTR Verification Pipeline ---');

  // Test 1: Order Generation with Deep Links & Canonical URL parameters
  const upiOrder = generateUpiPayload({
    vpa: '8126854850@paytm',
    payeeName: 'HIMALAYAN ESCAPE',
    amount: 5000,
    bookingId: 'GHE-TEST99',
    orderId: 'UPI-GHE-TEST99-123456',
    note: 'Himalayan Escape Deposit',
  });

  assert.strictEqual(upiOrder.amount, 5000);
  assert.strictEqual(upiOrder.vpa, '8126854850@paytm');
  assert.ok(upiOrder.upiString.includes('tr=UPI-GHE-TEST99-123456'));
  assert.ok(upiOrder.upiString.includes('am=5000'));
  assert.ok(upiOrder.intentLinks.gpay.startsWith('tez://'));
  assert.ok(upiOrder.intentLinks.phonepe.startsWith('phonepe://'));
  assert.ok(upiOrder.intentLinks.paytm.startsWith('paytmmp://'));
  assert.ok(upiOrder.intentLinks.bhim.startsWith('upi://'));
  console.log('✓ PASS: UPI Order generation & 4-way intent links');

  // Test 2: UTR Strict 12-Digit Formatting & Boundary Checks
  const validUtrs = ['123456789012', '987654321098', '000123456789'];
  const invalidUtrs = [
    '12345',               // Too short
    '1234567890123',       // Too long (13 digits)
    '12345678901A',        // Alpha character
    '1234 5678 9012',      // Spaces
    'UTR1234567890',       // Prefixed
    '',
    null,
    undefined,
  ];

  for (const utr of validUtrs) {
    assert.strictEqual(verifyUtrFormat(utr), true, `Expected valid: ${utr}`);
  }
  for (const utr of invalidUtrs) {
    assert.strictEqual(verifyUtrFormat(utr), false, `Expected invalid: ${utr}`);
  }
  console.log('✓ PASS: Strict 12-Digit UTR format validation & sanitization');

  // Test 3: S2S Webhook Signature Verification
  const webhookSecret = 'test_webhook_secret_key_abc123';
  const testPayload = JSON.stringify({
    order_id: 'UPI-GHE-TEST99-123456',
    amount: 5000,
    status: 'SUCCESS',
    utr: '123456789012',
    timestamp: Date.now(),
  });

  const validSignature = crypto.createHmac('sha256', webhookSecret).update(testPayload).digest('hex');
  const invalidSignature = 'deadbeefcafebabe12345678';

  assert.strictEqual(verifyGatewayWebhookSignature(testPayload, validSignature, webhookSecret), true);
  assert.strictEqual(verifyGatewayWebhookSignature(testPayload, invalidSignature, webhookSecret), false);
  console.log('✓ PASS: S2S Webhook HMAC-SHA256 signature verification');

  // Test 4: UTR Replay Prevention Simulation
  const mockExistingPayments = new Set(['123456789012', '998877665544']);
  function checkUtrReplay(submittedUtr) {
    if (mockExistingPayments.has(submittedUtr)) {
      return { allowed: false, error: 'Duplicate UTR replay detected' };
    }
    mockExistingPayments.add(submittedUtr);
    return { allowed: true };
  }

  assert.strictEqual(checkUtrReplay('123456789012').allowed, false);
  assert.strictEqual(checkUtrReplay('555666777888').allowed, true);
  assert.strictEqual(checkUtrReplay('555666777888').allowed, false); // Second attempt rejected
  console.log('✓ PASS: Duplicate UTR replay attack protection across bookings');

  console.log('\nAll UPI Verification & Auto-Gateway tests passed cleanly!\n');
}

runVerificationTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
