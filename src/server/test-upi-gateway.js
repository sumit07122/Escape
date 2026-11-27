const assert = require('assert');
const { generateUpiPayload, verifyUtrFormat, verifyGatewayWebhookSignature } = require('../lib/upi-gateway');

async function run() {
  console.log('--- TEST SUITE: UPI Gateway & Deep Link Engine ---');

  // Test 1: Payload generation
  const payload = generateUpiPayload({
    vpa: 'gdark909@okicici',
    payeeName: 'HIMALAYAN ESCAPE',
    amount: 1000,
    bookingId: 'GHE-TEST01',
    orderId: 'UPI-GHE-TEST01',
    note: 'Himalayan Escape Deposit',
  });

  assert.strictEqual(payload.vpa, 'gdark909@okicici');
  assert.strictEqual(payload.amount, 1000);
  assert.ok(payload.upiString.startsWith('upi://pay?'));
  assert.ok(payload.upiString.includes('pa=gdark909%40okicici'));
  assert.ok(payload.upiString.includes('am=1000'));
  assert.ok(payload.intentLinks.gpay.startsWith('tez://upi/pay?'));
  assert.ok(payload.intentLinks.phonepe.startsWith('phonepe://pay?'));
  assert.ok(payload.intentLinks.paytm.startsWith('paytmmp://pay?'));
  console.log('✓ PASS: UPI deep-link generation for GPay, PhonePe, and Paytm');

  // Test 2: UTR format validation
  assert.strictEqual(verifyUtrFormat('123456789012'), true);
  assert.strictEqual(verifyUtrFormat('432109876543'), true);
  assert.strictEqual(verifyUtrFormat('12345'), false); // Too short
  assert.strictEqual(verifyUtrFormat('1234567890123'), false); // Too long
  assert.strictEqual(verifyUtrFormat('12345678901A'), false); // Contains letter
  assert.strictEqual(verifyUtrFormat(null), false);
  assert.strictEqual(verifyUtrFormat(''), false);
  console.log('✓ PASS: 12-Digit UTR format validation');

  // Test 3: Webhook signature validation
  const crypto = require('crypto');
  const secret = 'super_secret_webhook_key_123';
  const body = JSON.stringify({ order_id: 'UPI-GHE-TEST01', status: 'SUCCESS', utr: '432109876543' });
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  assert.strictEqual(verifyGatewayWebhookSignature(body, signature, secret), true);
  assert.strictEqual(verifyGatewayWebhookSignature(body, 'invalid_sig', secret), false);
  console.log('✓ PASS: Webhook HMAC-SHA256 signature verification');

  console.log('All Task 1 tests passed successfully!\n');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
