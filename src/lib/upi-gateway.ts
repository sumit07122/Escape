import QRCode from 'qrcode';
import crypto from 'crypto';

export interface UpiPayloadParams {
  vpa?: string;
  payeeName?: string;
  amount: number;
  bookingId: string;
  orderId: string;
  note?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface UpiIntentLinks {
  generic: string;
  gpay: string;
  phonepe: string;
  paytm: string;
  bhim: string;
}

export interface UpiPayload {
  vpa: string;
  payeeName: string;
  amount: number;
  orderId: string;
  bookingId: string;
  note: string;
  upiString: string;
  intentLinks: UpiIntentLinks;
  gatewayOrderId?: string;
  gatewayQrUrl?: string;
  isExternalGateway: boolean;
}

/**
 * Returns the default coordinator UPI VPA from environment or fallback
 */
export function getDefaultCoordinatorVpa(): string {
  return (
    process.env.NEXT_PUBLIC_DEFAULT_UPI_VPA ||
    process.env.DEFAULT_UPI_VPA ||
    'gdark909@okicici'
  );
}

/**
 * Generates official NPCI-compliant UPI deep links and mobile app intents
 */
export function generateUpiPayload(params: UpiPayloadParams): UpiPayload {
  const vpa = (params.vpa || getDefaultCoordinatorVpa()).trim();
  const payeeName = (params.payeeName || 'HIMALAYAN ESCAPE').trim();
  const amount = Number(params.amount.toFixed(2));
  const note = (params.note || `Himalayan Escape Deposit ${params.bookingId}`).trim();
  const orderId = params.orderId;
  const bookingId = params.bookingId;

  // Build NPCI UPI Query String
  const queryParams = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amount.toString(),
    cu: 'INR',
    tr: orderId,
    tn: note,
  });

  const queryString = queryParams.toString();
  const upiString = `upi://pay?${queryString}`;

  const intentLinks: UpiIntentLinks = {
    generic: upiString,
    gpay: `tez://upi/pay?${queryString}`,
    phonepe: `phonepe://pay?${queryString}`,
    paytm: `paytmmp://pay?${queryString}`,
    bhim: `upi://pay?${queryString}`,
  };

  return {
    vpa,
    payeeName,
    amount,
    orderId,
    bookingId,
    note,
    upiString,
    intentLinks,
    isExternalGateway: false,
  };
}

/**
 * Optionally creates an order with an external developer micro-gateway (e.g. UPIGateway.dev / UroPay)
 * if UPI_GATEWAY_API_KEY is configured in environment variables.
 */
export async function createMicroGatewayOrder(params: UpiPayloadParams): Promise<UpiPayload> {
  const localPayload = generateUpiPayload(params);
  const apiKey = process.env.UPI_GATEWAY_API_KEY;
  const gatewayUrl = process.env.UPI_GATEWAY_URL || 'https://api.upigateway.dev/order/create';

  if (!apiKey) {
    return localPayload;
  }

  try {
    const res = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        key: apiKey,
        client_txn_id: params.orderId,
        amount: params.amount,
        p_info: params.note || `Himalayan Escape Deposit ${params.bookingId}`,
        customer_name: params.customerName || 'Traveller',
        customer_email: params.customerEmail || 'traveller@himalayanescape.in',
        customer_mobile: params.customerPhone || '9999999999',
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/book?confirmed=${params.bookingId}`,
        udf1: params.bookingId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === true || data.success === true) {
        return {
          ...localPayload,
          gatewayOrderId: data.data?.order_id || data.order_id,
          gatewayQrUrl: data.data?.payment_url || data.payment_url,
          isExternalGateway: true,
        };
      }
    }
  } catch (err) {
    console.warn('[UPI_GATEWAY_ERROR] Falling back to direct coordinator UPI intent:', err);
  }

  return localPayload;
}

/**
 * Generates an alpine-themed high-resolution QR code as a base64 Data URL
 */
export async function generateUpiQrCode(upiString: string): Promise<string> {
  return await QRCode.toDataURL(upiString, {
    width: 380,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#163C32', // Himalayan dark pine green
      light: '#FFFFFF',
    },
  });
}

/**
 * Validates that the submitted UTR (Unique Transaction Reference) is a valid 12-digit numeric code
 */
export function verifyUtrFormat(utr: unknown): boolean {
  if (typeof utr !== 'string') return false;
  const cleanUtr = utr.trim();
  return /^\d{12}$/.test(cleanUtr);
}

/**
 * Verifies developer micro-gateway webhook signature (HMAC-SHA256)
 */
export function verifyGatewayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  try {
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}
