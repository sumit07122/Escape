'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X, Check, Copy, Clock, ShieldCheck, AlertCircle,
  Smartphone, Sparkles, Loader2, ArrowRight, Lock, CheckCircle2,
  Info
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
  const [showUtrGuide, setShowUtrGuide] = useState(false);
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
      setVerificationError('Please enter the exact 12-digit numeric UPI Reference / UTR number from your payment confirmation screen.');
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
      setVerificationError(err.message || 'Verification failed. Please double-check the UTR or contact your coordinator.');
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const qrSrc = orderData.qrCodeDataUrl || orderData.qrDataUrl;
  const isTimeCritical = timeLeftSeconds < 180;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl sm:rounded-[2rem] border border-[#D8D2C4]/90 shadow-[0_25px_60px_-15px_rgba(14,38,32,0.45)] overflow-hidden max-h-[94vh] flex flex-col font-sans">
        
        {/* Top Header — Alpine Forest Gradient */}
        <div className="relative px-6 py-4 sm:py-5 bg-gradient-to-r from-[#0E2620] via-[#163C32] to-[#0E2620] text-white overflow-hidden">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-black text-base sm:text-lg text-white tracking-tight leading-none">
                    HIMALAYAN ESCAPE
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold uppercase tracking-wider">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/75 mt-0.5 font-medium flex items-center gap-1.5">
                  <span>Direct UPI Checkout</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-300 font-bold">#{orderData.bookingId}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close payment window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          
          {/* Financial Summary & Seat Hold Pill Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2DDD3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold text-[#646864] uppercase tracking-wider block font-sans">
                Seat Reservation Deposit Due
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-serif text-3xl sm:text-4xl font-black text-[#0E2620] tracking-tight tabular-nums">
                  ₹{orderData.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  ₹1,000 / Person
                </span>
              </div>
              <p className="text-[11px] text-[#646864] mt-1 font-medium">
                Remaining balance ₹5,199/person payable before boarding at GLA Mathura.
              </p>
            </div>

            <div className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isTimeCritical
                ? 'bg-rose-50 border-rose-300 text-rose-900 animate-pulse'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-600' : 'text-amber-700 animate-pulse'}`} />
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#646864] block leading-none">Seat Hold</span>
                <strong className="font-mono text-sm leading-none">{formatTimer(timeLeftSeconds)}</strong>
              </div>
            </div>
          </div>

          {/* Dynamic High-Contrast QR Code Container */}
          <div className="text-center space-y-3.5 bg-white p-5 rounded-2xl border border-[#E2DDD3] shadow-xs">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#163C32]/5 text-[#163C32] border border-[#163C32]/15 text-[11px] font-extrabold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#D87945]" />
                Scan Dynamic QR with Any App
              </span>
            </div>

            {/* Passport / Boarding Pass Style Scanner Frame */}
            <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 p-3 rounded-2xl bg-white border-2 border-[#163C32]/30 shadow-md flex items-center justify-center group">
              {/* Corner Reticles */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#163C32]" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#163C32]" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#163C32]" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#163C32]" />

              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt="UPI Payment QR Code"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-xs text-[#646864]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#163C32]" />
                  <span className="font-medium">Generating QR...</span>
                </div>
              )}
            </div>

            {/* Direct VPA Copy Badge */}
            <div className="max-w-xs mx-auto flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] shadow-2xs">
              <div className="text-left truncate">
                <span className="text-[9px] font-extrabold text-[#646864] uppercase tracking-wider block">Coordinator UPI ID</span>
                <span className="font-mono font-bold text-[#171918] text-xs truncate block">{orderData.vpa}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#163C32] hover:bg-[#205345] active:bg-[#0E2620] text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
              >
                {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedVpa ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>
          </div>

          {/* Mobile One-Tap Payment Deep Links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#646864] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Smartphone className="w-3.5 h-3.5 text-[#163C32]" />
                On Mobile? Tap to Launch:
              </span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                1-Tap Auto Fill
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a
                href={orderData.intentLinks.phonepe}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#5f259f] hover:bg-[#521e8c] active:bg-[#431773] text-white font-bold shadow-sm transition-all text-center cursor-pointer"
              >
                <span>PhonePe</span>
              </a>
              <a
                href={orderData.intentLinks.gpay}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#10438c] text-white font-bold shadow-sm transition-all text-center cursor-pointer"
              >
                <span>Google Pay</span>
              </a>
              <a
                href={orderData.intentLinks.paytm}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#002e6e] hover:bg-[#00204d] active:bg-[#001533] text-white font-bold shadow-sm transition-all text-center cursor-pointer"
              >
                <span>Paytm</span>
              </a>
              <a
                href={orderData.intentLinks.generic}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#163C32] hover:bg-[#205345] active:bg-[#0E2620] text-white font-bold shadow-sm transition-all text-center cursor-pointer"
              >
                <span>BHIM / Other</span>
              </a>
            </div>
          </div>

          {/* Real-time Status Radar Listener */}
          {isAutoChecking && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span>Auto-verifying payment receipt in background...</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                Polling
              </span>
            </div>
          )}

          {/* Manual 12-Digit UTR Input Form */}
          <div className="pt-2 border-t border-[#E2DDD3]">
            <form onSubmit={handleVerifyUtr} className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="utr-input" className="block text-xs font-extrabold text-[#171918]">
                  Already paid? Enter 12-Digit UTR Number:
                </label>
                <button
                  type="button"
                  onClick={() => setShowUtrGuide(!showUtrGuide)}
                  className="text-[11px] font-bold text-[#163C32] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3 h-3" />
                  <span>Where is UTR?</span>
                </button>
              </div>

              {showUtrGuide && (
                <div className="p-3 rounded-xl bg-[#F4F1EA] border border-[#DDD7CD] text-[11px] text-[#424542] space-y-1.5 animate-in fade-in duration-150">
                  <p className="font-bold text-[#163C32]">How to locate your 12-digit UTR:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                    <li><strong>Google Pay:</strong> Tap transaction → Look for &ldquo;UPI transaction ID&rdquo;.</li>
                    <li><strong>PhonePe:</strong> View details → Find &ldquo;UTR Number&rdquo; (12 digits).</li>
                    <li><strong>Paytm:</strong> Passbook payment details → Look for &ldquo;UPI Ref No.&rdquo;.</li>
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="utr-input"
                    type="text"
                    maxLength={12}
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 432890123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8D2C4] bg-white text-[#171918] text-xs font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#163C32] focus:border-transparent transition-all placeholder:text-[#A29E96] placeholder:font-normal placeholder:tracking-normal"
                  />
                  {utrInput.length === 12 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3 animate-in fade-in" />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingUtr || utrInput.length !== 12}
                  className="px-5 py-2.5 rounded-xl bg-[#163C32] hover:bg-[#205345] active:bg-[#0E2620] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  {isSubmittingUtr ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Lock</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {verificationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{verificationError}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Modal Bottom Footer — Security & Trust Stamps */}
        <div className="px-6 py-3.5 bg-[#EDE8DE] border-t border-[#D8D2C4] flex items-center justify-between text-[11px] text-[#646864]">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            Zero-Commission 256-Bit Encrypted Payment
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#163C32] hover:text-[#0E2620] hover:underline cursor-pointer"
          >
            Cancel and Return
          </button>
        </div>

      </div>
    </div>
  );
}
