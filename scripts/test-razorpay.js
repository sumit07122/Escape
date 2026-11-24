require('dotenv').config();
const { createRazorpayOrder } = require('../src/lib/razorpay');

async function testRazorpay() {
  console.log('Testing Razorpay order creation with keys:', process.env.RAZORPAY_KEY_ID);
  try {
    const result = await createRazorpayOrder({
      amountInRupees: 1000,
      receipt: `RCPT-TEST-${Date.now()}`,
      notes: { test: '1' }
    });
    console.log('Razorpay Result:', result);
  } catch (err) {
    console.error('Razorpay FAILED:', err);
  }
}

testRazorpay();
