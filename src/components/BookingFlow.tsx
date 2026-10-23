'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import {
  User, CheckCircle2, ArrowRight,
  Loader2, AlertCircle
} from 'lucide-react';
import BusSeatMap from './BusSeatMap';
import DualAuthCard from '@/components/auth/DualAuthCard';
import { SittingPreference, TravellerInput, BookingPricing } from '@/types';
import { PRICING_DEFAULTS } from '@/lib/constants';

declare global {
  interface Window {
    Razorpay: any;
    confetti: any;
  }
}

interface UserSession {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string;
}

export default function BookingFlow() {
  // Steps:
  // 1: Google Login (if unauthenticated)
  // 2: Travellers count
  // 3: Traveller details
  // 4: Choose seats & preference
  // 5: Review & Payment
  // 6: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [bookingSessionId, setBookingSessionId] = useState<string>('');

  // Authentication State
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Step: Travellers Count
  const [travellersCount, setTravellersCount] = useState<number>(1);

  // Step: Traveller Details
  const [travellers, setTravellers] = useState<TravellerInput[]>([
    { fullName: '', phone: '', email: '', gender: 'Male', collegeId: '' },
  ]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Step: Sitting Preference
  const [sittingPreference, setSittingPreference] = useState<SittingPreference>('NO_PREFERENCE');

  // Step: Bus & Seat Selection
  const [selectedBusId, setSelectedBusId] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [squadFriendSeats, setSquadFriendSeats] = useState<string[]>([]);
  const [squadLinkNotice, setSquadLinkNotice] = useState<string | null>(null);

  // Step: Pricing & Payment
  const [pricing, setPricing] = useState<BookingPricing | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Step: Confirmed Booking Details
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Restore the coach and seats shared by a friend without taking their seats.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bus = params.get('bus');
    const seats = (params.get('seats') || '')
      .split(',')
      .map((seat) => seat.trim().toUpperCase())
      .filter((seat) => /^(L|R|B)\d+$/.test(seat));

    if (bus) setSelectedBusId(bus);
    if (seats.length > 0) setSquadFriendSeats([...new Set(seats)]);
  }, []);

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
            setTravellers((prev) => {
              const updated = [...prev];
              if (updated[0]) {
                updated[0].fullName = updated[0].fullName || data.user.name || '';
                updated[0].email = updated[0].email || data.user.email || '';
              }
              return updated;
            });
            setCurrentStep((step) => (step === 1 ? 2 : step));
          }
        }
      } catch {
        // Fallback
      }
    }
    checkAuth();
  }, []);

  const refreshPricing = useCallback(async (count: number, couponOverride?: string) => {
    try {
      const codeToSend = couponOverride !== undefined ? couponOverride : couponInput;
      const res = await fetch(`/api/pricing/calculate?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify({ travellersCount: count, couponCode: codeToSend ? codeToSend.trim() : undefined }),
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setPricing(data.pricing);
        if (codeToSend && codeToSend.trim()) {
          if (data.pricing?.couponDiscount > 0) {
            setCouponMessage({
              type: 'success',
              text: `Promo "${data.pricing.couponCode}" applied! ₹${data.pricing.couponDiscount} discount.`,
            });
          } else {
            setCouponMessage({ type: 'error', text: 'Invalid or expired promo code' });
          }
        }
      }
    } catch {
      setPricing({
        travellersCount: count,
        baseAmount: count * 6500,
        totalAmount: count * 6500,
        pricePerTraveller: count >= 5 ? 6200 : 6500,
        reservationAmountPerTraveller: 1000,
        reservationAmount: count * 1000,
        remainingBalance: count * (count >= 5 ? 5200 : 5500),
        finalAmount: count * (count >= 5 ? 6200 : 6500),
        discountAmount: 0,
        isGroupRate: count >= 5,
        groupThreshold: 5,
        groupPackagePrice: 6200,
        standardPackagePrice: 6500,
        savingsPerTraveller: count >= 5 ? 300 : 0,
      });
    }
  }, [couponInput]);

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
          collegeId: '',
        });
      }
      return updated.slice(0, travellersCount);
    });

    if (selectedSeats.length > travellersCount) {
      setSelectedSeats([]);
    }

    refreshPricing(travellersCount);
  }, [travellersCount, refreshPricing, selectedSeats.length]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUserSession(null);
      setCurrentStep(1);
    } catch {
      // Continue
    }
  };

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
        alert('Please enter a valid email address for the primary contact.');
        return false;
      }
    }
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      alert('Please enter an emergency contact name and phone number for student safety.');
      return false;
    }
    return true;
  };

  const handleSeatSelect = (busId: string, seatNumbers: string[]) => {
    setSelectedBusId(busId);
    setSelectedSeats(seatNumbers);
  };

  const handleShareSquadLink = async () => {
    if (!selectedBusId || selectedSeats.length === 0) return;

    const shareUrl = new URL('/book', window.location.origin);
    shareUrl.searchParams.set('bus', selectedBusId);
    shareUrl.searchParams.set('seats', selectedSeats.join(','));

    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      setSquadLinkNotice('Squad link copied! Send it in your WhatsApp group to lock seats together.');
      window.setTimeout(() => setSquadLinkNotice(null), 4500);
    } catch {
      setSquadLinkNotice('Could not copy automatically. Please allow clipboard access and try again.');
    }
  };

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
        couponCode: couponInput.trim() || undefined,
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

      if (typeof window.Razorpay !== 'undefined') {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: 'INR',
          name: 'HIMALAYAN ESCAPE',
          description: `Seat Reservation (${travellers.length} Travellers) - ${orderData.bookingId}`,
          image: '/logo.png',
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: primary.fullName,
            email: primary.email,
            contact: primary.phone,
          },
          theme: {
            color: '#163C32',
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
            ondismiss: async function () {
              setIsProcessingPayment(false);
              try {
                await fetch('/api/seats/release-batch', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    bookingSessionId,
                    busId: selectedBusId,
                    seatNumbers: selectedSeats,
                    bookingId: orderData.bookingId,
                  }),
                });
              } catch (err) {
                console.error('Error rolling back abandoned seats:', err);
              }
              setPaymentError('Payment window was closed. Your temporary seat hold has been released.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay secure checkout could not be loaded. Please ensure you are connected to the internet and retry.');
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Payment process interrupted';
      setPaymentError(msg);
      setIsProcessingPayment(false);
    }
  };

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
      setCurrentStep(6);

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

  const bookingSteps = [
    { num: 2, label: '01 Travellers' },
    { num: 3, label: '02 Details' },
    { num: 4, label: '03 Seats' },
    { num: 5, label: '04 Review & Pay' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 bg-[#F7F5EF] text-[#171918]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="lazyOnload" />

      {/* Booking Header & Progress Bar */}
      {currentStep !== 6 && (
        <div className="bg-white rounded-2xl p-5 border border-[#D8D2C4] space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E2D8] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D87945]">
                RESERVATION PORTAL
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#171918]">
                BOOK YOUR SEAT
              </h1>
            </div>
            {userSession && (
              <div className="flex items-center gap-2 text-xs text-[#646864]">
                <span>Signed in as <strong>{userSession.name?.split(' ')[0]}</strong></span>
                <button onClick={handleSignOut} className="text-[#D87945] font-semibold hover:underline">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Simple Progress Bar (Section 15) */}
          <div className="flex items-center justify-between gap-1 text-xs">
            {bookingSteps.map((s) => {
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center font-bold transition-all ${
                    isActive
                      ? 'bg-[#163C32] text-white shadow-xs'
                      : isPast
                      ? 'bg-[#E7E2D8] text-[#163C32]'
                      : 'bg-[#F7F5EF] text-[#B4AA96]'
                  }`}
                >
                  <span className="truncate block">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* STEP 1: AUTH GATE (DUAL AUTH: GOOGLE + PHONE & PASSWORD) */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="animate-in fade-in duration-200">
          <DualAuthCard
            returnUrl="/book"
            title="Sign In to Select Coach Seats"
            subtitle="Sign in with your Google account or Mobile Number to select coach seats and receive your digital QR boarding pass."
            onAuthSuccess={(user) => {
              setUserSession(user);
              setTravellers((prev) => {
                const updated = [...prev];
                if (updated[0]) {
                  updated[0].fullName = updated[0].fullName || user.name || '';
                  updated[0].email = updated[0].email || user.email || '';
                  updated[0].phone = updated[0].phone || user.phone || '';
                }
                return updated;
              });
              setCurrentStep(2);
            }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: WHO'S COMING? (TRAVELLER QUANTITY SELECTOR)      */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D8D2C4] space-y-8 text-center shadow-sm animate-in fade-in duration-200">
          <div className="max-w-md mx-auto space-y-2">
            <span className="text-xs font-bold text-[#D87945] uppercase tracking-widest">
              01 • PASSENGER COUNT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171918]">
              Who's coming?
            </h2>
            <p className="text-xs text-[#646864]">
              Select the number of seats you wish to reserve together on the same coach.
            </p>
          </div>

          {/* Large Quantity Selector (Section 17) */}
          <div className="max-w-xs mx-auto p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={travellersCount <= 1}
                onClick={() => setTravellersCount((prev) => Math.max(1, prev - 1))}
                className="w-12 h-12 rounded-xl bg-white border border-[#D8D2C4] text-xl font-bold text-[#171918] hover:bg-[#E7E2D8] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                −
              </button>
              <div className="text-center">
                <span className="text-4xl font-black text-[#171918] block leading-none">
                  {travellersCount}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#646864]">
                  {travellersCount === 1 ? 'TRAVELLER' : 'TRAVELLERS'}
                </span>
              </div>
              <button
                type="button"
                disabled={travellersCount >= 6}
                onClick={() => setTravellersCount((prev) => Math.min(6, prev + 1))}
                className="w-12 h-12 rounded-xl bg-white border border-[#D8D2C4] text-xl font-bold text-[#171918] hover:bg-[#E7E2D8] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                +
              </button>
            </div>

            {/* Live Tiered Squad Pricing Tag */}
            <div className="pt-2">
              {travellersCount < (pricing?.groupThreshold || 5) ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-0.5">
                  <div className="text-xs font-bold text-amber-900 font-mono">
                    ₹{(pricing?.standardPackagePrice || 6500).toLocaleString('en-IN')} / person
                  </div>
                  <div className="text-[11px] text-amber-800 font-medium">
                    ⚡ Add {(pricing?.groupThreshold || 5) - travellersCount} more friend{(pricing?.groupThreshold || 5) - travellersCount > 1 ? 's' : ''} to unlock <span className="font-bold text-amber-950 font-mono">₹{(pricing?.groupPackagePrice || 6200).toLocaleString('en-IN')} / person</span> group rate!
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-center space-y-0.5 animate-in fade-in">
                  <div className="text-xs font-black text-emerald-800 font-mono flex items-center justify-center gap-1">
                    <span>🎉 Group Discount Unlocked!</span>
                  </div>
                  <div className="text-[11px] text-emerald-900 font-semibold">
                    Flat ₹{(pricing?.groupPackagePrice || 6200).toLocaleString('en-IN')} / person applied (Saved ₹{(pricing?.savingsPerTraveller || 300).toLocaleString('en-IN')} per head)
                  </div>
                </div>
              )}
            </div>

            {/* Transparent Calculation */}
            <div className="pt-2 border-t border-[#D8D2C4] text-xs space-y-1">
              <div className="flex justify-between text-[#171918] font-bold">
                <span>Total Package:</span>
                <span>₹{(pricing?.totalAmount ?? (travellersCount * (pricing?.pricePerTraveller || 6500))).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#D87945] font-semibold">
                <span>Reservation Deposit (Today):</span>
                <span>₹{(pricing?.reservationAmount ?? (travellersCount * (pricing?.reservationAmountPerTraveller || 1000))).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#646864] text-[11px]">
                <span>Remaining before boarding:</span>
                <span>₹{(pricing?.remainingBalance ?? (travellersCount * ((pricing?.pricePerTraveller || 6500) - (pricing?.reservationAmountPerTraveller || 1000)))).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-8 py-3.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>CONTINUE TO TRAVELLER DETAILS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: TRAVELLER DETAILS FORM                           */}
      {/* ======================================================== */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D8D2C4] space-y-8 shadow-sm animate-in fade-in duration-200">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#D87945] uppercase tracking-widest">
              02 • PASSENGER INFORMATION
            </span>
            <h2 className="text-2xl font-black text-[#171918]">Traveller Details</h2>
            <p className="text-xs text-[#646864]">
              Enter the legal names and contact numbers for all {travellersCount} travellers.
            </p>
          </div>

          <div className="space-y-6">
            {travellers.map((traveller, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-4">
                <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                  <span className="text-xs font-black text-[#163C32] uppercase tracking-wider">
                    {idx === 0 ? 'Lead Traveller (Primary Contact)' : `Traveller #${idx + 1}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[#171918]">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={traveller.fullName}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[idx].fullName = e.target.value;
                        setTravellers(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#171918]">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={traveller.phone}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[idx].phone = e.target.value;
                        setTravellers(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#171918]">Email Address {idx === 0 ? '*' : '(Optional)'}</label>
                    <input
                      type="email"
                      required={idx === 0}
                      placeholder="To receive ticket"
                      value={traveller.email}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[idx].email = e.target.value;
                        setTravellers(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#171918]">Gender</label>
                    <select
                      value={traveller.gender}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[idx].gender = e.target.value as 'Male' | 'Female' | 'Other';
                        setTravellers(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="font-bold text-[#171918] text-xs">
                    Student ID / College Roll No (Optional / For ID Verification)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2115000123 / College Roll No"
                    value={traveller.collegeId || ''}
                    onChange={(e) => {
                      const updated = [...travellers];
                      updated[idx].collegeId = e.target.value;
                      setTravellers(updated);
                    }}
                    className="w-full sm:w-1/2 px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                  />
                </div>
              </div>
            ))}

            {/* Emergency Contact */}
            <div className="p-5 rounded-2xl bg-[#E7E2D8] border border-[#D8D2C4] space-y-3">
              <span className="text-xs font-bold text-[#163C32] uppercase tracking-wider block">
                Emergency Contact (Parent / Guardian)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#171918]">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#171918]">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit phone"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E7E2D8]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs font-bold text-[#171918] hover:bg-[#E7E2D8]"
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
              className="px-7 py-3 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <span>CONTINUE TO SEAT MAP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: CHOOSE SEATS & SITTING PREFERENCE                */}
      {/* ======================================================== */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D8D2C4] space-y-8 shadow-sm animate-in fade-in duration-200">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#D87945] uppercase tracking-widest">
              03 • SEAT ALLOCATION
            </span>
            <h2 className="text-2xl font-black text-[#171918]">Choose Your Seats</h2>
            <p className="text-xs text-[#646864]">
              Select exactly <strong>{travellersCount}</strong> {travellersCount === 1 ? 'seat' : 'seats'}. 
              Seats are held for 10 minutes while you complete checkout.
            </p>
          </div>

          {/* Sitting Preference Pills */}
          <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-2">
            <span className="text-xs font-bold text-[#163C32] uppercase tracking-wider block">
              Seating Preference (Highlights Matching Seats with ★):
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'WINDOW', label: 'Window' },
                { id: 'AISLE', label: 'Aisle' },
                { id: 'FRONT', label: 'Front Rows' },
                { id: 'BACK', label: 'Rear Cabin' },
                { id: 'NO_PREFERENCE', label: 'No Preference' },
              ].map((pref) => (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => setSittingPreference(pref.id as SittingPreference)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sittingPreference === pref.id
                      ? 'bg-[#163C32] text-white shadow-xs'
                      : 'bg-white border border-[#D8D2C4] text-[#171918] hover:border-[#163C32]'
                  }`}
                >
                  {pref.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bus Seating Map */}
          <BusSeatMap
            requiredSeatsCount={travellersCount}
            selectedSeats={selectedSeats}
            selectedBusId={selectedBusId}
            onSeatSelect={handleSeatSelect}
            bookingSessionId={bookingSessionId}
            preference={sittingPreference}
            squadFriendSeats={squadFriendSeats}
          />

          {selectedSeats.length >= 1 && selectedSeats.length <= 4 && (
            <div className="w-full max-w-xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-amber-50 border border-violet-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-[#171918]">Booking with your crew?</p>
                <p className="text-xs text-[#646864] mt-1">
                  Add {5 - selectedSeats.length} more {5 - selectedSeats.length === 1 ? 'friend' : 'friends'} to unlock the ₹6,200/head squad deal!
                </p>
                {squadLinkNotice && (
                  <p role="status" className="text-xs font-bold text-emerald-700 mt-2">
                    {squadLinkNotice}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleShareSquadLink}
                className="shrink-0 px-4 py-3 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-extrabold text-xs shadow-md transition-colors"
              >
                🔗 Share Squad Link
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#E7E2D8]">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs font-bold text-[#171918] hover:bg-[#E7E2D8]"
            >
              Back
            </button>
            <button
              type="button"
              disabled={selectedSeats.length !== travellersCount}
              onClick={() => setCurrentStep(5)}
              className="px-7 py-3 rounded-xl bg-[#D87945] hover:bg-[#C26735] disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <span>REVIEW & PAY ({selectedSeats.length}/{travellersCount} Selected)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 5: REVIEW & PAYMENT (SECTION 22 & 23)               */}
      {/* ======================================================== */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D8D2C4] space-y-8 shadow-sm animate-in fade-in duration-200">
          <div className="space-y-2 text-center max-w-md mx-auto">
            <span className="text-xs font-bold text-[#D87945] uppercase tracking-widest">
              04 • FINAL REVIEW
            </span>
            <h2 className="text-2xl font-black text-[#171918]">Review Your Booking</h2>
            <p className="text-xs text-[#646864]">
              Transparent summary. No hidden fees or unexpected charges.
            </p>
          </div>

          {/* Sticky Summary Card */}
          <div className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-4">
            <div className="border-b border-[#D8D2C4] pb-3">
              <span className="text-[10px] font-bold text-[#646864] uppercase tracking-wider block">EXPEDITION</span>
              <p className="text-base font-black text-[#171918]">Mathura → Manali → Kasol → Mathura</p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-[#D8D2C4] pb-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#646864] uppercase block">DURATION</span>
                <p className="font-bold text-[#171918]">6 Days / 5 Nights</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#646864] uppercase block">TRAVELLERS</span>
                <p className="font-bold text-[#171918]">{travellersCount} Person(s)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-[#D8D2C4] pb-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#646864] uppercase block">COACH</span>
                <p className="font-bold text-[#163C32]">Dedicated AC tourist coach</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#646864] uppercase block">SEATS</span>
                <p className="font-black text-[#163C32]">{selectedSeats.join(', ')}</p>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 pb-1 border-y border-[#D8D2C4] space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter Promo Code (e.g. SQUAD5)"
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs font-mono font-bold text-[#171918] uppercase placeholder:normal-case placeholder:font-normal focus:border-[#D87945] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={applyingCoupon || !couponInput.trim()}
                  onClick={async () => {
                    setApplyingCoupon(true);
                    await refreshPricing(travellersCount, couponInput.trim());
                    setApplyingCoupon(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#163C32] hover:bg-[#112F27] text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {applyingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {couponMessage && (
                <p
                  className={`text-[11px] font-semibold ${
                    couponMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between text-[#646864]">
                <span>Total Trip Cost:</span>
                <span className="font-bold text-[#171918]">₹{(pricing?.baseAmount ?? (travellersCount * (pricing?.pricePerTraveller || 6500))).toLocaleString('en-IN')}</span>
              </div>

              {pricing?.discountAmount && pricing.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Discount ({pricing.couponCode}):</span>
                  <span>−₹{pricing.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              ) : null}

              {pricing?.isGroupRate ? (
                <div className="flex justify-between text-emerald-700 text-[11px] font-semibold">
                  <span>Squad Group Discount:</span>
                  <span>Flat ₹{(pricing.groupPackagePrice || 6200).toLocaleString('en-IN')}/head</span>
                </div>
              ) : null}

              <div className="flex justify-between text-[#D87945] font-bold text-sm">
                <span>Reservation Deposit (Today):</span>
                <span className="text-base">₹{(pricing?.reservationAmount ?? (travellersCount * (pricing?.reservationAmountPerTraveller || 1000))).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#646864] text-[11px]">
                <span>Balance Before Boarding:</span>
                <span className="text-[#171918]">₹{(pricing?.remainingBalance ?? (travellersCount * ((pricing?.pricePerTraveller || 6500) - (pricing?.reservationAmountPerTraveller || 1000)))).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleProceedToPayment}
              className="w-full py-3.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-2"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>PAY RESERVATION (₹{(pricing?.reservationAmount ?? (travellersCount * (pricing?.reservationAmountPerTraveller || 1000))).toLocaleString('en-IN')})</span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E7E2D8]">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs font-bold text-[#171918] hover:bg-[#E7E2D8]"
            >
              Back to Seats
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 6: CONFIRMATION & DIGITAL BOARDING PASS             */}
      {/* ======================================================== */}
      {currentStep === 6 && confirmedBooking && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D8D2C4] space-y-8 animate-in fade-in duration-300 shadow-sm">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#163C32]/10 text-[#163C32] flex items-center justify-center mx-auto border border-[#163C32]/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-black text-[#163C32] uppercase tracking-widest block">
              BOOKING CONFIRMED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171918]">
              You're going to the mountains.
            </h2>
            <p className="text-xs text-[#646864]">
              Booking ID: <strong className="font-mono text-[#171918]">#{confirmedBooking.bookingId}</strong>
            </p>
          </div>

          {/* Ticket Preview Card */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#D87945] uppercase tracking-wider block">EXPEDITION</span>
                <span className="font-black text-[#171918] text-sm">HIMALAYAN ESCAPE</span>
                <p className="text-[10px] text-[#646864]">MANALI × KASOL • 6D / 5N</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#646864] uppercase block">COACH</span>
                <span className="font-bold text-[#163C32] text-xs">
                  {confirmedBooking.bus?.busNumber || 'Bus 01'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-[#171918]">
              <div className="flex justify-between">
                <span className="text-[#646864]">Primary Traveller:</span>
                <span className="font-bold">{confirmedBooking.primaryTravellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646864]">Confirmed Seats:</span>
                <span className="font-bold text-[#163C32]">
                  {confirmedBooking.travellers?.map((t: any) => t.assignedSeatNumber).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646864]">Reservation Paid:</span>
                <span className="font-bold text-[#163C32]">₹{confirmedBooking.reservationAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646864]">Remaining Balance:</span>
                <span className="font-bold text-[#D87945]">₹{confirmedBooking.remainingBalance?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/ticket?bookingId=${confirmedBooking.bookingId}`}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-xs shadow-md text-center"
            >
              VIEW DIGITAL BOARDING PASS
            </Link>
            <Link
              href={`/my-booking?bookingId=${confirmedBooking.bookingId}`}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white hover:bg-[#F7F5EF] border border-[#D8D2C4] text-[#171918] font-bold text-xs text-center"
            >
              VIEW MY BOOKING
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
