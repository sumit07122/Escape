'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mountain, Calendar, ArrowRight, ShieldCheck,
  CheckCircle2, Bus, MapPin, Compass, Clock, Phone, AlertCircle
} from 'lucide-react';
import { TRIP_METADATA, PRICING_DEFAULTS, CONTACT_INFO, ITINERARY_DAYS } from '@/lib/constants';

interface BusData {
  trip?: {
    totalBooked: number;
    capacity: number;
  };
}

export default function HomePage() {
  const [busesData, setBusesData] = useState<BusData | null>(null);

  useEffect(() => {
    async function fetchBuses() {
      try {
        const res = await fetch('/api/buses');
        if (res.ok) {
          const data = await res.json();
          setBusesData(data);
        }
      } catch {
        // Fallback gracefully
      }
    }
    fetchBuses();
  }, []);

  const totalCapacity = busesData?.trip?.capacity || 75;

  return (
    <div className="w-full flex flex-col space-y-20 sm:space-y-28 bg-[#F7F5EF] text-[#171918]">
      {/* ======================================================== */}
      {/* 1. HERO SECTION (EDITORIAL PHOTOGRAPHY + TRANSPARENT PRICING) */}
      {/* ======================================================== */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center pt-16 pb-20 overflow-hidden">
        {/* Full-width Himalayan Photograph with Subtle Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-himalayas.jpg"
            alt="Himalayan mountain peaks in Manali"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75 z-10" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-8 z-20 text-white">
          {/* Metadata pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold tracking-wider uppercase text-stone-100">
            <span className="w-2 h-2 rounded-full bg-[#D87945]" />
            <span>GLA HIMALAYAN ESCAPE • 6 DAYS • 5 NIGHTS</span>
          </div>

          {/* Large Hero Title */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none">
              MANALI × KASOL
            </h1>
            <p className="text-lg sm:text-2xl font-light text-stone-200 tracking-wide">
              Mountains. Friends. Adventure. Memories.
            </p>
          </div>

          {/* Pricing Highlight */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2">
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-black tracking-tight text-white">
                ₹6,200
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-stone-300">
                PER PERSON
              </span>
            </div>
            <div className="h-8 w-px bg-white/30 hidden sm:block" />
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-black tracking-tight text-[#D87945]">
                ₹1,000
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-stone-300">
                TO RESERVE
              </span>
            </div>
            <div className="h-8 w-px bg-white/30 hidden sm:block" />
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-black tracking-tight text-white">
                75
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-stone-300">
                TOTAL CAPACITY
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <Link
              href="/book"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-extrabold text-sm shadow-lg transition-all tracking-wider text-center"
            >
              BOOK YOUR SEAT
            </Link>
            <Link
              href="#trip-overview"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/30 backdrop-blur-sm transition-all tracking-wider text-center"
            >
              VIEW THE TRIP
            </Link>
          </div>

          {/* Origin & Route Text */}
          <p className="text-xs text-stone-300 font-medium tracking-wide pt-2">
            GLA UNIVERSITY, MATHURA → MANALI → KASOL → GLA
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TRIP INTRODUCTION SECTION                             */}
      {/* ======================================================== */}
      <section id="trip-overview" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest">
            THE EXPEDITION
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
            Six days. One unforgettable escape.
          </h2>
          <div className="space-y-3 text-base text-[#171918]/80 leading-relaxed font-normal">
            <p>
              GLA Himalayan Escape is an official student expedition departing directly from the main campus gates of GLA University, Mathura. Designed for comfort and adventure, travellers journey across the plains of North India and climb into the high valleys of Himachal Pradesh aboard dedicated 2x2 luxury tourist coaches.
            </p>
            <p>
              From the snowy heights of Solang Valley and the engineering marvel of the Atal Tunnel to the mystical cedar forests and riverside cafés of Kasol and the spiritual hot springs of Manikaran Sahib, every day offers a balance of curated group exploration and independent freedom.
            </p>
            <p className="text-sm font-medium text-[#163C32]">
              Route: GLA University, Mathura → Manali → Solang Valley → Atal Tunnel → Sissu → Kasol → Manikaran → GLA University
            </p>
          </div>
        </div>

        {/* Clean Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-white border border-[#D8D2C4]">
            <span className="block text-2xl font-black text-[#163C32]">6 DAYS</span>
            <span className="text-xs font-semibold text-[#646864] uppercase tracking-wider">EXPEDITION</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#D8D2C4]">
            <span className="block text-2xl font-black text-[#163C32]">5 NIGHTS</span>
            <span className="text-xs font-semibold text-[#646864] uppercase tracking-wider">ACCOMMODATION</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#D8D2C4]">
            <span className="block text-2xl font-black text-[#D87945]">₹6,200</span>
            <span className="text-xs font-semibold text-[#646864] uppercase tracking-wider">PER PERSON</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-[#D8D2C4]">
            <span className="block text-2xl font-black text-[#171918]">75 SEATS</span>
            <span className="text-xs font-semibold text-[#646864] uppercase tracking-wider">MAX CAPACITY</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. RESTRAINED EDITORIAL PHOTOGRAPHY                      */}
      {/* ======================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden border border-[#D8D2C4] shadow-sm">
            <Image
              src="/images/solang-valley.jpg"
              alt="Snow covered alpine valley in Solang near Manali"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
                  MANALI & SOLANG VALLEY
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Alpine snow trails, cedar forests & high mountain passes
                </h3>
              </div>
            </div>
          </div>

          <div className="relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden border border-[#D8D2C4] shadow-sm">
            <Image
              src="/images/kasol-river.jpg"
              alt="Parvati River flowing through Kasol"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
                  PARVATI VALLEY & KASOL
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Turquoise glacial streams and riverside mountain stays
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. ITINERARY (VERTICAL EDITORIAL TIMELINE)               */}
      {/* ======================================================== */}
      <section id="itinerary" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest">
            DAY-BY-DAY SCHEDULE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
            Six days in the Himalayas
          </h2>
          <p className="text-sm text-[#646864] max-w-xl">
            A carefully paced college itinerary balancing mountain sightseeing, relaxation, and scenic road journeys.
          </p>
        </div>

        {/* Timeline Items */}
        <div className="relative border-l-2 border-[#D8D2C4] ml-4 sm:ml-6 space-y-10 pl-6 sm:pl-10">
          {ITINERARY_DAYS.map((day) => (
            <div key={day.dayNumber} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1 w-6 h-6 rounded-full bg-[#163C32] border-4 border-[#F7F5EF] flex items-center justify-center text-white" />

              <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-3 shadow-sm hover:border-[#B4AA96] transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black px-2.5 py-1 rounded-md bg-[#163C32] text-white">
                      DAY 0{day.dayNumber}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-[#171918]">
                      {day.title}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#E7E2D8] text-[#171918]">
                    {day.stayLocation}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#171918]/80 leading-relaxed">
                  {day.description}
                </p>

                {/* Major locations badge */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#646864]">
                  <span className="font-bold text-[#163C32]">Highlights:</span>
                  <span>{day.subtitle}</span>
                  <span className="text-[#D8D2C4]">•</span>
                  <span className="font-semibold text-[#D87945]">{day.mealsConfig}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Operating & Road Disclaimer */}
        <div className="p-5 rounded-2xl bg-[#E7E2D8] border border-[#D8D2C4] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#D87945] shrink-0 mt-0.5" />
          <p className="text-xs text-[#171918]/80 leading-relaxed">
            <strong>Safety & Route Note:</strong> Routes and activities may change due to weather, road conditions, permits, traffic, or local safety restrictions. Atal Tunnel, Sissu, and adventure activities are subject to local district administration clearances.
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. PRICING SECTION (ONE PRICE. NO SURPRISES.)             */}
      {/* ======================================================== */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest">
            TRANSPARENT EXPEDITION PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
            One price. No surprises.
          </h2>
          <p className="text-sm text-[#646864] max-w-xl">
            A single, all-inclusive price per traveller. Lock your coach seat with a small deposit today.
          </p>
        </div>

        {/* Master Price Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#163C32] text-white space-y-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/15 pb-8">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-[#D87945] uppercase">
                COMPLETE 6-DAY PACKAGE
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight">₹6,200</span>
                <span className="text-sm font-semibold text-stone-300">/ PER TRAVELLER</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-300">RESERVATION:</span>
                <span className="text-2xl font-black text-[#D87945]">₹1,000</span>
              </div>
              <p className="text-xs text-stone-300">
                Remaining balance of ₹5,200 payable before campus departure.
              </p>
            </div>
          </div>

          {/* Group Pricing Examples */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
              Clear Multi-Traveller Totals (Operationally Coordinated):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
                <span className="text-xs font-bold text-stone-200">1 Traveller</span>
                <p className="text-xl font-black text-white">₹6,200</p>
                <p className="text-[11px] text-[#D87945] font-semibold">₹1,000 reservation</p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
                <span className="text-xs font-bold text-stone-200">2 Travellers</span>
                <p className="text-xl font-black text-white">₹12,400</p>
                <p className="text-[11px] text-[#D87945] font-semibold">₹2,000 reservation</p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
                <span className="text-xs font-bold text-stone-200">5 Travellers</span>
                <p className="text-xl font-black text-white">₹31,000</p>
                <p className="text-[11px] text-[#D87945] font-semibold">₹5,000 reservation</p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
                <span className="text-xs font-bold text-stone-200">6 Travellers</span>
                <p className="text-xl font-black text-white">₹37,200</p>
                <p className="text-[11px] text-[#D87945] font-semibold">₹6,000 reservation</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-300">
              * Flat calculation: Total = Travellers × ₹6,200. Deposit = Travellers × ₹1,000.
            </p>
            <Link
              href="/book"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-black text-xs tracking-wider shadow-md text-center"
            >
              CHOOSE SEAT & RESERVE NOW
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. WHAT'S INCLUDED SECTION                               */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest">
            INCLUSIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
            What's included in your trip
          </h2>
          <p className="text-sm text-[#646864] max-w-xl">
            Everything organized so you can focus on making memories in the mountains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#163C32] shrink-0" />
              <h3 className="font-bold text-base text-[#171918]">Dedicated 2x2 AC Tourist Coaches</h3>
            </div>
            <p className="text-xs text-[#646864] pl-7.5 leading-relaxed">
              Round-trip road journey from GLA University Mathura to Manali, Solang Valley, Kasol, and return.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#163C32] shrink-0" />
              <h3 className="font-bold text-base text-[#171918]">Verified Resort & Hotel Stays</h3>
            </div>
            <p className="text-xs text-[#646864] pl-7.5 leading-relaxed">
              Comfortable group stays with verified amenities in Manali and riverside camps/hotels in Kasol.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#163C32] shrink-0" />
              <h3 className="font-bold text-base text-[#171918]">Planned Sightseeing & Excursions</h3>
            </div>
            <p className="text-xs text-[#646864] pl-7.5 leading-relaxed">
              Solang Valley snow point, Atal Tunnel, Old Manali, Kasol market, Manikaran Sahib, and Parvati Valley trails.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#163C32] shrink-0" />
              <h3 className="font-bold text-base text-[#171918]">QR Digital Boarding Pass & Safety</h3>
            </div>
            <p className="text-xs text-[#646864] pl-7.5 leading-relaxed">
              Pre-allocated bus seat numbers, instant digital ticket with QR code for gate check-in at GLA campus, and 24/7 student coordinators.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. COACH SEATING PREVIEW                                 */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#D8D2C4] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest">
                COMFORT ON THE ROAD
              </span>
              <h3 className="text-2xl font-black text-[#171918]">
                23-Passenger Luxury Coach Seating
              </h3>
              <p className="text-xs text-[#646864]">
                Choose your exact window or aisle seat in advance with real-time seat locks.
              </p>
            </div>
            <Link
              href="/book"
              className="px-6 py-3 rounded-xl bg-[#163C32] hover:bg-[#0F2A23] text-white font-bold text-xs shadow-sm self-start sm:self-center"
            >
              SELECT YOUR SEAT
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-1">
              <span className="text-xs font-bold text-[#163C32]">2x2 Pushback Pairs</span>
              <p className="text-xs text-[#646864]">Spacious aisle layout with individual charging ports.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-1">
              <span className="text-xs font-bold text-[#163C32]">10-Minute Hold Guarantee</span>
              <p className="text-xs text-[#646864]">Seats remain locked exclusively for you during checkout.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-1">
              <span className="text-xs font-bold text-[#163C32]">4 Coaches Available</span>
              <p className="text-xs text-[#646864]">Coordinated departure from GLA Mathura campus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. CAMPUS GUIDELINES & COORDINATION                      */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-8 rounded-3xl bg-[#E7E2D8] border border-[#D8D2C4] space-y-4">
          <div className="flex items-center gap-2 text-[#163C32]">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <h3 className="font-black text-lg text-[#171918]">
              GLA University Campus Departure Guidelines
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#171918]/80 leading-relaxed">
            All travellers report at GLA University Mathura Main Campus Gate at the scheduled departure time with valid college ID and digital QR pass. Luggage tags will be assigned during gate check-in. For coordination assistance, contact tour leads directly at <strong>{CONTACT_INFO.coordinatorPhone1}</strong> or <strong>{CONTACT_INFO.coordinatorPhone2}</strong>.
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. READY TO BOOK CALL-TO-ACTION                          */}
      {/* ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pb-12">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
          Ready for the mountains?
        </h2>
        <p className="text-sm text-[#646864] max-w-md mx-auto">
          Seats on the 4 luxury coaches fill up quickly. Secure your seat today with just ₹1,000 reservation.
        </p>
        <div className="pt-2">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-extrabold text-sm shadow-md transition-all tracking-wider"
          >
            <span>RESERVE YOUR SEAT NOW</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
