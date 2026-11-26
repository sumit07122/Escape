export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import {
  Mountain, Calendar, ArrowRight, ShieldCheck,
  CheckCircle2, Bus, Users, AlertCircle,
  Check, Sparkles, Tag,
  Phone, MessageCircle, Clock, MapPin, Flame, Compass, Star
} from 'lucide-react';
import { TRIP_METADATA, CONTACT_INFO, ITINERARY_DAYS } from '@/lib/constants';
import { getSeatAvailability } from '@/lib/trip-config';
import { db, safeDbQuery } from '@/lib/db';
import { verifyUserSession } from '@/lib/auth';
import HomeScenicCarousel from '@/components/HomeScenicCarousel';
import DestinationCarousel from '@/components/DestinationCarousel';
import SnowEffect from '@/components/SnowEffect';
import MountainWeatherWidget from '@/components/MountainWeatherWidget';

const HOMEPAGE_HIGHLIGHTS = [
  {
    title: 'Kasol Riverside Camping',
    tag: 'DAY 2 • PARVATI VALLEY',
    desc: 'Pitching alpine tents beneath tall pine canopies beside the roaring turquoise Parvati River under crystal mountain stars.',
    image: '/images/kasol-river.jpg',
  },
  {
    title: 'Manikaran Sahib & Hot Springs',
    tag: 'DAY 2 • SACRED SHRINE',
    desc: 'Historic Sikh Gurudwara and ancient Shiva Temple featuring natural therapeutic geothermal sulphur springs.',
    image: '/images/manikaran.jpg',
  },
  {
    title: 'Manali Local Sightseeing',
    tag: 'DAY 3 • CULTURE & CAFES',
    desc: 'Stay at a 3-star riverside hotel with 3 gardens. Explore Hadimba Temple in cedar woods, Vashisht, Van Vihar, and Old Manali café street.',
    image: '/images/old-manali.jpg',
  },
  {
    title: 'Solang Valley Adventures',
    tag: 'DAY 4 • SNOW BOWL',
    desc: 'High-altitude snow slopes offering optional paragliding, skiing, and thrilling ATV rides in the alpine amphitheater.',
    image: '/images/solang-valley.jpg',
  },
  {
    title: 'Atal Tunnel and Sissu',
    tag: 'DAY 4 • 9.02 KM MARVEL',
    desc: 'Drive through the engineering wonder into Lahaul Valley to witness frozen waterfalls and trans-Himalayan peaks (Rohtang if opened).',
    image: '/hero-mountain.jpg',
  },
  {
    title: 'Jogini Waterfall Nature Trek',
    tag: 'DAY 5 • SCENIC TRAIL',
    desc: 'A refreshing pine forest and apple orchard hike to the breathtaking cascading Jogini Falls before our return journey.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Christmas Celebration',
    tag: 'DAY 5 • FESTIVE MALL ROAD',
    desc: 'Experience festive carols, twinkling Christmas lights, seasonal café treats, and holiday shopping on bustling Manali Mall Road.',
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Bonfire and DJ Night',
    tag: 'NIGHTS 2 & 4 • CAMPFIRE',
    desc: 'Warm crackling bonfires, live DJ music, dance sessions, group games, and stories under the cold Himalayan night sky.',
    image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
  },
];

export default async function HomePage() {
  const availability = await getSeatAvailability();
  const tripConfig = availability.tripConfig;
  const availableSeats = availability.availableSeats;
  const depPrice = Number(tripConfig.depositPrice) || 1000;
  const soloPrice = Number(tripConfig.packagePrice) || 6200;
  const squadPrice = Number(tripConfig.groupPackagePrice) || 5800;
  const groupThreshold = Number(tripConfig.groupSizeThreshold) || 3;
  const squadSaving = Math.max(0, soloPrice - squadPrice);
  const soloBalance = Math.max(0, soloPrice - depPrice);
  const squadBalance = Math.max(0, squadPrice - depPrice);
  const activeBusCount = await safeDbQuery(
    () => db.bus.count({ where: { status: 'ACTIVE' } }),
    2,
    1000
  );

  // Retrieve user session from cookie if logged in
  const cookieStore = await cookies();
  const token =
    cookieStore.get('gla_user_session')?.value ||
    cookieStore.get('user_session')?.value;
  const userSession = token ? verifyUserSession(token) : null;

  return (
    <div className="w-full flex flex-col bg-[#F7F5EF] text-[#171918]">
      {/* ======================================================== */}
      {/* 1. HERO SECTION (EDITORIAL HIMALAYAN CHRISTMAS SPECIAL)  */}
      {/* ======================================================== */}
      <section className="relative isolate min-h-[85vh] overflow-hidden bg-[#061412] px-5 pb-24 pt-28 text-center text-white sm:min-h-[90vh] sm:px-8 sm:pb-32 sm:pt-36">
        <div className="absolute inset-0 -z-20">
          <img
            src="/hero-mountain.jpg"
            alt="A forested Himalayan valley and snow mountains in winter"
            className="h-full w-full object-cover object-[center_38%] scale-105 transition-transform duration-1000 ease-out"
          />
        </div>
        {/* Multi-layer Glacial & Festive Atmosphere */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,17,14,0.60)_0%,rgba(6,20,18,0.30)_35%,rgba(5,17,14,0.70)_75%,#061412_100%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] bg-gradient-radial from-cyan-400/15 via-emerald-500/8 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-black/50 to-transparent" />
        <SnowEffect />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-7">
          {/* Top Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#f1c39e] shadow-xl backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#D87945]" />
              Christmas Special 2026
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-100 shadow-xl backdrop-blur-md sm:text-xs">
              <Mountain className="h-3.5 w-3.5 text-[#f0b588]" />
              6 Days / 5 Nights
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-950/45 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100 shadow-xl backdrop-blur-md sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              {availableSeats} of {availability.totalCapacity} seats available
            </span>
          </div>

          {/* Editorial Headline & Supporting Copy */}
          <div className="max-w-5xl space-y-4">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.28em] text-[#f0b588]">
              GLA University, Mathura <span className="px-1 text-white/50">•</span> Departure 12:00 PM <span className="px-1 text-white/50">•</span> Flat ₹6,200
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-md leading-[1.1]">
              ESCAPE THE ORDINARY.<br />
              <span className="text-[#f1c39e]">EXPERIENCE THE HIMALAYAS.</span>
            </h1>
            <p className="text-lg sm:text-2xl font-bold tracking-tight text-white/95">
              6 Days. 5 Nights. Endless Memories.
            </p>
            <p className="mx-auto max-w-3xl text-sm sm:text-base font-normal leading-relaxed text-stone-200/90 pt-1">
              From riverside camping in Kasol to snow adventures in Manali, celebrate Christmas surrounded by the magic of the mountains.
            </p>
          </div>

          {/* Three Live Conversion CTAs */}
          <div className="flex w-full flex-col sm:flex-row items-center justify-center gap-3 pt-2 sm:w-auto">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#f1c39e] px-8 py-4 text-sm font-black text-[#17231f] shadow-2xl transition hover:bg-white hover:scale-105 active:scale-95"
            >
              <span>Book Your Adventure (₹1,000 Advance)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#itinerary"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              Explore Itinerary
            </Link>
            <a
              href={`https://wa.me/91${CONTACT_INFO.organizerPhone}?text=Hi%20Saurabh,%20I'm%20interested%20in%20the%20Himalayan%20Escape%20Christmas%20Special%20trip.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/70 px-6 py-4 text-sm font-bold text-emerald-200 shadow-md backdrop-blur-md transition hover:bg-emerald-900/90 hover:text-white hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-4 w-4 text-emerald-300" />
              <span>Enquire on WhatsApp</span>
            </a>
          </div>

          {/* Quick Floating Coordinator Status Badge */}
          <div className="w-full max-w-xl mx-auto rounded-full border border-white/15 bg-white/[0.06] p-2 sm:px-6 sm:py-2.5 shadow-lg backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-stone-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Student Lead Coordinators Active:</span>
              <span className="text-[#f1c39e] font-bold">Saurabh Pandey</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${CONTACT_INFO.organizerPhone}`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-white hover:text-[#f1c39e] transition-colors"
              >
                <Phone className="h-3 w-3 text-[#f1c39e]" />
                <span>+91 {CONTACT_INFO.organizerPhone}</span>
              </a>
            </div>
          </div>

          {/* Departure Station Banner */}
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
            Assembly & Departure: GLA University, Mathura at 12:00 PM • Return: Manali at 04:00 PM on Day 5
          </p>

          <div className="w-full max-w-xl pt-1 sm:max-w-2xl">
            <MountainWeatherWidget />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3 STAT COUNTER CARDS                                     */}
      {/* ======================================================== */}
      <div className="relative z-20 mx-auto -mt-10 grid w-full max-w-5xl grid-cols-1 gap-3 px-4 sm:grid-cols-3 sm:px-6">
        {[
          { value: '06', label: 'Days on the road', icon: Calendar },
          { value: '05', label: 'Nights in the mountains', icon: Mountain },
          { value: String(availableSeats).padStart(2, '0'), label: 'Seats currently available', icon: Bus },
        ].map(({ value, label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-[#e7e1d7] bg-white/95 px-5 py-4 shadow-[0_15px_40px_rgba(18,42,34,0.10)] backdrop-blur">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3ef] text-[#163C32]"><Icon className="h-5 w-5" /></span>
            <div><strong className="block text-xl font-semibold tracking-tight text-[#163C32]">{value}</strong><span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#6c756f]">{label}</span></div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* QUICK STUDENT COORDINATOR CONTACT BAR (IN BODY)          */}
      {/* ======================================================== */}
      <div className="mx-auto mt-6 w-full max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 rounded-2xl border border-[#163C32]/15 bg-[#edf3ef]/85 p-4 sm:px-6 sm:py-3.5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#163C32] text-white shadow-sm">
              <Phone className="h-5 w-5 text-[#f1c39e]" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D87945]">Lead Student Organizer</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Instant Help</span>
              </div>
              <p className="text-xs text-[#171918]/80 font-medium">
                Got questions or booking seats with friends? Call or WhatsApp <strong>Saurabh Pandey: +91 8126854850</strong> or Helpline: <strong>+91 6398412828</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 shrink-0 font-semibold tabular-nums">
            <a
              href="tel:8126854850"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#163C32] px-3.5 py-1.5 text-xs font-bold text-white shadow transition-all hover:bg-[#1f5245] hover:scale-105 active:scale-95"
            >
              <Phone className="h-3.5 w-3.5 text-[#f1c39e]" />
              <span>Call 8126854850</span>
            </a>
            <a
              href="https://wa.me/918126854850?text=Hi%20Saurabh,%20I'm%20interested%20in%20the%20Himalayan%20Escape%20Christmas%20Special%20trip."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-200" />
              <span>WhatsApp</span>
            </a>
            <a
              href="tel:6398412828"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#163C32]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#163C32] shadow-sm transition-all hover:bg-stone-50 hover:scale-105 active:scale-95"
              title="Alternative Helpline"
            >
              <span>6398412828</span>
            </a>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 8 HOMEPAGE HIGHLIGHTS CARDS SECTION                      */}
      {/* ======================================================== */}
      <section className="mx-auto mt-14 w-full max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#163C32]/15 bg-[#edf3ef] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#163C32]">
            <Compass className="h-3.5 w-3.5 text-[#D87945]" />
            Expedition Highlights
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
            Eight Unforgettable Mountain Chapters
          </h2>
          <p className="text-sm text-[#646864]">
            Carefully curated for college explorers. From riverside camps to high-altitude snow passes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOMEPAGE_HIGHLIGHTS.map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#D8D2C4] bg-white shadow-sm transition-all duration-300 hover:border-[#163C32] hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-[#163C32] backdrop-blur-md shadow-sm">
                  {item.tag}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <h3 className="text-base font-bold text-[#171918] group-hover:text-[#163C32] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#646864] leading-relaxed pt-1 font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* DEDICATED CHRISTMAS CAMPAIGN SECTION                     */}
      {/* ======================================================== */}
      <section className="mx-auto mt-16 w-full max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0A1F1B] border border-emerald-800/40 text-white p-8 sm:p-12 shadow-2xl">
          <div className="absolute inset-0 -z-10 opacity-30">
            <img
              src="https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1600&q=80"
              alt="Christmas lights and mountain winter night"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#061412] via-[#061412]/85 to-transparent" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#f1c39e] backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#D87945]" />
              Christmas Holiday Special
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              THIS CHRISTMAS, TRADE CITY LIGHTS FOR MOUNTAIN NIGHTS.
            </h2>
            <p className="text-sm sm:text-base text-stone-200/90 leading-relaxed font-light">
              Celebrate the most magical time of the year with riverside camping, mountain adventures, festive vibes and unforgettable memories.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-md">
                <span className="block font-bold text-[#f1c39e]">Riverside Bonfires</span>
                <span className="text-[11px] text-stone-300">Starlit camps in Kasol</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-md">
                <span className="block font-bold text-[#f1c39e]">Mall Road Lights</span>
                <span className="text-[11px] text-stone-300">Festive Manali carols</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-md col-span-2 sm:col-span-1">
                <span className="block font-bold text-[#f1c39e]">Snow Trails</span>
                <span className="text-[11px] text-stone-300">Solang Valley & Sissu</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 rounded-full bg-[#f1c39e] px-7 py-3.5 text-xs font-black text-[#17231f] shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95"
              >
                <span>CLAIM YOUR CHRISTMAS SEAT (₹1,000 ADVANCE)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* EXPEDITION PRICING SECTION                               */}
      {/* ======================================================== */}
      <section id="pricing" className="mx-auto mt-16 w-full max-w-5xl px-4 sm:px-6 scroll-mt-24">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#163C32]/15 bg-[#edf3ef] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#163C32]">
            <Tag className="h-3.5 w-3.5 text-[#D87945]" />
            Transparent Expedition Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
            Clear prices. Full adventure.
          </h2>
          <p className="text-sm sm:text-base text-[#646864] leading-relaxed">
            Lock your seat with a ₹{depPrice.toLocaleString('en-IN')} advance deposit today. Flat ₹{soloPrice.toLocaleString('en-IN')} all-inclusive per traveller. Pay the remaining ₹{soloBalance.toLocaleString('en-IN')} balance before boarding at GLA University.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* Card 1: Solo Explorer */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#e2ddd3] bg-white p-7 sm:p-8 shadow-[0_15px_45px_rgba(21,57,47,0.06)] transition-all hover:border-[#163C32]/30 hover:shadow-[0_20px_50px_rgba(21,57,47,0.10)]">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#163C32]">
                    SOLO & DUO TRAVELLERS
                  </span>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#171918]">
                    Standard Package
                  </h3>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3ef] text-[#163C32]">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#171918]">
                  ₹{soloPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-medium text-[#646864]">/ traveller</span>
              </div>

              <div className="mt-4 rounded-xl border border-[#163C32]/10 bg-[#edf3ef]/60 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#163C32]">Advance Reservation Deposit</span>
                  <span className="font-bold text-[#171918]">₹{depPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-[#646864]">
                  <span>Balance due before boarding</span>
                  <span className="font-semibold text-[#163C32]">₹{soloBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#163C32]">
                  What&apos;s Included:
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#484b48]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#163C32]" />
                    <span>Round-trip AC Traveller bus from GLA University</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#163C32]" />
                    <span>1 Night Kasol Riverside Camps + 2 Nights Manali Hotel</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#163C32]" />
                    <span>Total 3 Dinners + 3 Breakfasts included (Pure Veg)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#163C32]" />
                    <span>Solang Valley, Atal Tunnel, Sissu & Jogini Waterfall</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#163C32]" />
                    <span>Bonfire, DJ night, Christmas celebration on Mall Road</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-2">
              <Link
                href="/book"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#163C32] bg-[#163C32] px-5 py-3.5 text-sm font-bold text-white shadow transition-all hover:bg-[#1f5245] hover:shadow-md"
              >
                Reserve Seat · ₹{depPrice.toLocaleString('en-IN')} Advance <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Squad Advantage */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border-2 border-[#163C32] bg-[#163C32] p-7 sm:p-8 text-white shadow-[0_20px_50px_rgba(22,60,50,0.22)]">
            <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1c39e] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#17231f]">
                    <Sparkles className="h-3 w-3" />
                    Student Squad Deal • Auto-Applied
                  </span>
                  <h3 className="mt-2.5 text-2xl font-bold tracking-tight text-white">
                    The Squad Rate
                  </h3>
                  <p className="text-xs text-stone-200/80 font-medium">
                    {groupThreshold}+ travellers booking together under one pass
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#f1c39e]">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  ₹{squadPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-medium text-stone-300">/ traveller</span>
                {squadSaving > 0 && (
                  <span className="ml-2 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                    Save ₹{squadSaving.toLocaleString('en-IN')}/head
                  </span>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">Deposit Per Head</span>
                  <span className="font-bold text-[#f1c39e]">₹{depPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-stone-300">
                  <span>Balance due before boarding</span>
                  <span className="font-semibold text-white">₹{squadBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#f1c39e]">
                  Squad Advantages:
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-50/90">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#f1c39e]" />
                    <span>Guaranteed adjacent seats for your whole group</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#f1c39e]" />
                    <span>Synchronized room and camp allocations</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#f1c39e]" />
                    <span>Single checkout with ₹{depPrice.toLocaleString('en-IN')}/seat advance</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#f1c39e]" />
                    <span>All meals & excursions included without surcharge</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#f1c39e]" />
                    <span>Dedicated group trip coordinator support</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative z-10 mt-8 space-y-2 pt-2">
              <Link
                href="/book"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f1c39e] px-5 py-3.5 text-sm font-bold text-[#17231f] shadow-lg transition-all hover:bg-white hover:shadow-xl"
              >
                Book Squad Seats · ₹{depPrice.toLocaleString('en-IN')}/traveller <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections with Standard Spacing */}
      <div className="w-full space-y-20 sm:space-y-28 pt-16 sm:pt-20">
        {/* ======================================================== */}
        {/* 2. TRIP OVERVIEW SECTION                                 */}
        {/* ======================================================== */}
        <section id="trip-overview" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs font-semibold text-[#163C32] uppercase tracking-widest">
              THE EXPEDITION
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
              Six days. One unforgettable escape.
            </h2>
            <div className="space-y-3 text-base text-[#171918]/80 leading-relaxed font-normal">
              <p>
                <strong>Himalayan Escape – Christmas Special 2026</strong> is an independent student mountain expedition departing from <strong>GLA University, Mathura at 12:00 PM</strong>. Journey into Himachal Pradesh with guaranteed comfortable AC Traveller transport and curated college exploration.
              </p>
              <p>
                From riverside camping in Kasol and the spiritual hot springs of Manikaran Sahib to a 3-star riverside hotel in Manali with three gardens, high-altitude snow slopes in Solang Valley, the 9.02 km Atal Tunnel into Sissu, and the picturesque Jogini Waterfall trail.
              </p>
              <p className="text-sm font-semibold text-[#163C32] bg-[#edf3ef] p-4 rounded-xl border border-[#163C32]/15">
                Route: GLA University, Mathura (12:00 PM) → Kasol Riverside → Manikaran Sahib → Manali (3-Garden Hotel) → Solang Valley → Sissu → Jogini Waterfall → GLA University Mathura
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. DESTINATION HIGHLIGHTS CAROUSEL                       */}
        {/* ======================================================== */}
        <DestinationCarousel />

        {/* ======================================================== */}
        {/* 4. ITINERARY (VERTICAL TIMELINE PREVIEW)                 */}
        {/* ======================================================== */}
        <section id="itinerary" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#163C32] uppercase tracking-widest">
                DAY-BY-DAY SCHEDULE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
                Six Days in the Himalayas
              </h2>
              <p className="text-sm text-[#646864] max-w-xl">
                Departure: 12:00 PM from GLA University, Mathura • Return: 04:00 PM from Manali on Day 5
              </p>
            </div>
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-1.5 font-bold text-sm text-[#163C32] hover:text-[#D87945] transition-colors shrink-0"
            >
              <span>View Full Interactive Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Timeline Items */}
          <div className="relative border-l-2 border-[#163C32]/25 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-10">
            {ITINERARY_DAYS.map((day) => (
              <div key={day.dayNumber} className="relative group">
                <div className="absolute -left-[31px] sm:-left-[47px] top-1 w-6 h-6 rounded-full bg-[#163C32] border-4 border-[#F7F5EF] flex items-center justify-center text-white" />

                <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-3 shadow-sm hover:border-[#163C32] transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#163C32] text-white tracking-wide">
                        DAY 0{day.dayNumber}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-[#171918]">
                        {day.title}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#edf3ef] text-[#163C32]">
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
              <strong>Operating & Safety Policy:</strong> Atal Tunnel and Sissu (Lahaul Valley) excursions are subject to local district administration & BRO snow clearance. Rohtang Pass is an alternative strictly subject to opening and permits. Adventure activities in Solang are self-paid.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. WHAT'S INCLUDED SECTION                               */}
        {/* ======================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#163C32] uppercase tracking-widest">
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
                <h3 className="font-bold text-base text-[#171918]">Round-trip AC Traveller Bus</h3>
              </div>
              <p className="text-xs text-[#646864] pl-7.5 leading-relaxed">
                Departure from GLA University, Mathura at 12:00 PM to Kasol, Manali, and safe return back to campus.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#163C32] shrink-0" />
                <h3 className="font-bold text-base text-[#171918]">Riverside Camps & 3-Star Hotel</h3>
              </div>
              <p className="text-xs text-[#646864] pl-7.5 leading-relaxed">
                1 Night Kasol riverside camping with DJ bonfire + 2 Nights in a premium 3-star riverside hotel in Manali with three gardens.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#163C32] shrink-0" />
                <h3 className="font-bold text-base text-[#171918]">3 Dinners + 3 Breakfasts</h3>
              </div>
              <p className="text-xs text-[#646864] pl-7.5 leading-relaxed">
                Pure vegetarian buffets at camp and hotel. Note: No food served during road transit from our side.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#163C32] shrink-0" />
                <h3 className="font-bold text-base text-[#171918]">QR Digital Boarding Pass & Safety</h3>
              </div>
              <p className="text-xs text-[#646864] pl-7.5 leading-relaxed">
                Guaranteed reserved coach seat number, instant digital QR pass for check-in, and 24/7 student coordinators.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. COACH SEATING PREVIEW                                 */}
        {/* ======================================================== */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#D8D2C4] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#163C32] uppercase tracking-widest">
                  COMFORT ON THE ROAD
                </span>
                <h3 className="text-2xl font-black text-[#171918]">
                  Choose your coach seat
                </h3>
                <p className="text-xs text-[#646864]">
                  Interactive BookMyShow-style seat map with real-time seat locks and 10-minute hold guarantee.
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
                <span className="text-xs font-bold text-[#163C32]">Window or Aisle Selection</span>
                <p className="text-xs text-[#646864]">Select your exact seat position in real time.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-1">
                <span className="text-xs font-bold text-[#163C32]">10-Minute Hold Guarantee</span>
                <p className="text-xs text-[#646864]">Seats remain locked exclusively for you during checkout.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-1">
                <span className="text-xs font-bold text-[#163C32]">{activeBusCount} {activeBusCount === 1 ? 'Coach' : 'Coaches'} Available</span>
                <p className="text-xs text-[#646864]">Departure from GLA University, Mathura.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 7. CAMPUS GUIDELINES & COORDINATION                      */}
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
              All travellers report at <strong>{tripConfig.pickupLocation}</strong> on December 24, 2026 at <strong>{tripConfig.reportingTime}</strong> with valid college/student ID and digital QR boarding pass. Luggage tags will be assigned during coach boarding. Return departure from Manali is scheduled at <strong>04:00 PM on Day 5</strong>. For coordination, contact Lead Student Organizer <strong>Saurabh Pandey: +91 8126854850</strong> or Helpline: <strong>+91 6398412828</strong>.
            </p>
            <p className="text-[11px] text-[#171918]/60 italic border-t border-[#D8D2C4] pt-2">
              * Independent student-organized expedition. Remaining balance of ₹5,200 must be cleared before boarding coach.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 8. READY TO BOOK CALL-TO-ACTION                          */}
        {/* ======================================================== */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171918]">
            Ready for the Christmas Mountains?
          </h2>
          <p className="text-sm text-[#646864] max-w-md mx-auto">
            Reserve your seat with a ₹{depPrice.toLocaleString('en-IN')} advance deposit today. Remaining ₹{soloBalance.toLocaleString('en-IN')} balance due before boarding at GLA University.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-[#D87945] hover:bg-[#C26735] text-white font-extrabold text-sm shadow-md transition-all tracking-wider"
            >
              <span>RESERVE YOUR SEAT NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`https://wa.me/91${CONTACT_INFO.organizerPhone}?text=Hi%20Saurabh,%20I%20want%20to%20book%20seats%20for%20the%20Christmas%20Special%20Himalayan%20Escape.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-[#163C32]/30 bg-white hover:bg-stone-50 text-[#163C32] font-bold text-sm shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Coordinator</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
