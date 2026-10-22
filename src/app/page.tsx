'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mountain, Users, Calendar, MapPin, ArrowRight, ShieldCheck,
  Sparkles, CheckCircle2, Ticket, Bus, Heart, Clock, Phone,
  MessageSquare, AlertTriangle, ChevronRight, Award, Compass
} from 'lucide-react';
import { TRIP_METADATA, PRICING_DEFAULTS, CONTACT_INFO, ITINERARY_DAYS, FAQ_ITEMS } from '@/lib/constants';

export default function HomePage() {
  const [busesData, setBusesData] = useState<any>(null);
  const [loadingBuses, setLoadingBuses] = useState(true);

  useEffect(() => {
    async function fetchBuses() {
      try {
        const res = await fetch('/api/buses');
        if (res.ok) {
          const data = await res.json();
          setBusesData(data);
        }
      } catch (err) {
        console.error('Error fetching buses:', err);
      } finally {
        setLoadingBuses(false);
      }
    }
    fetchBuses();
  }, []);

  const totalBooked = busesData?.trip?.totalBooked || 0;
  const totalCapacity = busesData?.trip?.capacity || 75;
  const totalAvailable = Math.max(0, totalCapacity - totalBooked);
  const bookingPercent = Math.min(100, Math.round((totalBooked / totalCapacity) * 100));

  return (
    <div className="w-full flex flex-col space-y-20 sm:space-y-28">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center pt-8 pb-16 overflow-hidden">
        {/* Mountain Atmosphere Gradients & Backdrops */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-[#08140e] to-[#08140e] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[350px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-8 z-10">
          {/* Top Badge: Origin & Route */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-emerald-500/30 text-xs font-semibold text-emerald-300 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>GLA University Mathura → Manali & Kasol → Return</span>
          </div>

          {/* Cinematic Title & Tagline */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
              GLA HIMALAYAN <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">ESCAPE</span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-lg sm:text-2xl font-black text-orange-400 tracking-wider">
              <span>MANALI</span>
              <span>×</span>
              <span>KASOL</span>
              <span className="text-zinc-600">•</span>
              <span className="text-white">6 DAYS / 5 NIGHTS</span>
            </div>
            <p className="text-base sm:text-xl text-zinc-300 font-medium tracking-wide max-w-2xl mx-auto">
              {TRIP_METADATA.tagline}
            </p>
          </div>

          {/* Pricing Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full">
            <div className="glass-card rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Single Explorer</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">₹6,200</div>
              <span className="text-[10px] text-zinc-500">per person</span>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-orange-500/40 text-center bg-orange-950/20">
              <span className="text-[11px] font-bold text-orange-400 uppercase">Couple Total</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">₹6,500</div>
              <span className="text-[10px] text-zinc-400">total for 2 pax</span>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-emerald-500/40 text-center bg-emerald-950/20">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">Reservation</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">₹1,000</div>
              <span className="text-[10px] text-zinc-400">locks your seat</span>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Capacity</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">75 Seats</div>
              <span className="text-[10px] text-emerald-400 font-semibold">{totalAvailable} remaining</span>
            </div>
          </div>

          {/* Live Availability Bar */}
          <div className="w-full max-w-xl glass-card rounded-2xl p-4 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Trip Capacity:
              </span>
              <span className="text-emerald-400">
                {totalBooked} / {totalCapacity} Booked ({totalAvailable} seats left)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-orange-500 transition-all duration-1000 shadow-sm"
                style={{ width: `${Math.max(5, bookingPercent)}%` }}
              />
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
            <Link
              href="/book"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-base shadow-2xl shadow-orange-950/80 glow-orange transition-all hover:scale-105"
            >
              <span>BOOK YOUR SEAT NOW</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/itinerary"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass-card border border-zinc-700 text-zinc-200 hover:text-white font-bold text-base hover:bg-white/5 transition-all"
            >
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>VIEW ITINERARY</span>
            </Link>
          </div>

          {/* Key Value Propositions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl pt-6 text-xs text-zinc-400">
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-zinc-200">5 + 1 Group Offer</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-zinc-200">Refer & Save Up To 10%</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <Bus className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-zinc-200">Exact Seat Selection</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <Ticket className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-zinc-200">Digital QR Boarding Pass</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPECIAL OFFERS: 5+1 GROUP & REFERRAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 5+1 Group Offer Card */}
          <div className="glass-card rounded-3xl p-8 border border-amber-500/40 relative overflow-hidden bg-gradient-to-br from-amber-950/30 to-zinc-900">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider">
              EXCLUSIVE GROUP PERK
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-4">
              5 + 1 Group Offer
            </h3>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              Assemble your squad! When 5 friends pay for the expedition, the <strong>6th friend travels completely FREE</strong>. All 6 travellers receive reserved bus seats, resort accommodation, meals, and individual digital QR tickets.
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400">Group Price:</span>
                <p className="text-2xl font-black text-amber-300">₹31,000 <span className="text-xs text-zinc-400 font-normal">for 6 travellers (Save ₹6,200)</span></p>
              </div>
              <Link
                href="/book"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                Claim Group Offer
              </Link>
            </div>
          </div>

          {/* Referral Reward Card */}
          <div className="glass-card rounded-3xl p-8 border border-emerald-500/40 relative overflow-hidden bg-gradient-to-br from-emerald-950/30 to-zinc-900">
            <span className="px-3 py-1 rounded-full bg-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider">
              REFERRAL REWARDS
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-4">
              Refer & Save Up To 10%
            </h3>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              Every registered traveller receives an exclusive referral code. When a fellow GLA student confirms their booking using your code, you earn <strong>5% discount per referral</strong> (up to 10% maximum discount)!
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400">Discount Cap:</span>
                <p className="text-2xl font-black text-emerald-300">Up to ₹1,300 <span className="text-xs text-zinc-400 font-normal">instant cash savings</span></p>
              </div>
              <Link
                href="/book"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
              >
                Get Referral Code
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MULTI-BUS SYSTEM SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            LUXURY 2×2 AC COACH FLEET
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            BookMyShow-Style Bus Seat Selection
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Choose your exact window or aisle seat in real-time. Each luxury coach features 23 customer seats, ambient lighting, reclining seats, and professional mountain chauffeurs.
          </p>
        </div>

        {/* 4 Buses Live Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {busesData?.buses?.map((bus: any) => (
            <div
              key={bus.id}
              className="glass-card rounded-2xl p-6 border border-zinc-800 space-y-4 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-white">{bus.busNumber}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {bus.vehicleNumber}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">{bus.vehicleName}</p>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Occupancy:</span>
                  <span className="font-bold text-emerald-400">
                    {bus.stats.bookedCount} / {bus.stats.totalSeats}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.round((bus.stats.bookedCount / bus.stats.totalSeats) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                  Driver: {bus.driverName || 'Rajesh Sharma'}
                </span>
                <Link
                  href="/book"
                  className="font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <span>Select</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EXPEDITION ITINERARY HIGHLIGHTS (DAYS 1 TO 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              6 DAYS • 5 NIGHTS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-1">
              The Himalayan Route
            </h2>
          </div>
          <Link
            href="/itinerary"
            className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300"
          >
            <span>View Full Detailed Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ITINERARY_DAYS.map((day) => (
            <div
              key={day.dayNumber}
              className="glass-card rounded-2xl p-6 border border-zinc-800 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-600/30">
                    DAY 0{day.dayNumber}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">{day.stayLocation}</span>
                </div>
                <h3 className="text-lg font-bold text-white pt-1">{day.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{day.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-amber-400/90 font-medium truncate max-w-[180px]">
                  {day.mealsConfig}
                </span>
                <Link
                  href="/itinerary"
                  className="text-zinc-400 hover:text-white font-semibold flex items-center gap-0.5"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INCLUSIONS & EXCLUSIONS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white">What&apos;s Included</h2>
            <p className="text-sm text-zinc-400">Everything curated for a seamless college expedition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Roundtrip Luxury 2x2 AC Tourist Bus from GLA University Mathura',
              '2 Nights Resort stay in Manali & 2 Nights Riverside stay in Kasol',
              'Daily Breakfast & Dinner at resorts as specified in itinerary',
              'Complete Sightseeing: Hidimba Temple, Manu Temple, Van Vihar, Old Manali, Mall Road',
              'Solang Valley & Atal Tunnel excursion (subject to weather & safety clearances)',
              'Kasol Market, Parvati River & Manikaran Sahib hot sulphur springs',
              'Evening Campfire & group bonding music night in Kasol',
              'Guaranteed reserved bus seat with BookMyShow-style seat selection',
              'High-security Digital QR ticket for fast boarding gate check-in',
              'Dedicated 24/7 GLA trip coordinators & emergency support team',
            ].map((inc, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-zinc-200">{inc}</span>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/inclusions"
              className="inline-flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300"
            >
              <span>See Complete Inclusions & Exclusions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ PREVIEW */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Everything You Need to Know</h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.slice(0, 5).map((faq, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 border border-zinc-800 space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">Q.</span> {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-6">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white"
          >
            <span>View All Questions & Answers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 7. TRIP COORDINATOR CONTACT STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#0a1e14] to-zinc-950 border border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Have Questions? Talk to our GLA Coordinators
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Direct student-coordinator support for seat assignments, luggage queries, and group arrangements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href={`tel:${CONTACT_INFO.coordinatorPhone1}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-xs hover:bg-zinc-800"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call: {CONTACT_INFO.coordinatorPhone1}</span>
            </a>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp1}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-green-950 border border-green-600/50 text-green-300 font-bold text-xs hover:bg-green-900"
            >
              <MessageSquare className="w-4 h-4 text-green-400" />
              <span>WhatsApp Us</span>
            </a>
            <Link
              href="/book"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg glow-orange"
            >
              <span>BOOK SEAT NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
