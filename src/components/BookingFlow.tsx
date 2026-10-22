'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import {
  Users, User, Heart, CheckCircle2, ArrowRight, ArrowLeft,
  CreditCard, Sparkles, ShieldCheck, Ticket, Download, Phone,
  MessageSquare, Loader2, AlertCircle, Copy, Check
} from 'lucide-react';
import BusSeatMap from './BusSeatMap';
import { PackageType, SittingPreference, TravellerInput, BookingPricing } from '@/types';
import { CONTACT_INFO, PRICING_DEFAULTS } from '@/lib/constants';

declare global {
  interface Window {
    Razorpay: any;
    confetti: any;
  }
}

export default function BookingFlow() {
  const router = useRouter();

  // Booking Flow Steps: 1: Package, 2: Travellers, 3: Preference & Referral, 4: Seats, 5: Review & Pay, 6: Confirmed
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [bookingSessionId, setBookingSessionId] = useState<string>('');

  // Step 1: Package
  const [packageType, setPackageType] = useState<PackageType>('SINGLE');

  // Step 2: Travellers
  const [travellers, setTravellers] = useState<TravellerInput[]>([
    { fullName: '', phone: '', email: '', gender: 'Male', emergencyContactName: '', emergencyContactPhone: '' },
  ]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Step 3: Referral & Preference
  const [referralCode, setReferralCode] = useState('');
  const [referralMessage, setReferralMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [sittingPreference, setSittingPreference] = useState<SittingPreference>('NO_PREFERENCE');

  // Step 4: Bus & Seats
  const [selectedBusId, setSelectedBusId] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Step 5: Pricing & Payment
  const [pricing, setPricing] = useState<BookingPricing | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Step 6: Confirmation
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [newReferralCode, setNewReferralCode] = useState<string>('');
  const [copiedRef, setCopiedRef] = useState(false);

  // Initialize booking session ID
  useEffect(() => {
    let sid = sessionStorage.getItem('gla_booking_session');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      sessionStorage.setItem('gla_booking_session', sid);
    }
    setBookingSessionId(sid);
  }, []);

  // Update travellers array size when package changes
  useEffect(() => {
    let requiredCount = 1;
    if (packageType === 'SINGLE') requiredCount = 1;
    if (packageType === 'COUPLE') requiredCount = 2;
    if (packageType === 'GROUP') requiredCount = 6;

    setTravellers((prev) => {
      const updated = [...prev];
      while (updated.length < requiredCount) {
        updated.push({
          fullName: '',
          phone: '',
          email: '',
          gender: 'Male',
          isFreeGroupTraveller: packageType === 'GROUP' && updated.length >= 5,
        });
      }
      return updated.slice(0, requiredCount);
    });

    // Reset seats when package changes to prevent seat count mismatch
    setSelectedSeats([]);
  }, [packageType]);

  // Server-side recalculate pricing whenever relevant fields change
  const refreshPricing = async () => {
    setIsCalculatingPrice(true);
    try {
      const res = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType,
          travellersCount: travellers.length,
          referralCode: referralCode.trim() || undefined,
          primaryPhone: travellers[0]?.phone || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPricing(data.pricing);
        if (referralCode.trim()) {
          if (data.referral.status === 'VALID') {
            setReferralMessage({ text: data.referral.message, type: 'success' });
          } else {
            setReferralMessage({ text: data.referral.message || 'Invalid referral code', type: 'error' });
          }
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  useEffect(() => {
    refreshPricing();
  }, [packageType, travellers.length]);

  // Handle single traveller field update
  const handleTravellerChange = (index: number, field: keyof TravellerInput, value: string) => {
    setTravellers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Trigger celebratory confetti on confirmation
  const triggerConfetti = () => {
    if (typeof window !== 'undefined' && window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F97316', '#38BDF8', '#EAB308', '#FFFFFF'],
      });
    }
  };

  // Create Razorpay Order and Launch Checkout
  const handlePayReservation = async () => {
    if (!termsAccepted) {
      setPaymentError('Please accept the trip terms & safety conditions to proceed.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // 1. Create order on backend
      const res = await fetch('/api/bookings/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType,
          travellers,
          sittingPreference,
          busId: selectedBusId,
          selectedSeats,
          bookingSessionId,
          referralCode: referralCode.trim() || undefined,
          emergencyContactName: emergencyContactName || travellers[0]?.fullName,
          emergencyContactPhone: emergencyContactPhone || travellers[0]?.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data.error || 'Failed to initiate booking. Please retry.');
        setIsProcessingPayment(false);
        return;
      }

      const { bookingId, razorpayOrderId, amount, isMock, keyId } = data;

      // 2. If sandbox test mode (without valid live credentials), verify with server sandbox flow
      if (isMock || !window.Razorpay) {
        // Automatically verify sandbox payment server-side
        const verifyRes = await fetch('/api/bookings/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            razorpayOrderId,
            razorpayPaymentId: `pay_test_${Math.random().toString(36).substring(2, 10)}`,
            razorpaySignature: 'test_sandbox_signature_verified',
            bookingSessionId,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          setConfirmedBooking(verifyData.booking);
          setNewReferralCode(verifyData.referralCode);
          setCurrentStep(6);
          triggerConfetti();
        } else {
          setPaymentError(verifyData.error || 'Payment verification failed.');
        }
        setIsProcessingPayment(false);
        return;
      }

      // 3. Launch official Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'GLA Himalayan Escape',
        description: `₹1,000 Reservation - Booking ${bookingId}`,
        image: 'https://cdn-icons-png.flaticon.com/512/826/826070.png',
        order_id: razorpayOrderId,
        prefill: {
          name: travellers[0].fullName,
          email: travellers[0].email,
          contact: travellers[0].phone,
        },
        theme: {
          color: '#0D2B1D',
        },
        handler: async function (response: any) {
          // Verify Razorpay payment server-side
          try {
            const verifyRes = await fetch('/api/bookings/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingSessionId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setConfirmedBooking(verifyData.booking);
              setNewReferralCode(verifyData.referralCode);
              setCurrentStep(6);
              triggerConfetti();
            } else {
              setPaymentError(verifyData.error || 'Payment verification failed server-side.');
            }
          } catch {
            setPaymentError('Network error while verifying payment. Our team will verify via webhook.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentError('Payment window closed. Your seats remain held for the duration of the timer.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessingPayment(false);
        setPaymentError(response.error.description || 'Payment transaction failed.');
      });
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || 'An unexpected error occurred.');
      setIsProcessingPayment(false);
    }
  };

  const requiredSeatsCount = packageType === 'SINGLE' ? 1 : packageType === 'COUPLE' ? 2 : 6;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Razorpay and Confetti Scripts */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js" strategy="lazyOnload" />

      {/* 6-Step Visual Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Package' },
            { num: 2, label: 'Travellers' },
            { num: 3, label: 'Preferences' },
            { num: 4, label: 'Seats' },
            { num: 5, label: 'Review & Pay' },
            { num: 6, label: 'Confirmed' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  currentStep === s.num
                    ? 'bg-orange-500 text-white ring-4 ring-orange-500/30 glow-orange'
                    : currentStep > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}
              >
                {currentStep > s.num ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
              </div>
              <span className={`text-[10px] mt-1.5 font-semibold hidden sm:block ${
                currentStep >= s.num ? 'text-zinc-200' : 'text-zinc-500'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: SELECT PACKAGE */}
      {currentStep === 1 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Choose Your Package</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Only ₹1,000 reservation required today to secure your seat and lock the bus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            {/* Single Package */}
            <div
              onClick={() => setPackageType('SINGLE')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                packageType === 'SINGLE'
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-xl shadow-emerald-950/60'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <User className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">
                  1 Seat
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Single Explorer</h3>
              <p className="text-xs text-zinc-400 mt-1">Full transport, resort stay on sharing, sightseeing & meals.</p>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-white">₹6,200</span>
                  <span className="text-xs text-zinc-400"> / person</span>
                </div>
                <span className="text-xs font-bold text-orange-400">₹1,000 today</span>
              </div>
            </div>

            {/* Couple Package */}
            <div
              onClick={() => setPackageType('COUPLE')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${
                packageType === 'COUPLE'
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-xl shadow-emerald-950/60'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-orange-500 text-[10px] font-black uppercase text-white shadow">
                Best Value
              </span>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                  <Heart className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">
                  2 Seats
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Couple Package</h3>
              <p className="text-xs text-zinc-400 mt-1">
                2 adjacent bus seats + private double room in Manali & Kasol.
              </p>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-white">₹6,500</span>
                  <span className="text-xs text-zinc-400"> total for 2</span>
                </div>
                <span className="text-xs font-bold text-orange-400">₹1,000 today</span>
              </div>
            </div>

            {/* Group Package 5+1 */}
            <div
              onClick={() => setPackageType('GROUP')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${
                packageType === 'GROUP'
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-xl shadow-emerald-950/60'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-400 text-[10px] font-black uppercase text-zinc-950 shadow">
                5 + 1 FREE
              </span>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Users className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">
                  6 Seats
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Group Squad (5+1)</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Book for 5 paid friends and get the 6th friend completely FREE!
              </p>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-white">₹31,000</span>
                  <span className="text-xs text-zinc-400"> for 6 pax</span>
                </div>
                <span className="text-xs font-bold text-orange-400">₹1,000 today</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg glow-orange transition-all"
            >
              <span>Continue to Travellers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: TRAVELLER DETAILS */}
      {currentStep === 2 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Traveller Details</h2>
              <p className="text-xs text-zinc-400">
                Package: <strong className="text-emerald-400">{packageType}</strong> ({travellers.length} traveller{travellers.length > 1 ? 's' : ''})
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change
            </button>
          </div>

          <div className="space-y-6">
            {travellers.map((traveller, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    Traveller {idx + 1} {idx === 0 ? '(Primary Contact)' : ''}
                  </span>
                  {traveller.isFreeGroupTraveller && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400 text-zinc-950 uppercase">
                      100% Free Seat
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohit Sharma"
                      value={traveller.fullName}
                      onChange={(e) => handleTravellerChange(idx, 'fullName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Mobile Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={traveller.phone}
                      onChange={(e) => handleTravellerChange(idx, 'phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rohit@gla.ac.in"
                      value={traveller.email}
                      onChange={(e) => handleTravellerChange(idx, 'email', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Gender *</label>
                    <select
                      value={traveller.gender}
                      onChange={(e) => handleTravellerChange(idx, 'gender', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
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
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Emergency Contact (Parent / Guardian)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Parent / Guardian Name"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Emergency Contact Phone"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => {
                // Validate fields
                for (const t of travellers) {
                  if (!t.fullName.trim() || !t.phone.trim() || !t.email.trim()) {
                    alert('Please complete all required traveller details.');
                    return;
                  }
                }
                if (!emergencyContactName || !emergencyContactPhone) {
                  alert('Please enter an emergency contact person and phone number.');
                  return;
                }
                setCurrentStep(3);
              }}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg glow-orange"
            >
              <span>Preferences & Referral</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREFERENCES & REFERRAL */}
      {currentStep === 3 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">Seat Preference & Discounts</h2>
            <p className="text-xs text-zinc-400">
              Select your sitting preference and apply any friend referral code for up to 10% discount.
            </p>
          </div>

          {/* Sitting Preference */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Sitting Preference (Recommendation Only)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'WINDOW', label: 'Window' },
                { id: 'AISLE', label: 'Aisle' },
                { id: 'FRONT', label: 'Front' },
                { id: 'BACK', label: 'Back' },
                { id: 'NO_PREFERENCE', label: 'No Preference' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSittingPreference(p.id as SittingPreference)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                    sittingPreference === p.id
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md glow-emerald'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 italic">
              * Note: Your preference highlights matching seats in step 4 with a ★ star. You are free to pick any open seat.
            </p>
          </div>

          {/* Referral Code */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Referral Code (Save 5% – 10%)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. GLA-HIMALAYA10"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm uppercase font-mono tracking-wider focus:border-orange-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={refreshPricing}
                disabled={isCalculatingPrice}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {isCalculatingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
            {referralMessage && (
              <p className={`text-xs font-semibold ${referralMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {referralMessage.text}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg glow-orange"
            >
              <span>Choose Bus Seats</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: INTERACTIVE BUS SEAT SELECTION */}
      {currentStep === 4 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white">Select Your Bus Seats</h2>
            <p className="text-xs text-zinc-400">
              Please choose exactly <strong className="text-white">{requiredSeatsCount}</strong> seat{requiredSeatsCount > 1 ? 's' : ''} for your {packageType.toLowerCase()} booking.
            </p>
          </div>

          {/* Interactive Bus Seat Map Component */}
          <BusSeatMap
            requiredSeatsCount={requiredSeatsCount}
            selectedSeats={selectedSeats}
            selectedBusId={selectedBusId}
            onSeatSelect={(busId, seats) => {
              setSelectedBusId(busId);
              setSelectedSeats(seats);
            }}
            bookingSessionId={bookingSessionId}
            preference={sittingPreference}
            packageType={packageType}
          />

          {/* Selected Seat Summary Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase">Selected Seats:</span>
              <div className="flex items-center gap-2 mt-1">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-lg bg-sky-500 text-white font-black text-xs shadow">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 italic">None selected yet</span>
                )}
                <span className="text-xs text-zinc-400">
                  ({selectedSeats.length} of {requiredSeatsCount} selected)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                disabled={selectedSeats.length !== requiredSeatsCount}
                onClick={() => {
                  if (selectedSeats.length !== requiredSeatsCount) {
                    alert(`Please select all ${requiredSeatsCount} required seats.`);
                    return;
                  }
                  refreshPricing();
                  setCurrentStep(5);
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-xs shadow-lg transition-all ${
                  selectedSeats.length === requiredSeatsCount
                    ? 'bg-orange-500 hover:bg-orange-600 text-white glow-orange'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                }`}
              >
                <span>Review & Pay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & PAY ₹1,000 RESERVATION */}
      {currentStep === 5 && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Booking Review & Payment</h2>
            <p className="text-xs text-zinc-400">
              Verify your booking details and confirm with ₹1,000 reservation deposit.
            </p>
          </div>

          {paymentError && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-600/50 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{paymentError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trip & Traveller Summary */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm border-b border-zinc-800 pb-2">
                Expedition Summary
              </h3>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Trip:</span>
                <span className="font-semibold text-white">GLA Himalayan Escape (6D/5N)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Route:</span>
                <span className="font-semibold text-white">Mathura → Manali → Kasol → Mathura</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Package:</span>
                <span className="font-bold text-emerald-400">{packageType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Seats Reserved:</span>
                <span className="font-bold text-sky-400">{selectedSeats.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Primary Contact:</span>
                <span className="font-semibold text-white">{travellers[0]?.fullName} ({travellers[0]?.phone})</span>
              </div>
            </div>

            {/* Transparent Server-Calculated Price Breakdown */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm border-b border-zinc-800 pb-2 flex items-center justify-between">
                <span>Price Breakdown</span>
                <span className="text-[10px] text-zinc-500 font-normal">Server-Calculated</span>
              </h3>

              {pricing && (
                <>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Package Base Price:</span>
                    <span className="font-semibold text-white">₹{pricing.baseAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {pricing.groupDiscountAmount > 0 && (
                    <div className="flex justify-between py-1 text-amber-400">
                      <span>5+1 Group Offer Discount:</span>
                      <span className="font-bold">-₹{pricing.groupDiscountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {pricing.referralDiscountAmount > 0 && (
                    <div className="flex justify-between py-1 text-emerald-400">
                      <span>Referral Discount ({pricing.referralDiscountPercent}%):</span>
                      <span className="font-bold">-₹{pricing.referralDiscountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1.5 border-t border-zinc-800 font-bold text-white">
                    <span>Total Expedition Price:</span>
                    <span className="text-sm">₹{pricing.finalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-600/30 flex justify-between items-center text-sm font-bold text-orange-400">
                    <span>Reservation Deposit Payable Now:</span>
                    <span className="text-base text-white font-black">₹{pricing.reservationAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between py-1 text-zinc-400 text-[11px]">
                    <span>Remaining Balance (Due before departure):</span>
                    <span className="font-semibold text-zinc-300">₹{pricing.remainingBalance.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-zinc-700 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="terms" className="text-xs text-zinc-400 leading-relaxed cursor-pointer">
              I agree to the <a href="/terms" target="_blank" className="text-orange-400 underline">Terms & Conditions</a>, <a href="/cancellation-policy" target="_blank" className="text-orange-400 underline">Cancellation Policy</a>, and understand that itinerary activities to Atal Tunnel / Sissu are weather and road condition dependent.
            </label>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(4)}
              disabled={isProcessingPayment}
              className="px-6 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={handlePayReservation}
              disabled={isProcessingPayment || !termsAccepted}
              className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all ${
                termsAccepted && !isProcessingPayment
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white glow-orange hover:scale-105'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>PAY ₹1,000 RESERVATION</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: BOOKING CONFIRMED & DIGITAL QR TICKET */}
      {currentStep === 6 && confirmedBooking && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-emerald-500/30 space-y-8 animate-in fade-in duration-500">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg glow-emerald">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              You&apos;re Going to the Mountains!
            </h2>
            <p className="text-sm text-zinc-300">
              Booking Confirmed • Seats Locked • QR Ticket Issued
            </p>
          </div>

          {/* Ticket Card Preview */}
          <div className="max-w-xl mx-auto rounded-3xl bg-zinc-950 border-2 border-emerald-600/40 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                  OFFICIAL BOARDING PASS
                </span>
                <h3 className="text-lg font-black text-white">GLA HIMALAYAN ESCAPE</h3>
                <p className="text-xs text-zinc-400">MANALI × KASOL • 6 DAYS / 5 NIGHTS</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Booking ID</span>
                <p className="text-base font-mono font-black text-emerald-400">{confirmedBooking.bookingId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-zinc-500">Traveller</span>
                <p className="font-bold text-white truncate">{confirmedBooking.primaryTravellerName}</p>
              </div>
              <div>
                <span className="text-zinc-500">Coach</span>
                <p className="font-bold text-white">{confirmedBooking.bus?.busNumber || 'Bus 01'}</p>
              </div>
              <div>
                <span className="text-zinc-500">Seat(s)</span>
                <p className="font-bold text-sky-400">
                  {confirmedBooking.travellers?.map((t: any) => t.assignedSeatNumber).join(', ')}
                </p>
              </div>
              <div>
                <span className="text-zinc-500">Deposit Paid</span>
                <p className="font-bold text-emerald-400">₹{confirmedBooking.reservationAmount}</p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-6 rounded-2xl bg-white text-zinc-950 flex flex-col items-center justify-center space-y-2">
              {confirmedBooking.tickets?.[0]?.qrToken ? (
                <div className="space-y-2 text-center">
                  <div className="w-48 h-48 mx-auto bg-zinc-100 flex items-center justify-center rounded-xl p-2 border">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${confirmedBooking.tickets[0].qrToken}`
                      )}`}
                      alt="Digital Ticket QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-zinc-700">
                    {confirmedBooking.tickets[0].qrToken}
                  </span>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    Present this secure QR at GLA University Mathura boarding gate
                  </p>
                </div>
              ) : (
                <div className="p-4 text-xs font-semibold text-zinc-600">Generating QR...</div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs text-zinc-400">
              <span>Remaining Balance: ₹{confirmedBooking.remainingBalance?.toLocaleString('en-IN')}</span>
              <span className="text-emerald-400 font-bold">STATUS: CONFIRMED</span>
            </div>
          </div>

          {/* Referral Code Share Box */}
          {newReferralCode && (
            <div className="max-w-xl mx-auto p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Share Your Referral Code & Earn Rewards
              </span>
              <p className="text-zinc-300">
                Give your referral code to fellow GLA students. Each friend who reserves gives you an additional 5% discount (up to 10% total)!
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono text-base font-bold text-amber-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-amber-500/40">
                  {newReferralCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newReferralCode);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold flex items-center gap-1 hover:bg-amber-400"
                >
                  {copiedRef ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRef ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => window.print()}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700"
            >
              <Download className="w-4 h-4" />
              <span>Print / Download Ticket</span>
            </button>

            <button
              onClick={() => router.push(`/my-booking?id=${confirmedBooking.bookingId}`)}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg"
            >
              <Ticket className="w-4 h-4" />
              <span>View My Booking</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-zinc-400">
              Need assistance? Call coordinator at <a href={`tel:${CONTACT_INFO.coordinatorPhone1}`} className="text-emerald-400 font-bold">{CONTACT_INFO.coordinatorPhone1}</a> or WhatsApp at <a href={`https://wa.me/${CONTACT_INFO.whatsapp1}`} className="text-green-400 font-bold">{CONTACT_INFO.coordinatorPhone1}</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
