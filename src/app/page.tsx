'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mountain, Calendar, ArrowRight, ShieldCheck,
  CheckCircle2, Bus, MapPin, Compass, Clock, Phone, AlertCircle
} from 'lucide-react';
import { TRIP_METADATA, PRICING_DEFAULTS, CONTACT_INFO, ITINERARY_DAYS } from '@/lib/constants';

export default function HomePage() {
  const [busesData, setBusesData] = useState<any>(null);

  useEffect(() => {
    async function fetchBuses() {
      try {
        const res = await fetch('/api/buses');
        if (res.ok) {
          const data = await res.json();
          setBusesData(data);
        }
      } catch {
        // Fallback
      }
    }
    fetchBuses();
  }, []);

  const totalBooked = busesData?.trip?.totalBooked || 0;
  const totalCapacity = busesData?.trip?.capacity || 75;
  const totalAvailable = Math.max(0, totalCapacity - totalBooked);

  return (
    <div className="w-full flex flex-col space-y-20 sm:space-y-28">
      {/* ======================================================== */}
      {/* 1. HERO SECTION (MINIMAL, ELEGANT, PROFIT-SAFE PRICING)  */}
      {/* ======================================================== */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center pt-10 pb-16 overflow-hidden">
        {/* Subtle Mountain Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#081e15] via-[#05130d] to-[#050e09] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-8 z-10">
          {/* Origin Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-600/40 text-xs font-semibold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>GLA University, Mathura → Himachal Pradesh</span>
          </div>

          {/* Clean Hero Title */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase">
              GLA HIMALAYAN ESCAPE
            </h1>
            <div className="flex items-center justify-center gap-3 text-lg sm:text-2xl font-black text-orange-400 tracking-wider">
              <span>MANALI</span>
              <span>×</span>
              <span>KASOL</span>
              <span className="text-zinc-600">•</span>
              <span className="text-white">6 DAYS • 5 NIGHTS</span>
            </div>
            <p className="text-base sm:text-lg text-zinc-300 font-medium italic pt-1">
              &ldquo;Mountains. Friends. Adventure. Memories.&rdquo;
            </p>
          </div>

          {/* Immediately Show: 6,200 / Person, 1,000 To Reserve, 75 Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full">
            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 text-center">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                TRIP FARE
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">₹6,200</div>
              <span className="text-[11px] text-zinc-400">/ PERSON</span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                RESERVATION TODAY
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">₹1,000</div>
              <span className="text-[11px] text-zinc-400">TO RESERVE YOUR SEAT</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 text-center">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                TRIP CAPACITY
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">75 SEATS</div>
              <span className="text-[11px] text-emerald-400 font-semibold">{totalAvailable} SEATS REMAINING</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto">
            <Link
              href="/book"
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl transition-all"
            >
              BOOK YOUR SEAT
            </Link>

            <Link
              href="/itinerary"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-base transition-all"
            >
              VIEW ITINERARY
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TRIP OVERVIEW                                         */}
      {/* ======================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-950 border border-white/10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">EXPEDITION OVERVIEW</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">The Himalayan Route</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-zinc-300">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-500 uppercase">DEPARTURE</span>
              <p className="font-bold text-white text-base">GLA University, Mathura</p>
              <p className="text-xs text-zinc-400">Direct coach flag-off from campus main bus bay.</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-500 uppercase">DESTINATIONS</span>
              <p className="font-bold text-white text-base">Manali & Kasol</p>
              <p className="text-xs text-zinc-400">Old Manali, Solang Valley, Atal Tunnel / Sissu, Parvati Valley & Manikaran.</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-500 uppercase">COACHES</span>
              <p className="font-bold text-white text-base">Luxury 2x2 AC Coaches</p>
              <p className="text-xs text-zinc-400">23 passenger seats per coach with interactive seat selection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. 6-DAY ITINERARY PREVIEW                               */}
      {/* ======================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">SCHEDULE</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">6-Day Itinerary</h2>
          </div>
          <Link
            href="/itinerary"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View Full Detailed Itinerary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { day: 'Day 1', route: 'GLA → Manali', title: 'Reporting & Departure', desc: 'Campus QR verification, seat boarding, and scenic overnight road journey toward Beas Valley.' },
            { day: 'Day 2', route: 'Manali Local', title: 'Temples & Mall Road', desc: 'Resort check-in, Hidimba Devi pagoda temple, Old Manali walking lanes, and Mall Road evening.' },
            { day: 'Day 3', route: 'Solang + Atal Tunnel', title: 'Snow Peaks & Sissu', desc: 'Solang mountain bowl, world-famous Atal Tunnel crossing to Sissu waterfall (subject to road conditions).' },
            { day: 'Day 4', route: 'Manali → Kasol', title: 'Kullu & Parvati Valley', desc: 'Descend along Beas River, Kullu shawl visit, and transfer to riverside stay in Kasol.' },
            { day: 'Day 5', route: 'Kasol + Manikaran', title: 'Hot Springs & Campfire', desc: 'Manikaran Sahib Gurudwara sacred hot springs, Chalal pine trail, and evening farewell campfire.' },
            { day: 'Day 6', route: 'Kasol → GLA', title: 'Return Journey', desc: 'Morning farewell breakfast, scenic highway descent through Chandigarh, arriving safely at GLA campus.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-950 border border-white/5 space-y-2 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase">{item.day}</span>
                <span className="text-[11px] font-bold text-zinc-500">{item.route}</span>
              </div>
              <h3 className="font-bold text-white text-sm">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. PRICING (PROFIT-SAFE & SINGLE SOURCE OF TRUTH)        */}
      {/* ======================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-950 border border-emerald-500/20 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">TRANSPARENT PRICING</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Simple, Honest Pricing</h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              ₹6,200 per traveller. No hidden charges. No confusing conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Solo / Any Traveller */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <span className="text-xs font-bold text-zinc-400 uppercase">Individual Booking</span>
              <div className="space-y-1">
                <div className="text-3xl font-black text-white">₹6,200</div>
                <p className="text-xs text-emerald-400 font-semibold">₹1,000 deposit to reserve seat</p>
                <p className="text-[11px] text-zinc-500">Remaining ₹5,200 before departure</p>
              </div>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Reserved Luxury AC Coach Seat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hotel accommodation in Manali & Kasol</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Breakfast & Dinner as per itinerary</span>
                </li>
              </ul>
            </div>

            {/* Group Convenience */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <span className="text-xs font-bold text-orange-400 uppercase">Group Booking (Friends)</span>
              <div className="space-y-1">
                <div className="text-3xl font-black text-white">₹6,200 <span className="text-xs font-normal text-zinc-400">/ person</span></div>
                <p className="text-xs text-emerald-400 font-semibold">₹1,000 deposit per traveller</p>
                <p className="text-[11px] text-zinc-500">e.g. 6 travellers = ₹37,200 (Pay ₹6,000 today)</p>
              </div>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>One booking ID for the entire squad</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Adjacent seats on the same coach</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Individual digital QR tickets for everyone</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all"
            >
              <span>RESERVE WITH ₹1,000 PER PERSON</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. WHAT IS INCLUDED                                      */}
      {/* ======================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">INCLUSIONS</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">What is Included in Your Trip</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          {[
            'Roundtrip Luxury 2x2 AC Tourist Bus from GLA University Mathura',
            '2 Nights resort accommodation in Manali',
            '2 Nights riverside camp/hotel accommodation in Kasol',
            'Configured meals: Daily Breakfast & Dinner at hotels',
            'Complete Manali sightseeing (Hidimba Devi, Manu Temple, Mall Road)',
            'Solang Valley & Atal Tunnel excursion (subject to road conditions)',
            'Kasol & Manikaran Sahib Gurudwara hot springs visit',
            'Evening campfire & group games session in Kasol',
            'Guaranteed reserved seat with interactive BookMyShow map',
            'Digital QR ticket & live boarding pass for gate verification',
            'Dedicated 24/7 GLA trip coordinators & mountain drivers',
            'First aid kit & primary coordination assistance',
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-zinc-950 border border-white/5 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-zinc-300 font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. BOOKING PROCESS                                       */}
      {/* ======================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="space-y-2 text-center max-w-md mx-auto">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">SIMPLE BOOKING</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Sign In with Google', desc: 'Passwordless one-click authentication with your Google account.' },
            { step: '02', title: 'Choose Travellers', desc: 'Select 1 to 6+ travellers and enter emergency contact details.' },
            { step: '03', title: 'Select Seats', desc: 'Pick your exact coach window or aisle seat on the interactive 23-seat map.' },
            { step: '04', title: 'Pay ₹1,000 & Confirm', desc: 'Lock your seats with Razorpay and instantly receive your digital QR boarding passes.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-950 border border-white/5 space-y-2"
            >
              <span className="text-2xl font-black text-emerald-400/40 block">{item.step}</span>
              <h3 className="font-bold text-white text-sm">{item.title}</h3>
              <p className="text-xs text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. IMPORTANT TRIP INFORMATION & DISCLAIMER               */}
      {/* ======================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Important Trip Information & Safety Disclaimer</span>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            {TRIP_METADATA.disclaimer}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800 text-zinc-400">
            <div>
              Reporting Location: <strong className="text-white">GLA University Main Gate, Mathura</strong>
            </div>
            <div>
              Coordinator Helpdesk: <strong className="text-emerald-400 font-mono">{CONTACT_INFO.coordinatorPhone1}</strong> / <strong className="text-emerald-400 font-mono">{CONTACT_INFO.coordinatorPhone2}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FINAL BOOK NOW CTA                                    */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center py-6">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-emerald-950/60 to-zinc-950 border border-emerald-500/30 space-y-6">
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Ready for the Mountains?</h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Seats are allocated on a first-come, first-served basis across 4 luxury tourist coaches.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-xl transition-all"
            >
              <span>BOOK YOUR SEAT NOW</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
