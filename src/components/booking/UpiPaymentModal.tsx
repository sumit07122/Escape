'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X, Check, Copy, Clock, ShieldCheck, AlertCircle,
  ExternalLink, Smartphone, Sparkles, Loader2, ArrowRight
} from 'lucide-react';

interface UpiIntentLinks {
  generic: string;
  gpay: string;
  phonepe: string;
  paytm: string;
  bhim: string;
}

export interface UpiOrderData {
  bookingId: string;
  orderId: string;
  amount: number;
  vpa: string;
  payeeName: string;
  upiString: string;
  qrCodeDataUrl?: string;
  qrDataUrl?: string;
  intentLinks: UpiIntentLinks;
  expiresAt: string;
  seats?: string[];
}

interface UpiPaymentModalProps {
  orderData: UpiOrderData;
  onSuccess: (confirmationData: any) => void;
  onClose: () => void;
}

export default function UpiPaymentModal({
  orderData,
  onSuccess,
  onClose,
}: UpiPaymentModalProps) {
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 minutes fallback
  const [isAutoChecking, setIsAutoChecking] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Calculate Countdown Timer based on hold expiration
  useEffect(() => {
    if (orderData.expiresAt) {
      const expirationMs = new Date(orderData.expiresAt).getTime();
      const initialSeconds = Math.max(0, Math.floor((expirationMs - Date.now()) / 1000));
      setTimeLeftSeconds(initialSeconds);
    }

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orderData.expiresAt]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 2. Real-Time Auto-Poll for Webhook Confirmation
  useEffect(() => {
    let isCancelled = false;

    async function checkStatus() {
      try {
        const res = await fetch(
          `/api/payments/upi/status?bookingId=${orderData.bookingId}&orderId=${orderData.orderId}&t=${Date.now()}`
        );
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.confirmed && !isCancelled) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setIsAutoChecking(false);
          onSuccess(data);
        }
      } catch {
        // Silently retry on network hiccups
      }
    }

    pollingRef.current = setInterval(checkStatus, 3000);
    // Initial immediate check
    checkStatus();

    return () => {
      isCancelled = true;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderData.bookingId, orderData.orderId, onSuccess]);

  // 3. Copy VPA Handler
  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(orderData.vpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2500);
    } catch {
      // Fallback
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2500);
    }
  };

  // 4. Submit 12-Digit UTR
  const handleVerifyUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    const cleanUtr = utrInput.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      setVerificationError('Please enter a valid 12-digit numeric UPI Ref / UTR number from your payment receipt.');
      return;
    }

    setIsSubmittingUtr(true);
    try {
      const res = await fetch('/api/payments/upi/verify-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: orderData.bookingId,
          orderId: orderData.orderId,
          utr: cleanUtr,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify transaction reference.');
      }

      if (pollingRef.current) clearInterval(pollingRef.current);
      onSuccess(data);
    } catch (err: any) {
      setVerificationError(err.message || 'Verification failed. Please double-check the UTR or contact coordinator.');
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border border-[#D8D2C4] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#163C32] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">UPI Direct Payment</h3>
              <p className="text-[10px] text-emerald-200/80 uppercase font-mono tracking-wider">
                Booking ID: #{orderData.bookingId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close payment modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Amount and Timer Pill */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E2DDD3] shadow-xs">
            <div>
              <span className="text-[11px] font-bold text-[#646864] uppercase tracking-wider block">
                Reservation Deposit Payable Now
              </span>
              <span className="text-3xl font-black text-[#171918] tabular-nums">
                ₹{orderData.amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
              <span>Seat Hold: <strong className="font-mono">{formatTimer(timeLeftSeconds)}</strong></span>
            </div>
          </div>

          {/* Dynamic QR Code Display */}
          <div className="text-center space-y-3 bg-white p-5 rounded-2xl border border-[#E2DDD3] shadow-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#D87945]" />
              Scan with Any UPI App
            </span>

            <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 p-2 rounded-2xl bg-white border-2 border-[#163C32]/25 shadow-md flex items-center justify-center">
              {(orderData.qrCodeDataUrl || orderData.qrDataUrl) ? (
                <img
                  src={orderData.qrCodeDataUrl || orderData.qrDataUrl}
                  alt="UPI Payment QR Code"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-xs text-[#646864]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#163C32]" />
                  <span>Generating QR...</span>
                </div>
              )}
            </div>

            {/* UPI ID (VPA) with Copy Button */}
            <div className="max-w-xs mx-auto flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs">
              <div className="text-left truncate">
                <span className="text-[9px] font-bold text-[#646864] uppercase block">Coordinator UPI ID</span>
                <span className="font-mono font-bold text-[#171918] text-xs truncate block">{orderData.vpa}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#163C32] text-white text-[11px] font-bold hover:bg-[#205345] transition-all cursor-pointer"
              >
                {copiedVpa ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                <span>{copiedVpa ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Mobile One-Tap Payment Launchers */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#646864] uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#163C32]" />
              On Mobile? Tap to Open App:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a
                href={orderData.intentLinks.phonepe}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#5f259f] text-white font-bold shadow-xs hover:opacity-90 transition-opacity text-center cursor-pointer"
              >
                <span>PhonePe</span>
              </a>
              <a
                href={orderData.intentLinks.gpay}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1a73e8] text-white font-bold shadow-xs hover:opacity-90 transition-opacity text-center cursor-pointer"
              >
                <span>Google Pay</span>
              </a>
              <a
                href={orderData.intentLinks.paytm}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#002e6e] text-white font-bold shadow-xs hover:opacity-90 transition-opacity text-center cursor-pointer"
              >
                <span>Paytm</span>
              </a>
              <a
                href={orderData.intentLinks.generic}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#163C32] text-white font-bold shadow-xs hover:opacity-90 transition-opacity text-center cursor-pointer"
              >
                <span>Other UPI</span>
              </a>
            </div>
          </div>

          {/* Real-time Status Listening Indicator */}
          {isAutoChecking && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>Listening for payment confirmation... Boarding pass will unlock automatically.</span>
            </div>
          )}

          {/* Manual UTR Verification Form */}
          <div className="pt-2 border-t border-[#E2DDD3]">
            <form onSubmit={handleVerifyUtr} className="space-y-3">
              <div>
                <label htmlFor="utr-input" className="block text-xs font-bold text-[#171918] mb-1">
                  Already paid? Enter 12-Digit UPI Reference Number (UTR):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="utr-input"
                    type="text"
                    maxLength={12}
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 432890123456"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D8D2C4] bg-white text-[#171918] text-xs font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-[#163C32]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingUtr || utrInput.length !== 12}
                    className="px-4 py-2.5 rounded-xl bg-[#163C32] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#205345] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmittingUtr ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Verify</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#646864] mt-1">
                  Found on your GPay/PhonePe receipt as &ldquo;UPI Ref No&rdquo; or &ldquo;UTR&rdquo;.
                </p>
              </div>

              {verificationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{verificationError}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-[#EDE8DE] border-t border-[#D8D2C4] flex items-center justify-between text-[11px] text-[#646864]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Zero Commission • Direct to Bank
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#163C32] hover:underline cursor-pointer"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    </div>
  );
}
