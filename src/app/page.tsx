export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import {
  Mountain, Calendar, ArrowRight, ShieldCheck,
  CheckCircle2, Bus, MapPin, Compass, Clock, Phone, AlertCircle
} from 'lucide-react';
import { TRIP_METADATA, CONTACT_INFO, ITINERARY_DAYS } from '@/lib/constants';
import { getSeatAvailability } from '@/lib/trip-config';
import { verifyUserSession } from '@/lib/auth';
import DestinationCarousel from '@/components/DestinationCarousel';
import SnowEffect from '@/components/SnowEffect';

export default async function HomePage() {
  const availability = await getSeatAvailability();
  const tripConfig = availability.tripConfig;
  const availableSeats = availability.availableSeats;
  const totalCapacity = availability.totalCapacity;

  // Retrieve user session from cookie if logged in
  const cookieStore = await cookies();
  const token =
    cookieStore.get('gla_user_session')?.value ||
    cookieStore.get('user_session')?.value;
  const userSession = token ? verifyUserSession(token) : null;

  const pkgPrice = Number(tripConfig.packagePrice) || 6500;
  const groupPrice = Number(tripConfig.groupPackagePrice) || 6200;
  const depPrice = Number(tripConfig.depositPrice) || 1000;
  const balPrice = Math.max(0, pkgPrice - depPrice);

  return (
    <div className="w-full flex flex-col bg-[#F7F5EF] text-[#171918]">
      {/* ======================================================== */}
      {/* 1. HERO SECTION (DREAMY ALPINE PHOTOGRAPHY + PRICING)   */}
      {/* ======================================================== */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-stone-950 text-center px-4 pt-24 pb-28">
        {/* Background Mountain Image Container (z-0, Guaranteed Render) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-mountain.jpg"
            alt="Himalayan Mountain Range"
            className="w-full h-full object-cover object-[center_35%]"
          />
          {/* Multi-layer atmospheric dark & mist overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/75 via-black/35 to-stone-950" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-stone-950 to-transparent pointer-events-none" />
        </div>

        {/* Subtle Snowflake Particle Layer */}
        <SnowEffect />

        {/* Hero Content on top (z-10) */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-6 flex flex-col items-center text-white">
          {/* Live Seat Counter & Status Pill (SSOT DYNAMIC CALCULATION) */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wide text-white shadow-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-mono font-black tracking-wider uppercase">
                {availableSeats} OF {totalCapacity} SEATS REMAINING
              </span>
            </div>
          </div>

          {/* Large Hero Title & Prominent Official Brand Badge */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white/95 border-2 border-white/60 shadow-2xl p-0.5 hover:scale-105 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="Himalayan Escape Official Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {userSession ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold tracking-wide shadow-md">
                <span>👋 Welcome Aboard, {userSession.name?.split(' ')[0] || 'Traveller'}!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#D87945] text-xs sm:text-sm font-black tracking-widest uppercase font-mono">
                🏔️ {tripConfig.subtitle || 'STUDENT EXPEDITION • MANALI × KASOL 2026'}
              </div>
            )}

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none text-white drop-shadow-md">
              {tripConfig.tripTitle || 'HIMALAYAN ESCAPE'}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl font-light text-stone-100 tracking-wide drop-shadow-sm max-w-2xl">
              6 Days, 5 Nights of Parvati Valley Cafés, Snow Treks & Bonfire Nights.
            </p>
          </div>

          {/* Tiered Squad Pricing Breakdown Card (DYNAMIC FROM SSOT) */}
          <div className="w-full max-w-lg p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/25 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
              <div className="text-left">
                <span className="text-[11px] font-bold tracking-widest uppercase text-stone-300 block font-mono">
                  SOLO RATE (1–4 PAX)
                </span>
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                  ₹{pkgPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-stone-300 ml-1 font-semibold">/ person</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400 block font-mono">
                  SQUAD RATE (5+ PAX)
                </span>
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-400 font-mono">
                  ₹{groupPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-300 ml-1 font-semibold">/ person</span>
              </div>
            </div>

            <div className="space-y-1.5 text-center font-mono">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <span>Lock Your Seat at just ₹{depPrice.toLocaleString('en-IN')} Deposit</span>
              </div>
              <p className="text-xs text-stone-300">
                ₹{pkgPrice.toLocaleString('en-IN')} / Person • Squad of {tripConfig.groupSizeThreshold || 5}+: ₹{groupPrice.toLocaleString('en-IN')} / Person
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
            {userSession ? (
              <>
                <Link
                  href="/my-bookings"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#163C32] to-[#0D241E] hover:from-[#0D241E] hover:to-[#081814] text-white font-black text-sm shadow-xl transition-all tracking-wider text-center border border-white/20"
                >
                  Go to My Bookings
                </Link>
                <Link
                  href="/book"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#D87945] to-[#B85F30] hover:from-[#B85F30] hover:to-[#A34E22] text-white font-black text-sm shadow-xl transition-all tracking-wider text-center"
                >
                  Book Another Seat
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/book"
                  className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-[#D87945] to-[#B85F30] hover:from-[#B85F30] hover:to-[#A34E22] text-white font-black text-sm shadow-xl transition-all tracking-wider text-center"
                >
                  Reserve Seat (₹{depPrice.toLocaleString('en-IN')} Deposit)
                </Link>
                <Link
                  href="#trip-overview"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/30 backdrop-blur-sm transition-all tracking-wider text-center"
                >
                  VIEW THE TRIP
                </Link>
              </>
            )}
          </div>

          {/* Origin & Route Text (DYNAMIC FROM TRIPCONFIG) */}
          <p className="text-xs text-stone-200 font-medium tracking-wide pt-1 uppercase">
            PICKUP: {tripConfig.pickupLocation} ({tripConfig.reportingTime}) → MANALI → KASOL
          </p>
        </div>
      </section>

      {/* Metric Cards - Positioned cleanly in the transition between hero and content */}
      <div className="relative z-20 max-w-5xl mx-auto -mt-12 px-4 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <div className="p-5 rounded-2xl bg-white border border-[#D8D2C4] shadow-md hover:shadow-lg transition-shadow text-center">
          <span className="block text-2xl font-black text-[#163C32]">6 DAYS</span>
          <span className="text-xs font-semibold text-[#646864] uppercase tracking-wider font-mono">EXPEDITION</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#D8D2C4] shadow-md hover:shadow-lg transition-shadow text-center">
          <span className="block text-2xl font-black text-[#163C32]">5 NIGHTS</span>
          <span className="text-xs font-semibold text-[#646864] uppercase tracking-wider font-mono">ACCOMMODATION</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#D8D2C4] shadow-md hover:shadow-lg transition-shadow text-center">
          <span className="block text-2xl font-black text-[#D87945] font-mono">₹{pkgPrice.toLocaleString('en-IN')}</span>
          <span className="text-xs font-semibold text-[#646864] uppercase tracking-wider font-mono">PER PERSON</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#D8D2C4] shadow-md hover:shadow-lg transition-shadow text-center">
          <span className="block text-2xl font-black text-[#171918] font-mono">{totalCapacity} SEATS</span>
          <span className="text-xs font-semibold text-[#646864] uppercase tracking-wider font-mono">MAX CAPACITY</span>
        </div>
      </div>

      {/* Main Content Sections with Standard Spacing */}
      <div className="w-full space-y-20 sm:space-y-28 pt-16 sm:pt-20">
        {/* ======================================================== */}
        {/* 2. TRIP INTRODUCTION SECTION                             */}
        {/* ======================================================== */}
        <section id="trip-overview" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest font-mono">
              THE EXPEDITION
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
              Six days. One unforgettable escape.
            </h2>
            <div className="space-y-3 text-base text-[#171918]/80 leading-relaxed font-normal">
              <p>
                Himalayan Escape is an independent student mountain expedition departing {tripConfig.pickupLocation}. Designed for comfort and adventure, travellers journey across the plains of North India and climb into the high valleys of Himachal Pradesh aboard dedicated 2x2 luxury tourist coaches.
              </p>
              <p>
                From the snowy heights of Solang Valley and the engineering marvel of the Atal Tunnel to the mystical cedar forests and riverside cafés of Kasol and the spiritual hot springs of Manikaran Sahib, every day offers a balance of curated group exploration and independent freedom.
              </p>
              <p className="text-sm font-medium text-[#163C32]">
                Pickup & Reporting: {tripConfig.pickupLocation} ({tripConfig.reportingTime}) → Manali → Solang Valley → Atal Tunnel → Sissu → Kasol → Manikaran Sahib
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. RESTRAINED EDITORIAL PHOTOGRAPHY                      */}
        {/* ======================================================== */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden border border-[#D8D2C4] shadow-sm">
              <img
                src="/images/solang-valley.jpg"
                alt="Snow covered alpine valley in Solang near Manali"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block font-mono">
                    MANALI & SOLANG VALLEY
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Alpine snow trails, cedar forests & high mountain passes
                  </h3>
                </div>
              </div>
            </div>

            <div className="relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden border border-[#D8D2C4] shadow-sm">
              <img
                src="/images/kasol-river.jpg"
                alt="Parvati River flowing through Kasol"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block font-mono">
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
        {/* 3.5. DESTINATION HIGHLIGHTS CAROUSEL                     */}
        {/* ======================================================== */}
        <DestinationCarousel />

        {/* ======================================================== */}
        {/* 4. ITINERARY (VERTICAL EDITORIAL TIMELINE)               */}
        {/* ======================================================== */}
        <section id="itinerary" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest font-mono">
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
                <div className="absolute -left-[31px] sm:-left-[47px] top-1 w-6 h-6 rounded-full bg-[#163C32] border-4 border-[#F7F5EF] flex items-center justify-center text-white" />

                <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-3 shadow-sm hover:border-[#B4AA96] transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black px-2.5 py-1 rounded-md bg-[#163C32] text-white font-mono">
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

          <div className="p-5 rounded-2xl bg-[#E7E2D8] border border-[#D8D2C4] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#D87945] shrink-0 mt-0.5" />
            <p className="text-xs text-[#171918]/80 leading-relaxed">
              <strong>Safety & Route Note:</strong> Routes and activities may change due to weather, road conditions, permits, traffic, or local safety restrictions. Atal Tunnel, Sissu, and adventure activities are subject to local district administration clearances.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. PRICING SECTION (DYNAMIC FROM SSOT)                   */}
        {/* ======================================================== */}
        <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest font-mono">
              TRANSPARENT EXPEDITION PRICING
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
              One price. No surprises.
            </h2>
            <p className="text-sm text-[#646864] max-w-xl">
              A single, all-inclusive price per traveller. Lock your coach seat with a small deposit today.
            </p>
          </div>

          {/* Master Price Card (DYNAMIC FROM SSOT) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#163C32] text-white space-y-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/15 pb-8">
              <div className="space-y-1">
                <span className="text-xs font-bold tracking-widest text-[#D87945] uppercase font-mono">
                  COMPLETE 6-DAY PACKAGE
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight font-mono">₹{pkgPrice.toLocaleString('en-IN')}</span>
                  <span className="text-sm font-semibold text-stone-300 font-mono">/ PER TRAVELLER</span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-300 font-mono">RESERVATION:</span>
                  <span className="text-2xl font-black text-[#D87945] font-mono">₹{depPrice.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-stone-300 font-mono">
                  Remaining balance of ₹{balPrice.toLocaleString('en-IN')} payable before campus departure.
                </p>
              </div>
            </div>

            {/* Dynamic Group Pricing Examples */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono">
                Clear Multi-Traveller Totals (Operationally Coordinated):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
                  <span className="text-xs font-bold text-stone-200">1 Traveller</span>
                  <p className="text-xl font-black text-white font-mono">₹{pkgPrice.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-[#D87945] font-semibold font-mono">₹{depPrice.toLocaleString('en-IN')} reservation</p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
                  <span className="text-xs font-bold text-stone-200">2 Travellers</span>
                  <p className="text-xl font-black text-white font-mono">₹{(pkgPrice * 2).toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-[#D87945] font-semibold font-mono">₹{(depPrice * 2).toLocaleString('en-IN')} reservation</p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
                  <span className="text-xs font-bold text-stone-200">5 Travellers</span>
                  <p className="text-xl font-black text-white font-mono">₹{(pkgPrice * 5).toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-[#D87945] font-semibold font-mono">₹{(depPrice * 5).toLocaleString('en-IN')} reservation</p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
                  <span className="text-xs font-bold text-stone-200">6 Travellers</span>
                  <p className="text-xl font-black text-white font-mono">₹{(pkgPrice * 6).toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-[#D87945] font-semibold font-mono">₹{(depPrice * 6).toLocaleString('en-IN')} reservation</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-300 font-mono">
                * Flat calculation: Total = Travellers × ₹{pkgPrice.toLocaleString('en-IN')}. Deposit = Travellers × ₹{depPrice.toLocaleString('en-IN')}.
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
            <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest font-mono">
              INCLUSIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
              What&apos;s included in your trip
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
                Round-trip road journey from Mathura (NH-2) to Manali, Solang Valley, Kasol, and return.
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
                Pre-allocated bus seat numbers, instant digital ticket with QR code for boarding check-in, and 24/7 student coordinators.
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
                <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest font-mono">
                  COMFORT ON THE ROAD
                </span>
                <h3 className="text-2xl font-black text-[#171918]">
                  Luxury 2x2 Coach Pushback Seating
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
                <p className="text-xs text-[#646864]">Coordinated departure from Mathura pickup point.</p>
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
                Departure Reporting & Pickup Guidelines
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#171918]/80 leading-relaxed">
              All travellers report at {tripConfig.pickupLocation} at {tripConfig.reportingTime} with valid student/college ID and digital QR pass. Luggage tags will be assigned during boarding check-in. For coordination assistance, contact Student Trip Organizers / Lead Coordinators directly at <strong>{tripConfig.emergencyHelplines[0] || CONTACT_INFO.coordinatorPhone1}</strong> or <strong>{tripConfig.emergencyHelplines[1] || CONTACT_INFO.coordinatorPhone2}</strong>.
            </p>
            <p className="text-[11px] text-[#171918]/60 italic border-t border-[#D8D2C4] pt-2">
              * Note: Independent student-organized expedition. Not an officially sponsored university event.
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
            Seats across the 4 luxury coaches fill up quickly. Secure your seat today with just ₹{depPrice.toLocaleString('en-IN')} advance reservation.
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
    </div>
  );
}
