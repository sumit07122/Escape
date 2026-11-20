'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import {
  User, CheckCircle2, ArrowRight,
  Loader2, AlertCircle, UserCheck, Sparkles, ShieldCheck,
  ChevronDown, ChevronUp, Users, Bus, Clock
} from 'lucide-react';
import BusSeatMap from './BusSeatMap';
import GoogleContactsImportModal from '@/components/booking/GoogleContactsImportModal';
import { SittingPreference, TravellerInput, BookingPricing } from '@/types';
import { TripConfigData, DEFAULT_TRIP_CONFIG } from '@/lib/trip-config-shared';
import SeatHoldTimer from './SeatHoldTimer';

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

interface BookingFlowProps {
  initialConfig?: TripConfigData;
}

export default function BookingFlow({ initialConfig }: BookingFlowProps) {
  const config = initialConfig || DEFAULT_TRIP_CONFIG;
  const packagePrice = Number(config.packagePrice) || 6200;
  const depositPerHead = Number(config.depositPrice) || 1000;

  // 3 Step High-Converting Flow:
  // 1: Travellers & Instant Pricing
  // 2: Passenger Details (with streamlined shared emergency contact)
  // 3: Smart Seat Allocation & Review/Pay
  // 4: Confirmation & Boarding Pass
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [bookingSessionId, setBookingSessionId] = useState<string>('');

  // Authentication State
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Step 1: Travellers Count
  const [travellersCount, setTravellersCount] = useState<number>(1);

  // Step 2: Passenger Details
  const [travellers, setTravellers] = useState<TravellerInput[]>([
    { fullName: '', phone: '', email: '', gender: 'Male', collegeId: '', emergencyContactName: '', emergencyContactPhone: '' },
  ]);
  const [useSameEmergencyForAll, setUseSameEmergencyForAll] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 3: Smart Seat Allocation
  const [sittingPreference, setSittingPreference] = useState<SittingPreference>('NO_PREFERENCE');
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [selectedBusName, setSelectedBusName] = useState<string>('Coach 01 (Himalayan Eagle)');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isAutoAssigningSeats, setIsAutoAssigningSeats] = useState(false);
  const [isSeatMapExpanded, setIsSeatMapExpanded] = useState(false);
  const [seatHoldTimerSeconds, setSeatHoldTimerSeconds] = useState<number>(0);
  const [squadFriendSeats, setSquadFriendSeats] = useState<string[]>([]);
  const [squadLinkNotice, setSquadLinkNotice] = useState<string | null>(null);

  // Pricing & Payment: Canonical Flat ₹6,200 per traveller, ₹1,000 deposit, ₹5,200 balance
  const [pricing, setPricing] = useState<BookingPricing>(() => {
    const rate = 6200;
    return {
      travellersCount: 1,
      baseAmount: rate,
      totalAmount: rate,
      pricePerTraveller: rate,
      reservationAmountPerTraveller: 1000,
      reservationAmount: 1000,
      remainingBalance: 5200,
      finalAmount: rate,
      discountAmount: 0,
      isGroupRate: false,
      groupThreshold: 1,
      groupPackagePrice: 6200,
      standardPackagePrice: 6200,
      savingsPerTraveller: 0,
    };
  });

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Step 4: Confirmed Booking Details
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Google Contacts State (strictly in-memory)
  const [googleContactsToken, setGoogleContactsToken] = useState<string | null>(null);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [contactsTarget, setContactsTarget] = useState<{ type: 'traveller' | 'emergency'; index: number } | null>(null);
  const [contactsFeedback, setContactsFeedback] = useState<string | null>(null);

  const openGoogleContactsModal = (target: { type: 'traveller' | 'emergency'; index: number }) => {
    setContactsTarget(target);
    setIsContactsModalOpen(true);
  };

  const handleContactSelected = (contact: { name: string; phone: string; email: string }) => {
    if (!contactsTarget) return;

    setTravellers((prev) => {
      const updated = [...prev];
      const targetTraveller = updated[contactsTarget.index];
      if (!targetTraveller) return prev;

      if (contactsTarget.type === 'traveller') {
        if (contact.name) targetTraveller.fullName = contact.name;
        if (contact.phone) targetTraveller.phone = contact.phone;
        if (contactsTarget.index === 0 && contact.email) {
          targetTraveller.email = contact.email;
        }
      } else if (contactsTarget.type === 'emergency') {
        if (contact.name) targetTraveller.emergencyContactName = contact.name;
        if (contact.phone) targetTraveller.emergencyContactPhone = contact.phone;
      }

      return updated;
    });

    setContactsFeedback(`Autofilled details from Google Contact: ${contact.name}. You may review and edit before proceeding.`);
    setTimeout(() => setContactsFeedback(null), 6000);
  };

  // Restore coach/seats shared by a squad friend from URL query
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
        setIsCheckingAuth(true);
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
                if (data.user.phone) {
                  updated[0].phone = updated[0].phone || data.user.phone;
                }
              }
              return updated;
            });
          }
        }
      } catch {
        // Continue gracefully as guest
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Instant Client Pricing calculation with Student Offers:
  // Solo: ₹6,200 (Deposit ₹1,000, Gate Balance ₹5,200)
  // Duo Explorer (2): ₹5,999/head (Save ₹402 per duo, Deposit ₹1,000/head)
  // Squad Cabin (3+): ₹5,800/head (Save ₹400/head, Deposit ₹1,000/head)
  const updatePricing = useCallback((count: number, couponDiscount = 0, couponCode: string | null = null) => {
    const singleRate = Number(config.packagePrice) || 6200;
    const duoRate = Number(config.duoPackagePrice) || 5999;
    const squadRate = Number(config.groupPackagePrice) || 5800;
    const depositPerHead = Number(config.depositPrice) || 1000;

    let rate = singleRate;
    let isGroupOffer = false;
    let savingsPerHead = 0;

    if (count === 2) {
      rate = duoRate;
      isGroupOffer = true;
      savingsPerHead = Math.max(0, singleRate - duoRate);
    } else if (count >= 3) {
      rate = squadRate;
      isGroupOffer = true;
      savingsPerHead = Math.max(0, singleRate - squadRate);
    }

    const rawTotal = count * rate;
    const depositTotal = count * depositPerHead;
    const finalTotal = Math.max(0, rawTotal - couponDiscount);
    const balanceDue = Math.max(0, finalTotal - depositTotal);

    setPricing({
      travellersCount: count,
      baseAmount: rawTotal,
      totalAmount: finalTotal,
      pricePerTraveller: rate,
      reservationAmountPerTraveller: depositPerHead,
      reservationAmount: depositTotal,
      remainingBalance: balanceDue,
      finalAmount: finalTotal,
      discountAmount: couponDiscount + (count * savingsPerHead),
      isGroupRate: isGroupOffer,
      groupThreshold: 3,
      groupPackagePrice: squadRate,
      standardPackagePrice: singleRate,
      savingsPerTraveller: savingsPerHead,
      couponCode: couponCode || undefined,
      couponDiscount,
    });
  }, [config]);

  // Adjust travellers array instantly when count changes
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
          emergencyContactName: '',
          emergencyContactPhone: '',
        });
      }
      return updated.slice(0, travellersCount);
    });

    if (selectedSeats.length > travellersCount) {
      setSelectedSeats([]);
    }

    updatePricing(travellersCount);
  }, [travellersCount, updatePricing, selectedSeats.length]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponMessage(null);
    try {
      const res = await fetch(`/api/pricing/calculate?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travellersCount, couponCode: couponInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pricing) {
          setPricing(data.pricing);
          if (data.pricing.couponDiscount > 0) {
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
      setCouponMessage({ type: 'error', text: 'Could not verify coupon right now.' });
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Auto-allocate best adjacent seats when entering Step 3
  const triggerAutoSeatAssignment = useCallback(async (pref = sittingPreference) => {
    if (!bookingSessionId) return;
    setIsAutoAssigningSeats(true);
    try {
      const res = await fetch('/api/seats/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingSessionId,
          count: travellersCount,
          busId: selectedBusId || undefined,
          preference: pref,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.seatNumbers && data.seatNumbers.length > 0) {
          setSelectedSeats(data.seatNumbers);
          setSelectedBusId(data.busId);
          setSelectedBusName(`${data.busNumber} (${data.vehicleName || 'Coach'})`);
          setSeatHoldTimerSeconds(data.heldSecondsRemaining || 600);
        }
      }
    } catch (err) {
      console.warn('Auto seat allocation fallback:', err);
    } finally {
      setIsAutoAssigningSeats(false);
    }
  }, [bookingSessionId, travellersCount, selectedBusId, sittingPreference]);

  // Validation for Step 2
  const validateTravellerDetails = () => {
    const errors: Record<string, string> = {};
    const primary = travellers[0];

    if (!primary.fullName.trim()) {
      errors['name_0'] = 'Full legal name is required';
    }
    if (!primary.phone.trim() || primary.phone.replace(/\D/g, '').length < 10) {
      errors['phone_0'] = 'Valid 10-digit phone number is required';
    }
    if (!primary.email.trim() || !primary.email.includes('@')) {
      errors['email_0'] = 'Valid email is required to receive QR ticket';
    }

    const primaryEmergencyName = primary.emergencyContactName?.trim();
    const primaryEmergencyPhone = primary.emergencyContactPhone?.trim();

    if (!primaryEmergencyName) {
      errors['em_name_0'] = 'Emergency contact name is required';
    }
    if (!primaryEmergencyPhone || primaryEmergencyPhone.replace(/\D/g, '').length < 10) {
      errors['em_phone_0'] = 'Valid 10-digit emergency contact phone is required';
    }

    for (let i = 1; i < travellers.length; i++) {
      const t = travellers[i];
      if (!t.fullName.trim()) {
        errors[`name_${i}`] = `Full name is required for Traveller #${i + 1}`;
      }
      if (!t.phone.trim() || t.phone.replace(/\D/g, '').length < 10) {
        errors[`phone_${i}`] = `10-digit phone is required for Traveller #${i + 1}`;
      }
      if (!useSameEmergencyForAll) {
        if (!t.emergencyContactName?.trim()) {
          errors[`em_name_${i}`] = `Emergency contact name required for #${i + 1}`;
        }
        if (!t.emergencyContactPhone?.trim() || t.emergencyContactPhone.replace(/\D/g, '').length < 10) {
          errors[`em_phone_${i}`] = `10-digit emergency phone required for #${i + 1}`;
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToStep3 = () => {
    if (!validateTravellerDetails()) {
      // Scroll to first error smoothly
      const firstErrorEl = document.querySelector('[data-error="true"]');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Propagate shared emergency contact to additional travellers if checked
    if (useSameEmergencyForAll) {
      const primary = travellers[0];
      setTravellers((prev) =>
        prev.map((t, idx) =>
          idx === 0
            ? t
            : {
                ...t,
                emergencyContactName: primary.emergencyContactName,
                emergencyContactPhone: primary.emergencyContactPhone,
              }
        )
      );
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-allocate seats immediately if none selected yet
    if (selectedSeats.length !== travellersCount) {
      triggerAutoSeatAssignment();
    }
  };

  const handleSeatSelectFromMap = (busId: string, seatNumbers: string[]) => {
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
      setSquadLinkNotice('Could not copy automatically. Please copy the browser URL.');
    }
  };

  const handleProceedToPayment = async () => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const primary = travellers[0];
      // Normalize emergency contacts across all travellers
      const normalizedTravellers = travellers.map((t) => ({
        ...t,
        emergencyContactName: t.emergencyContactName?.trim() || primary.emergencyContactName?.trim(),
        emergencyContactPhone: t.emergencyContactPhone?.trim() || primary.emergencyContactPhone?.trim(),
      }));

      const payload = {
        travellers: normalizedTravellers,
        sittingPreference,
        busId: selectedBusId || undefined,
        selectedSeats: selectedSeats.length === travellersCount ? selectedSeats : undefined,
        bookingSessionId,
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
              setPaymentError('Payment window was closed. Your seats remain reserved for 10 minutes.');
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
      setCurrentStep(4);

      if (typeof window.confetti === 'function') {
        window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setPaymentError(msg);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const stepsList = [
    { num: 1, label: '01 Travellers' },
    { num: 2, label: '02 Details' },
    { num: 3, label: '03 Review & Pay' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-8 space-y-6 bg-[#F7F5EF] text-[#171918] pb-28 sm:pb-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="lazyOnload" />

      {/* Progress Header */}
      {currentStep !== 4 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8D2C4] space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2 border-b border-[#E7E2D8] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D87945]">
                RESERVATION PORTAL
              </span>
              <h1 className="text-lg sm:text-xl font-black text-[#171918] leading-tight">
                {currentStep === 1 && 'Select Travellers & Pricing'}
                {currentStep === 2 && 'Passenger Contact Details'}
                {currentStep === 3 && 'Seat Allocation & Payment'}
              </h1>
            </div>
            {userSession && (
              <div className="flex items-center gap-1.5 text-xs text-[#646864]">
                <User className="w-3.5 h-3.5 text-[#163C32]" />
                <span className="font-semibold text-[#171918]">{userSession.name?.split(' ')[0]}</span>
              </div>
            )}
          </div>

          {/* Clean 3-Step Progress Bar */}
          <div className="flex items-center justify-between gap-1.5 text-xs">
            {stepsList.map((s) => {
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center font-bold transition-all text-[11px] sm:text-xs ${
                    isActive
                      ? 'bg-[#163C32] text-white shadow-xs'
                      : isPast
                      ? 'bg-[#E7E2D8] text-[#163C32]'
                      : 'bg-[#F7F5EF] text-[#B4AA96]'
                  }`}
                >
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 1: SELECT TRAVELLERS & INSTANT PRICING             */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] space-y-6 text-center shadow-xs animate-in fade-in duration-200">
          <div className="max-w-md mx-auto space-y-1.5">
            <span className="text-[11px] font-bold text-[#D87945] uppercase tracking-widest">
              STEP 01 • PASSENGER COUNT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171918]">
              How many are travelling?
            </h2>
            <p className="text-xs text-[#646864]">
              Select the number of seats to reserve together. Pricing updates instantly below.
            </p>
          </div>

          {/* Stepper & Offer Selection */}
          <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-4">
            {/* Quick Group Presets */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTravellersCount(1)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  travellersCount === 1
                    ? 'bg-[#163C32] text-white border-[#163C32] shadow-sm'
                    : 'bg-white text-[#171918] border-[#D8D2C4] hover:bg-stone-50'
                }`}
              >
                <span className="block text-[11px] font-medium uppercase tracking-wider text-inherit/80">Solo</span>
                <span className="text-xs font-bold tabular-nums">₹6,200</span>
              </button>
              <button
                type="button"
                onClick={() => setTravellersCount(2)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border relative ${
                  travellersCount === 2
                    ? 'bg-[#163C32] text-white border-[#163C32] shadow-sm'
                    : 'bg-white text-[#171918] border-[#D8D2C4] hover:bg-stone-50'
                }`}
              >
                <span className="absolute -top-2 right-1.5 px-1.5 py-0.5 rounded-full bg-[#D87945] text-white text-[8px] font-bold uppercase tracking-wider shadow-xs">
                  Save ₹402
                </span>
                <span className="block text-[11px] font-medium uppercase tracking-wider text-inherit/80">Duo (2)</span>
                <span className="text-xs font-bold tabular-nums">₹5,999<span className="text-[10px] font-normal opacity-80">/head</span></span>
              </button>
              <button
                type="button"
                onClick={() => setTravellersCount(3)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border relative ${
                  travellersCount >= 3
                    ? 'bg-[#163C32] text-white border-[#163C32] shadow-sm'
                    : 'bg-white text-[#171918] border-[#D8D2C4] hover:bg-stone-50'
                }`}
              >
                <span className="absolute -top-2 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[8px] font-bold uppercase tracking-wider shadow-xs">
                  Best Value
                </span>
                <span className="block text-[11px] font-medium uppercase tracking-wider text-inherit/80">Squad (3+)</span>
                <span className="text-xs font-bold tabular-nums">₹5,800<span className="text-[10px] font-normal opacity-80">/head</span></span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={travellersCount <= 1}
                onClick={() => setTravellersCount((prev) => Math.max(1, prev - 1))}
                className="w-12 h-12 rounded-xl bg-white border border-[#D8D2C4] text-xl font-bold text-[#171918] hover:bg-[#E7E2D8] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
                aria-label="Decrease travellers count"
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
                aria-label="Increase travellers count"
              >
                +
              </button>
            </div>

            {/* Flat Rate / Offer Badge - Premium Alpine Highlight */}
            <div className="pt-2">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/[0.04] via-emerald-900/[0.02] to-amber-900/[0.03] border border-emerald-900/15 p-4 text-center space-y-2 backdrop-blur-xs shadow-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/8 text-[#163C32] text-[10px] font-semibold uppercase tracking-widest border border-emerald-900/10">
                  <Sparkles className="w-3 h-3 text-[#D87945]" />
                  <span>5 Days / 4 Nights • All-Inclusive Expedition</span>
                </div>
                <div className="text-sm sm:text-base font-semibold tracking-tight text-[#163C32]">
                  {pricing.isGroupRate ? (
                    <span className="flex flex-col sm:flex-row items-center justify-center gap-1">
                      <span>🎉 Student Offer Applied:</span>
                      <strong className="text-emerald-950 font-bold tabular-nums">
                        ₹{pricing.pricePerTraveller.toLocaleString('en-IN')} / traveller
                      </strong>
                      <span className="text-xs font-medium text-emerald-700">
                        (Saving ₹{(pricing.savingsPerTraveller || 0).toLocaleString('en-IN')} each!)
                      </span>
                    </span>
                  ) : (
                    <span>
                      Single Person: <strong className="text-emerald-950 font-bold tabular-nums">₹6,200</strong> All-Inclusive
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#3a5247] font-normal leading-relaxed">
                  Lock your seat today with only <span className="font-semibold text-[#163C32] bg-[#163C32]/8 px-2 py-0.5 rounded-md border border-[#163C32]/10 tabular-nums">₹1,000 reservation deposit</span> per person
                </p>
              </div>
            </div>

            {/* Transparent Instant Math Table */}
            <div className="pt-3 border-t border-[#D8D2C4] text-xs space-y-2.5">
              <div className="flex justify-between items-center text-[#171918] font-medium">
                <span className="text-[#4b5563]">Total Expedition Price ({travellersCount} {travellersCount === 1 ? 'seat' : 'seats'}):</span>
                <span className="font-bold text-[#171918] text-sm tabular-nums">₹{pricing.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[#163C32] font-semibold text-sm p-3 rounded-xl bg-emerald-950/[0.04] border border-emerald-900/15">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Pay Today to Reserve:</span>
                </div>
                <span className="font-bold text-base text-[#163C32] tabular-nums">₹{pricing.reservationAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[#646864] text-xs px-1">
                <span>Remaining balance at departure gate:</span>
                <span className="font-semibold text-[#171918] tabular-nums">₹{pricing.remainingBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-xs shadow-md transition-all inline-flex items-center justify-center gap-2"
            >
              <span>CONTINUE TO PASSENGER DETAILS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: STREAMLINED PASSENGER DETAILS                   */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#D8D2C4] space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#D87945] uppercase tracking-widest">
              STEP 02 • PASSENGER DETAILS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#171918]">Enter Traveller Information</h2>
            <p className="text-xs text-[#646864]">
              Lead contact receives booking confirmations, updates, and digital QR boarding passes.
            </p>
          </div>

          {/* Quick Autofill / Google Contacts Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#D8D2C4] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-[#171918] block">Google Contacts Quick-Fill</span>
                <span className="text-[11px] text-[#646864]">Import traveller contact details in 1 tap without typing.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openGoogleContactsModal({ type: 'traveller', index: 0 })}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF9F5] border border-[#D8D2C4] hover:border-[#163C32] text-[#171918] font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#D87945]" />
              <span>Import Lead Contact</span>
            </button>
          </div>

          {contactsFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{contactsFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setContactsFeedback(null)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Lead Traveller Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2">
              <span className="text-xs font-black text-[#163C32] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#163C32] text-white flex items-center justify-center text-[10px]">1</span>
                <span>Lead Traveller (Primary Contact)</span>
              </span>
              <span className="text-[10px] font-bold text-[#D87945] uppercase tracking-wider">Receives QR Ticket</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1" data-error={!!fieldErrors['name_0']}>
                <label className="font-bold text-[#171918]">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Rahul Sharma"
                  value={travellers[0].fullName}
                  onChange={(e) => {
                    const updated = [...travellers];
                    updated[0].fullName = e.target.value;
                    setTravellers(updated);
                    if (fieldErrors['name_0']) setFieldErrors((prev) => ({ ...prev, name_0: '' }));
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl bg-white border ${
                    fieldErrors['name_0'] ? 'border-red-500' : 'border-[#D8D2C4]'
                  } text-xs text-[#171918] focus:border-[#163C32] focus:outline-none`}
                />
                {fieldErrors['name_0'] && <p className="text-[10px] text-red-600 font-medium">{fieldErrors['name_0']}</p>}
              </div>

              <div className="space-y-1" data-error={!!fieldErrors['phone_0']}>
                <label className="font-bold text-[#171918]">Mobile Phone (WhatsApp) *</label>
                <input
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                  value={travellers[0].phone}
                  onChange={(e) => {
                    const updated = [...travellers];
                    updated[0].phone = e.target.value;
                    setTravellers(updated);
                    if (fieldErrors['phone_0']) setFieldErrors((prev) => ({ ...prev, phone_0: '' }));
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl bg-white border ${
                    fieldErrors['phone_0'] ? 'border-red-500' : 'border-[#D8D2C4]'
                  } text-xs text-[#171918] focus:border-[#163C32] focus:outline-none`}
                />
                {fieldErrors['phone_0'] && <p className="text-[10px] text-red-600 font-medium">{fieldErrors['phone_0']}</p>}
              </div>

              <div className="space-y-1" data-error={!!fieldErrors['email_0']}>
                <label className="font-bold text-[#171918]">Email Address *</label>
                <input
                  type="email"
                  inputMode="email"
                  required
                  autoComplete="email"
                  placeholder="For digital boarding pass"
                  value={travellers[0].email}
                  onChange={(e) => {
                    const updated = [...travellers];
                    updated[0].email = e.target.value;
                    setTravellers(updated);
                    if (fieldErrors['email_0']) setFieldErrors((prev) => ({ ...prev, email_0: '' }));
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl bg-white border ${
                    fieldErrors['email_0'] ? 'border-red-500' : 'border-[#D8D2C4]'
                  } text-xs text-[#171918] focus:border-[#163C32] focus:outline-none`}
                />
                {fieldErrors['email_0'] && <p className="text-[10px] text-red-600 font-medium">{fieldErrors['email_0']}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171918]">Gender</label>
                <select
                  value={travellers[0].gender}
                  onChange={(e) => {
                    const updated = [...travellers];
                    updated[0].gender = e.target.value as 'Male' | 'Female' | 'Other';
                    setTravellers(updated);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <label className="font-bold text-[#171918]">Student ID / College Roll No (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 2115000123"
                  value={travellers[0].collegeId || ''}
                  onChange={(e) => {
                    const updated = [...travellers];
                    updated[0].collegeId = e.target.value;
                    setTravellers(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                />
              </div>

              {/* Lead Emergency Contact */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#163C32] text-xs">Emergency Contact (Parent / Guardian) *</label>
                  <button
                    type="button"
                    onClick={() => openGoogleContactsModal({ type: 'emergency', index: 0 })}
                    className="text-[10px] font-bold text-[#D87945] hover:underline"
                  >
                    Import Contact
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div data-error={!!fieldErrors['em_name_0']}>
                    <input
                      type="text"
                      required
                      placeholder="Contact Name"
                      value={travellers[0].emergencyContactName || ''}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[0].emergencyContactName = e.target.value;
                        setTravellers(updated);
                        if (fieldErrors['em_name_0']) setFieldErrors((prev) => ({ ...prev, em_name_0: '' }));
                      }}
                      className={`w-full px-3 py-2 rounded-xl bg-white border ${
                        fieldErrors['em_name_0'] ? 'border-red-500' : 'border-[#D8D2C4]'
                      } text-xs text-[#171918] focus:border-[#163C32] focus:outline-none`}
                    />
                  </div>
                  <div data-error={!!fieldErrors['em_phone_0']}>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="10-digit Phone"
                      value={travellers[0].emergencyContactPhone || ''}
                      onChange={(e) => {
                        const updated = [...travellers];
                        updated[0].emergencyContactPhone = e.target.value;
                        setTravellers(updated);
                        if (fieldErrors['em_phone_0']) setFieldErrors((prev) => ({ ...prev, em_phone_0: '' }));
                      }}
                      className={`w-full px-3 py-2 rounded-xl bg-white border ${
                        fieldErrors['em_phone_0'] ? 'border-red-500' : 'border-[#D8D2C4]'
                      } text-xs text-[#171918] focus:border-[#163C32] focus:outline-none`}
                    />
                  </div>
                </div>
                {(fieldErrors['em_name_0'] || fieldErrors['em_phone_0']) && (
                  <p className="text-[10px] text-red-600 font-medium">Valid emergency contact name and phone required.</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Travellers (if count > 1) */}
          {travellers.length > 1 && (
            <div className="space-y-4">
              {/* Single Shared Emergency Toggle */}
              <div className="p-3 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#171918]">
                  <input
                    type="checkbox"
                    checked={useSameEmergencyForAll}
                    onChange={(e) => setUseSameEmergencyForAll(e.target.checked)}
                    className="w-4 h-4 rounded text-[#163C32] focus:ring-[#163C32] border-[#D8D2C4]"
                  />
                  <span>Use Lead Traveller's emergency contact for all travellers</span>
                </label>
                <span className="text-[11px] text-[#646864] hidden sm:inline">Streamlined registration</span>
              </div>

              {travellers.slice(1).map((traveller, index) => {
                const idx = index + 1;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                      <span className="text-xs font-bold text-[#163C32] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#E7E2D8] text-[#163C32] flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>Traveller #{idx + 1}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => openGoogleContactsModal({ type: 'traveller', index: idx })}
                        className="text-[11px] font-bold text-[#D87945] hover:underline inline-flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Autofill</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="space-y-1" data-error={!!fieldErrors[`name_${idx}`]}>
                        <label className="font-bold text-[#171918]">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Passenger Name"
                          value={traveller.fullName}
                          onChange={(e) => {
                            const updated = [...travellers];
                            updated[idx].fullName = e.target.value;
                            setTravellers(updated);
                            if (fieldErrors[`name_${idx}`]) setFieldErrors((prev) => ({ ...prev, [`name_${idx}`]: '' }));
                          }}
                          className={`w-full px-3 py-2 rounded-xl bg-white border ${
                            fieldErrors[`name_${idx}`] ? 'border-red-500' : 'border-[#D8D2C4]'
                          } text-xs text-[#171918] focus:border-[#163C32] focus:outline-none`}
                        />
                      </div>

                      <div className="space-y-1" data-error={!!fieldErrors[`phone_${idx}`]}>
                        <label className="font-bold text-[#171918]">Mobile Phone *</label>
                        <input
                          type="tel"
                          inputMode="tel"
                          required
                          placeholder="10-digit mobile"
                          value={traveller.phone}
                          onChange={(e) => {
                            const updated = [...travellers];
                            updated[idx].phone = e.target.value;
                            setTravellers(updated);
                            if (fieldErrors[`phone_${idx}`]) setFieldErrors((prev) => ({ ...prev, [`phone_${idx}`]: '' }));
                          }}
                          className={`w-full px-3 py-2 rounded-xl bg-white border ${
                            fieldErrors[`phone_${idx}`] ? 'border-red-500' : 'border-[#D8D2C4]'
                          } text-xs text-[#171918] focus:border-[#163C32] focus:outline-none`}
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

                    {!useSameEmergencyForAll && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#D8D2C4]">
                        <div className="space-y-1" data-error={!!fieldErrors[`em_name_${idx}`]}>
                          <label className="font-bold text-[#171918]">Emergency Contact Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contact Name"
                            value={traveller.emergencyContactName || ''}
                            onChange={(e) => {
                              const updated = [...travellers];
                              updated[idx].emergencyContactName = e.target.value;
                              setTravellers(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs"
                          />
                        </div>
                        <div className="space-y-1" data-error={!!fieldErrors[`em_phone_${idx}`]}>
                          <label className="font-bold text-[#171918]">Emergency Contact Phone *</label>
                          <input
                            type="tel"
                            inputMode="tel"
                            required
                            placeholder="10-digit Phone"
                            value={traveller.emergencyContactPhone || ''}
                            onChange={(e) => {
                              const updated = [...travellers];
                              updated[idx].emergencyContactPhone = e.target.value;
                              setTravellers(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#E7E2D8]">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs font-bold text-[#171918] hover:bg-[#E7E2D8]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleProceedToStep3}
              className="px-7 py-3 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <span>CONTINUE TO SEATS & REVIEW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <GoogleContactsImportModal
            isOpen={isContactsModalOpen}
            onClose={() => setIsContactsModalOpen(false)}
            onSelectContact={handleContactSelected}
            targetLabel={
              contactsTarget
                ? contactsTarget.type === 'traveller'
                  ? contactsTarget.index === 0
                    ? 'Lead Traveller'
                    : `Traveller #${contactsTarget.index + 1}`
                  : `Emergency Contact for Traveller #${contactsTarget.index + 1}`
                : 'Traveller Details'
            }
            inMemoryAccessToken={googleContactsToken}
            onTokenChange={setGoogleContactsToken}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: SMART SEAT ALLOCATION & REVIEW / PAY            */}
      {/* ======================================================== */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#D8D2C4] space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#D87945] uppercase tracking-widest">
              STEP 03 • FINAL REVIEW & PAYMENT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#171918]">Confirm Reservation</h2>
            <p className="text-xs text-[#646864]">
              Transparent summary. Seats are held atomically for 10 minutes.
            </p>
          </div>

          {/* Smart Seat Allocation Status Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8D2C4] pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Bus className="w-4 h-4 text-[#163C32]" />
                  <span className="text-xs font-black text-[#163C32] uppercase tracking-wider">
                    {selectedBusName}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#171918] mt-0.5">
                  Assigned Seats: {isAutoAssigningSeats ? (
                    <span className="text-amber-800 font-normal">Allocating best adjacent seats...</span>
                  ) : selectedSeats.length > 0 ? (
                    <span className="text-[#163C32] font-semibold text-sm tabular-nums tracking-wide">{selectedSeats.join(', ')}</span>
                  ) : (
                    <span className="text-stone-500 font-normal">None selected</span>
                  )}
                </div>
              </div>

              {seatHoldTimerSeconds > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-950 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-800" />
                  <span>Held for: {Math.floor(seatHoldTimerSeconds / 60)}:{(seatHoldTimerSeconds % 60).toString().padStart(2, '0')}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-[#646864] text-[11px]">
                {selectedSeats.length > 1
                  ? '✨ Best adjacent seats clustered together automatically.'
                  : '✨ Prime coach seat allocated automatically.'}
              </span>
              <button
                type="button"
                onClick={() => setIsSeatMapExpanded(!isSeatMapExpanded)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#163C32] hover:text-[#D87945] underline transition-colors"
              >
                <span>{isSeatMapExpanded ? 'Hide Coach Map' : 'Change Seats on Bus Map'}</span>
                {isSeatMapExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Optional Collapsible Bus Seat Map */}
            {isSeatMapExpanded && (
              <div className="pt-3 border-t border-[#D8D2C4] animate-in fade-in duration-200">
                <BusSeatMap
                  requiredSeatsCount={travellersCount}
                  selectedSeats={selectedSeats}
                  selectedBusId={selectedBusId}
                  onSeatSelect={handleSeatSelectFromMap}
                  bookingSessionId={bookingSessionId}
                  preference={sittingPreference}
                  squadFriendSeats={squadFriendSeats}
                />
              </div>
            )}
          </div>

          {/* Expedition Summary Breakdown Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-3.5 text-xs">
            <div className="border-b border-[#D8D2C4] pb-2.5">
              <span className="text-[10px] font-bold text-[#646864] uppercase tracking-wider block">EXPEDITION</span>
              <p className="text-sm font-black text-[#171918]">Mathura → Manali → Kasol → Mathura</p>
              <p className="text-[11px] text-[#646864]">5 Days / 4 Nights • Luxury AC Tourist Coach</p>
            </div>

            <div className="grid grid-cols-2 gap-2 border-b border-[#D8D2C4] pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-[#646864] uppercase block">TRAVELLERS</span>
                <p className="font-bold text-[#171918]">{travellersCount} Person(s)</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#646864] uppercase block">LEAD CONTACT</span>
                <p className="font-bold text-[#171918] truncate">{travellers[0].fullName || 'Primary Traveller'}</p>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-1 pb-1 border-b border-[#D8D2C4] space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Promo Code (e.g. SQUAD5)"
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#D8D2C4] text-xs font-semibold text-[#171918] uppercase tracking-wider placeholder:normal-case placeholder:font-normal focus:border-[#D87945] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={applyingCoupon || !couponInput.trim()}
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-xl bg-[#163C32] hover:bg-[#112F27] text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {applyingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {couponMessage && (
                <p className={`text-[11px] font-semibold ${couponMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Financial Calculation */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[#646864]">
                <span>Total Package Price:</span>
                <span className="font-bold text-[#171918] tabular-nums">₹{pricing.baseAmount.toLocaleString('en-IN')}</span>
              </div>

              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Discount ({pricing.couponCode}):</span>
                  <span className="tabular-nums font-semibold">−₹{pricing.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-[#D87945] font-bold text-sm pt-1 border-t border-[#D8D2C4]">
                <span>Reservation Deposit Due Today:</span>
                <span className="text-base font-bold tabular-nums">₹{pricing.reservationAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#646864] text-[11px]">
                <span>Remaining Balance Before Boarding:</span>
                <span className="text-[#171918] font-semibold tabular-nums">₹{pricing.remainingBalance.toLocaleString('en-IN')}</span>
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
              disabled={isProcessingPayment || (selectedSeats.length > 0 && selectedSeats.length !== travellersCount)}
              onClick={handleProceedToPayment}
              className="w-full py-3.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] disabled:opacity-50 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-2"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Securing Order with Razorpay...</span>
                </>
              ) : (
                <span>PAY RESERVATION DEPOSIT · ₹{pricing.reservationAmount.toLocaleString('en-IN')}</span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E7E2D8]">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs font-bold text-[#171918] hover:bg-[#E7E2D8]"
            >
              Back to Details
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: CONFIRMATION & DIGITAL BOARDING PASS             */}
      {/* ======================================================== */}
      {currentStep === 4 && confirmedBooking && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D8D2C4] space-y-6 animate-in fade-in duration-300 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[#163C32]/10 text-[#163C32] flex items-center justify-center mx-auto border border-[#163C32]/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black text-[#163C32] uppercase tracking-widest block">
              BOOKING CONFIRMED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#171918]">
              You're going to the mountains!
            </h2>
            <p className="text-xs text-[#646864]">
              Booking ID: <strong className="font-semibold text-[#171918] tracking-wider">#{confirmedBooking.bookingId}</strong>
            </p>
          </div>

          <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-3 text-xs text-left">
            <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2">
              <div>
                <span className="text-[10px] font-bold text-[#D87945] uppercase tracking-wider block">EXPEDITION</span>
                <span className="font-black text-[#171918] text-sm">HIMALAYAN ESCAPE</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#646864] uppercase block">COACH</span>
                <span className="font-bold text-[#163C32] text-xs">
                  {confirmedBooking.bus?.busNumber || 'Bus 01'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-[#171918]">
              <div className="flex justify-between">
                <span className="text-[#646864]">Primary Traveller:</span>
                <span className="font-bold">{confirmedBooking.primaryTravellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646864]">Confirmed Seats:</span>
                <span className="font-bold text-[#163C32]">
                  {confirmedBooking.travellers?.map((t: any) => t.assignedSeatNumber).filter(Boolean).join(', ') || 'Assigned'}
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

      {/* ======================================================== */}
      {/* MOBILE STICKY BOTTOM ACTION BAR (<640px)                 */}
      {/* ======================================================== */}
      {currentStep !== 4 && (
        <aside
          aria-label="Mobile booking action bar"
          className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#D8D2C4] p-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40 sm:hidden flex items-center justify-between gap-3"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#646864] block">
              {currentStep === 1 ? 'RESERVATION DEPOSIT' : currentStep === 2 ? 'DEPOSIT DUE' : 'TOTAL DUE TODAY'}
            </span>
            <span className="text-base font-bold text-[#D87945] tabular-nums leading-none">
              ₹{pricing.reservationAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#646864] block font-medium">
              for {travellersCount} {travellersCount === 1 ? 'traveller' : 'travellers'}
            </span>
          </div>

          {currentStep === 1 && (
            <button
              type="button"
              onClick={() => {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-[#D87945] active:bg-[#C26735] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={handleProceedToStep3}
              className="px-5 py-2.5 rounded-xl bg-[#D87945] active:bg-[#C26735] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <span>Review & Pay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              disabled={isProcessingPayment || (selectedSeats.length > 0 && selectedSeats.length !== travellersCount)}
              onClick={handleProceedToPayment}
              className="px-5 py-2.5 rounded-xl bg-[#D87945] active:bg-[#C26735] disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              {isProcessingPayment ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Pay ₹{pricing.reservationAmount.toLocaleString('en-IN')}</span>
              )}
            </button>
          )}
        </aside>
      )}
    </div>
  );
}
