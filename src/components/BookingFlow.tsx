'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, User, CheckCircle2, ArrowRight, ArrowLeft,
  CreditCard, ShieldCheck, Ticket, Download, Phone,
  Loader2, AlertCircle, Copy, Check, Compass, Calendar,
  MapPin, LogOut
} from 'lucide-react';
import BusSeatMap from './BusSeatMap';
import { SittingPreference, TravellerInput, BookingPricing } from '@/types';
import { CONTACT_INFO, PRICING_DEFAULTS, TRIP_METADATA } from '@/lib/constants';

declare global {
  interface Window {
    Razorpay: any;
    confetti: any;
  }
}

interface UserSession {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: string;
}

export default function BookingFlow() {
  const router = useRouter();

  // 8 Steps:
  // 1: Google Login
  // 2: Number of Travellers
  // 3: Traveller Details
  // 4: Sitting Preference
  // 5: Bus & Seat Selection
  // 6: Booking Summary
  // 7: Pay Reservation
  // 8: Confirmation & QR Ticket
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [bookingSessionId, setBookingSessionId] = useState<string>('');

  // Authentication State
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);

  // Step 2: Travellers Count
  const [travellersCount, setTravellersCount] = useState<number>(1);

  // Step 3: Traveller Details
  const [travellers, setTravellers] = useState<TravellerInput[]>([
    { fullName: '', phone: '', email: '', gender: 'Male' },
  ]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Step 4: Sitting Preference
  const [sittingPreference, setSittingPreference] = useState<SittingPreference>('NO_PREFERENCE');

  // Step 5: Bus & Seat Selection
  const [selectedBusId, setSelectedBusId] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Step 6 & 7: Pricing & Payment
  const [pricing, setPricing] = useState<BookingPricing | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Step 8: Confirmed Booking Details
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);

  // 1. Initialize Booking Session & Check User Auth
  useEffect(() => {
    let sid = sessionStorage.getItem('gla_booking_session');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      sessionStorage.setItem('gla_booking_session', sid);
    }
    setBookingSessionId(sid);

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUserSession(data.user);
            // Autofill primary traveller
            setTravellers((prev) => {
              const updated = [...prev];
              if (updated[0]) {
                updated[0].fullName = updated[0].fullName || data.user.name || '';
                updated[0].email = updated[0].email || data.user.email || '';
              }
              return updated;
            });
            // Automatically advance to Step 2 if user is already logged in
            setCurrentStep((step) => (step === 1 ? 2 : step));
          }
        }
      } catch {
        // Continue
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Adjust travellers array whenever count changes
  useEffect(() => {
    setTravellers((prev) => {
      const updated = [...prev];
      while (updated.length < travellersCount) {
        updated.push({
          fullName: '',
          phone: '',
          email: '',
          gender: 'Male',
        });
      }
      return updated.slice(0, travellersCount);
    });

    // Reset selected seats if count doesn't match
    if (selectedSeats.length > travellersCount) {
      setSelectedSeats([]);
    }

    // Refresh pricing server-side
    refreshPricing(travellersCount);
  }, [travellersCount]);

  const refreshPricing = useCallback(async (count: number) => {
    try {
      const res = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travellersCount: count }),
      });
      if (res.ok) {
        const data = await res.json();
        setPricing(data.pricing);
      }
    } catch {
      // Fallback local profit-safe calculation
      setPricing({
        travellersCount: count,
        baseAmount: count * PRICING_DEFAULTS.pricePerTraveller,
        totalAmount: count * PRICING_DEFAULTS.pricePerTraveller,
        pricePerTraveller: PRICING_DEFAULTS.pricePerTraveller,
        reservationAmountPerTraveller: PRICING_DEFAULTS.reservationAmountPerTraveller,
        reservationAmount: count * PRICING_DEFAULTS.reservationAmountPerTraveller,
        remainingBalance: count * PRICING_DEFAULTS.remainingBalancePerTraveller,
        finalAmount: count * PRICING_DEFAULTS.pricePerTraveller,
        discountAmount: 0,
      });
    }
  }, []);

  // Sandbox demo login handler (for local development or testing when Google keys aren't set)
  const handleSandboxLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDemoLoginLoading(true);
    try {
      const email = 'aryan.sharma@gla.ac.in';
      const name = 'Aryan Sharma';
      window.location.href = `/api/auth/google?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&returnUrl=/book`;
    } catch {
      setDemoLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUserSession(null);
      setCurrentStep(1);
    } catch {
      // Continue
    }
  };

  // Step 3 Validation: Traveller details
  const validateTravellerDetails = () => {
    for (let i = 0; i < travellers.length; i++) {
      const t = travellers[i];
      if (!t.fullName.trim()) {
        alert(`Please enter the full name for Traveller #${i + 1}`);
        return false;
      }
      if (!t.phone.trim() || t.phone.replace(/[^0-9]/g, '').length < 10) {
        alert(`Please enter a valid 10-digit phone number for Traveller #${i + 1}`);
        return false;
      }
      if (i === 0 && (!t.email.trim() || !t.email.includes('@'))) {
        alert('Please enter a valid email address for the primary traveller to receive digital QR tickets.');
        return false;
      }
    }
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      alert('Please enter an emergency contact name and phone number for safety.');
      return false;
    }
    return true;
  };

  // Step 5 Seat selection handler
  const handleSeatSelect = (busId: string, seatNumbers: string[]) => {
    setSelectedBusId(busId);
    setSelectedSeats(seatNumbers);
  };

  // Step 7: Razorpay Order Creation & Payment
  const handleProceedToPayment = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const primary = travellers[0];
      const payload = {
        travellers,
        sittingPreference,
        busId: selectedBusId,
        selectedSeats,
        bookingSessionId,
        emergencyContactName,
        emergencyContactPhone,
      };

      const res = await fetch('/api/bookings/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initialize booking payment');
      }

      // Check if Razorpay SDK is available
      if (typeof window.Razorpay !== 'undefined') {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: 'INR',
          name: 'GLA HIMALAYAN ESCAPE',
          description: `Seat Reservation (${travellers.length} Travellers) - ${orderData.bookingId}`,
          image: '/favicon.ico',
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: primary.fullName,
            email: primary.email,
            contact: primary.phone,
          },
          theme: {
            color: '#0d3326', // Forest green
          },
          handler: async function (response: any) {
            await verifyPayment({
              bookingId: orderData.bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback or Test simulation mode
        await verifyPayment({
          bookingId: orderData.bookingId,
          razorpayOrderId: orderData.razorpayOrderId,
          razorpayPaymentId: 'pay_sim_' + Date.now(),
          razorpaySignature: 'simulated_signature_sandbox',
        });
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Payment process interrupted';
      setPaymentError(msg);
      setIsProcessingPayment(false);
    }
  };

  // Verify Razorpay payment
  const verifyPayment = async (verificationPayload: any) => {
    try {
      const res = await fetch('/api/bookings/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      setConfirmedBooking(data.booking);
      setCurrentStep(8); // Move to final confirmation

      // Trigger celebration confetti if loaded
      if (typeof window.confetti === 'function') {
        window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setPaymentError(msg);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Step Indicator labels
  const stepsList = [
    { num: 1, label: 'Google Sign In' },
    { num: 2, label: 'Travellers' },
    { num: 3, label: 'Traveller Info' },
    { num: 4, label: 'Preference' },
    { num: 5, label: 'Bus & Seats' },
    { num: 6, label: 'Summary' },
    { num: 7, label: 'Pay Deposit' },
    { num: 8, label: 'Confirmation' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="lazyOnload" />

      {/* Progress Stepper Header */}
      <div className="w-full glass-card rounded-2xl p-4 sm:p-6 border border-white/10">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 text-xs">
          {stepsList.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isCompleted
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                    : 'text-zinc-500 bg-zinc-900/40'
                }`}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-black/30">
                  {isCompleted ? <Check className="w-3 h-3 text-emerald-400" /> : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: GOOGLE AUTHENTICATION ONLY                        */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 text-center animate-in fade-in duration-300">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white text-zinc-900 flex items-center justify-center mx-auto shadow-xl">
              {/* Google G Logo SVG */}
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Sign In to Continue</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              One-click access with Google. No passwords or account creation needed.
            </p>
          </div>

          {userSession ? (
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 space-y-4 text-left">
              <div className="flex items-center gap-3">
                {userSession.image ? (
                  <img
                    src={userSession.image}
                    alt={userSession.name}
                    className="w-12 h-12 rounded-full border border-emerald-400"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    {userSession.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 truncate">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Signed In with Google
                  </span>
                  <p className="text-sm font-bold text-white truncate">{userSession.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{userSession.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Continue to Number of Travellers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-4">
              {/* Primary: Continue with Google Button */}
              <a
                href="/api/auth/google?returnUrl=/book"
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </a>

              {/* Dev/Local Instant Sign-in (Seamless offline testing) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSandboxLogin()}
                  disabled={demoLoginLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2"
                >
                  {demoLoginLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Instant GLA Student Sign-in (Demo / Offline Mode)</span>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-zinc-500 pt-2 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Your Google identity is only used to manage your booking & tickets.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: NUMBER OF TRAVELLERS (1–6+)                       */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              STEP 2 OF 8 • CAPACITY PLANNING
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">How many travellers?</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Book for yourself or your friends together under a single booking ID.
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md mx-auto">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setTravellersCount(num)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-base transition-all ${
                  travellersCount === num
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950 scale-105 border-2 border-emerald-400'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Counter Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setTravellersCount((prev) => Math.max(1, prev - 1))}
              disabled={travellersCount <= 1}
              className="w-10 h-10 rounded-xl bg-zinc-800 disabled:opacity-40 text-white font-bold text-lg flex items-center justify-center"
            >
              -
            </button>
            <span className="text-xl font-black text-white min-w-[120px] text-center">
              {travellersCount} {travellersCount === 1 ? 'Traveller' : 'Travellers'}
            </span>
            <button
              type="button"
              onClick={() => setTravellersCount((prev) => Math.min(23, prev + 1))}
              className="w-10 h-10 rounded-xl bg-zinc-800 text-white font-bold text-lg flex items-center justify-center"
            >
              +
            </button>
          </div>

          {/* Profit-Safe Pricing Calculation Preview */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Standard Trip Rate:</span>
              <span className="font-bold text-zinc-200">₹6,200 per traveller</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
              <span>Total Price ({travellersCount} pax):</span>
              <span className="font-bold text-white text-sm">
                ₹{(travellersCount * 6200).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Pay Today to Reserve:</span>
              <span className="text-base text-emerald-300">
                ₹{(travellersCount * 1000).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Remaining Balance:</span>
              <span className="font-semibold text-zinc-300">
                ₹{(travellersCount * 5200).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Group Operational Note */}
          {travellersCount > 1 && (
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-orange-950/30 border border-orange-700/40 text-xs text-orange-300 flex items-center gap-2">
              <Compass className="w-4 h-4 shrink-0 text-orange-400" />
              <span>
                All {travellersCount} seats will be bookable together on the same coach with adjacent seating recommendation.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              <span>Continue to Traveller Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: TRAVELLER INFORMATION                             */}
      {/* ======================================================== */}
      {currentStep === 3 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              STEP 3 OF 8 • TRAVELLER PROFILES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Traveller Information</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Provide names and contacts for ticket generation and university manifest.
            </p>
          </div>

          <div className="space-y-6">
            {travellers.map((t, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-black text-white uppercase flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>Traveller #{idx + 1} {idx === 0 ? '(Primary Contact)' : ''}</span>
                  </span>
                  <span className="text-[11px] font-bold text-zinc-500">₹6,200</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={t.fullName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTravellers((prev) => {
                          const copy = [...prev];
                          copy[idx].fullName = val;
                          return copy;
                        });
                      }}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Phone Number (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={t.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setTravellers((prev) => {
                          const copy = [...prev];
                          copy[idx].phone = val;
                          return copy;
                        });
                      }}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Email Address {idx === 0 ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="email"
                      required={idx === 0}
                      value={t.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTravellers((prev) => {
                          const copy = [...prev];
                          copy[idx].email = val;
                          return copy;
                        });
                      }}
                      placeholder="aryan@gla.ac.in"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                      Gender *
                    </label>
                    <select
                      value={t.gender}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTravellers((prev) => {
                          const copy = [...prev];
                          copy[idx].gender = val;
                          return copy;
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Emergency Contact */}
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4">
              <span className="text-xs font-black text-orange-400 uppercase tracking-wider block">
                Emergency Contact (Mandatory for Trip Safety)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Contact Name (Parent / Guardian) *
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Emergency Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9876500000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateTravellerDetails()) {
                  setCurrentStep(4);
                }
              }}
              className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              <span>Continue to Sitting Preference</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: SITTING PREFERENCE                                */}
      {/* ======================================================== */}
      {currentStep === 4 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2 text-center max-w-lg mx-auto">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              STEP 4 OF 8 • PREFERENCE GUIDANCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Coach Seating Preference</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Select your preference. We will highlight recommended seats on the map.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[
              { id: 'WINDOW', label: 'Window Seat', desc: 'Scenic Himalayan vistas and roadside views' },
              { id: 'AISLE', label: 'Aisle Seat', desc: 'Easy walkaway access and extra leg flexibility' },
              { id: 'FRONT', label: 'Front Rows', desc: 'Smooth highway cruise and fast boarding' },
              { id: 'BACK', label: 'Rear Cabin', desc: 'Popular with groups travelling together' },
              { id: 'NO_PREFERENCE', label: 'No Preference', desc: 'Happy with any comfortable seat on the coach' },
            ].map((pref) => {
              const isSelected = sittingPreference === pref.id;
              return (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => setSittingPreference(pref.id as SittingPreference)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className={`text-sm font-bold block ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                    {pref.label}
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-1">{pref.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              <span>Continue to Seat Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 5: BUS & SEAT SELECTION                              */}
      {/* ======================================================== */}
      {currentStep === 5 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              STEP 5 OF 8 • BOOKMYSHOW SEAT SELECTOR
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Select Your Coach & Seats</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Please select exactly <strong className="text-emerald-400">{travellersCount}</strong> {travellersCount === 1 ? 'seat' : 'seats'}. 
              Seats are held for 10 minutes while you complete reservation.
            </p>
          </div>

          <BusSeatMap
            requiredSeatsCount={travellersCount}
            selectedSeats={selectedSeats}
            selectedBusId={selectedBusId}
            onSeatSelect={handleSeatSelect}
            bookingSessionId={bookingSessionId}
            preference={sittingPreference}
          />

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white"
            >
              Back
            </button>
            <button
              type="button"
              disabled={selectedSeats.length !== travellersCount}
              onClick={() => setCurrentStep(6)}
              className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              <span>Continue to Summary ({selectedSeats.length}/{travellersCount} Seats)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 6: BOOKING SUMMARY (SECTION 22 MINIMAL DESIGN)      */}
      {/* ======================================================== */}
      {currentStep === 6 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2 text-center max-w-lg mx-auto">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              STEP 6 OF 8 • REVIEW & CONFIRM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Booking Summary</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Review your trip reservation details before completing payment.
            </p>
          </div>

          {/* Minimal Essential Card */}
          <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-white/15 space-y-5 shadow-2xl">
            <div className="border-b border-zinc-800 pb-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">TRIP</span>
              <p className="text-base font-black text-white mt-0.5">GLA → Manali → Kasol → GLA</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-zinc-800 pb-3 text-xs">
              <div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">DURATION</span>
                <p className="font-bold text-zinc-200 mt-0.5">6 Days / 5 Nights</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">TRAVELLERS</span>
                <p className="font-bold text-zinc-200 mt-0.5">{travellersCount} Person(s)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-zinc-800 pb-3 text-xs">
              <div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">COACH</span>
                <p className="font-bold text-emerald-400 mt-0.5">Luxury 2x2 AC Coach</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">SEATS</span>
                <p className="font-black text-emerald-400 mt-0.5">{selectedSeats.join(', ')}</p>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>PRICE:</span>
                <span className="font-bold text-white">₹{(travellersCount * 6200).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold text-sm">
                <span>RESERVATION TODAY:</span>
                <span className="text-base text-emerald-300">₹{(travellersCount * 1000).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>REMAINING BALANCE:</span>
                <span className="text-zinc-300">₹{(travellersCount * 5200).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleProceedToPayment}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Reservation...</span>
                </>
              ) : (
                <span>PAY ₹{(travellersCount * 1000).toLocaleString('en-IN')}</span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white"
            >
              Back to Seats
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 8: CONFIRMATION & DIGITAL QR BOARDING PASS           */}
      {/* ======================================================== */}
      {currentStep === 8 && confirmedBooking && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 animate-in fade-in duration-500">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
              BOOKING CONFIRMED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Himalayan Escape Locked!</h2>
            <p className="text-xs text-zinc-400">
              Booking Ref: <strong className="font-mono text-white">#{confirmedBooking.bookingId}</strong>
            </p>
          </div>

          {/* Minimal Ticket Card */}
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider block">EXPEDITION</span>
                <span className="font-black text-white text-sm">GLA HIMALAYAN ESCAPE</span>
                <p className="text-[10px] text-zinc-500">MANALI × KASOL • 6D / 5N</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-zinc-500 uppercase block">COACH</span>
                <span className="font-bold text-emerald-400 text-xs">
                  {confirmedBooking.bus?.busNumber || 'Bus 01'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Primary Traveller:</span>
                <span className="font-bold text-white">{confirmedBooking.primaryTravellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Confirmed Seats:</span>
                <span className="font-bold text-emerald-400">
                  {confirmedBooking.travellers?.map((t: any) => t.assignedSeatNumber).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Reservation Paid:</span>
                <span className="font-bold text-white">₹{confirmedBooking.reservationAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Remaining Balance:</span>
                <span className="font-bold text-amber-400">₹{confirmedBooking.remainingBalance?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Digital Boarding Ticket:</span>
              <Link
                href={`/ticket?bookingId=${confirmedBooking.bookingId}`}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                View Ticket
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/ticket?bookingId=${confirmedBooking.bookingId}`}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg text-center"
            >
              VIEW DIGITAL TICKET
            </Link>
            <Link
              href={`/my-booking?bookingId=${confirmedBooking.bookingId}`}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm text-center"
            >
              MY BOOKING DASHBOARD
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
