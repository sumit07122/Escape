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
  Check, UserRound, Sparkles, Tag,
  Phone, MessageCircle
} from 'lucide-react';
import { TRIP_METADATA, CONTACT_INFO, ITINERARY_DAYS } from '@/lib/constants';
import { getSeatAvailability } from '@/lib/trip-config';
import { db, safeDbQuery } from '@/lib/db';
import { verifyUserSession } from '@/lib/auth';
import HomeScenicCarousel from '@/components/HomeScenicCarousel';
import DestinationCarousel from '@/components/DestinationCarousel';
import SnowEffect from '@/components/SnowEffect';
import MountainWeatherWidget from '@/components/MountainWeatherWidget';

export default async function HomePage() {
  const availability = await getSeatAvailability();
  const tripConfig = availability.tripConfig;
  const availableSeats = availability.availableSeats;
  const depPrice = Number(tripConfig.depositPrice) || 1000;
  const soloPrice = Number(tripConfig.packagePrice) || 6200;
  const squadPrice = Number(tripConfig.groupPackagePrice) || 6200;
  const groupThreshold = Number(tripConfig.groupSizeThreshold) || 1;
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
      <section className="relative isolate min-h-[82vh] overflow-hidden bg-[#061412] px-5 pb-24 pt-28 text-center text-white sm:min-h-[88vh] sm:px-8 sm:pb-28 sm:pt-32">
        <div className="absolute inset-0 -z-20">
          <img src="/hero-mountain.jpg" alt="A forested Himalayan valley and snow mountains" className="h-full w-full object-cover object-[center_38%] scale-105 transition-transform duration-1000 ease-out" />
        </div>
        {/* Multi-layer Glacial Ambient Atmosphere */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,17,14,0.55)_0%,rgba(6,20,18,0.25)_35%,rgba(5,17,14,0.65)_70%,#061412_100%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] bg-gradient-radial from-cyan-400/12 via-emerald-500/6 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-black/40 to-transparent" />
        <SnowEffect />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-100 shadow-xl backdrop-blur-md sm:text-xs">
              <Mountain className="h-4 w-4 text-[#f0b588]" />
              Independent student expedition
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-950/45 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100 shadow-xl backdrop-blur-md sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              {availableSeats} of {availability.totalCapacity} seats available
            </span>
          </div>

          <div className="max-w-5xl space-y-5">
            {userSession ? (
              <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-950/55 px-4 py-2 text-xs font-semibold text-emerald-100 shadow-lg backdrop-blur-md sm:text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Welcome aboard, {userSession.name?.split(' ')[0] || 'traveller'}
              </p>
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#f0b588] sm:text-xs">
                Manali <span className="px-1 text-white/50">/</span> Kasol <span className="px-1 text-white/50">/</span> 2026
              </p>
            )}
            <h1 className="hero-title mx-auto max-w-6xl">
              {tripConfig.tripTitle || 'Himalayan Escape'}
            </h1>
            <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-stone-100/90 sm:text-xl md:text-2xl">
              {tripConfig.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/75 sm:text-xs">
              <span>6 days</span><span className="h-1 w-1 rounded-full bg-[#f0b588]" />
              <span>5 nights</span><span className="h-1 w-1 rounded-full bg-[#f0b588]" />
              <span>Manali to Kasol</span>
            </div>
          </div>

          <div className="flex w-full flex-col justify-center gap-3 pt-1 sm:w-auto sm:flex-row">
            {userSession ? (
              <>
                <Link href="/my-bookings" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f1c39e] px-7 py-4 text-sm font-bold text-[#17231f] shadow-xl transition hover:bg-white">
                  Go to my bookings <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/book" className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20">
                  Book another seat
                </Link>
              </>
            ) : (
              <>
                <Link href="/book" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f1c39e] px-8 py-4 text-sm font-bold text-[#17231f] shadow-xl transition hover:bg-white">
                  Reserve · ₹{depPrice.toLocaleString('en-IN')} advance <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#trip-overview" className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20">
                  Explore the expedition
                </Link>
              </>
            )}
          </div>

          {/* Seamless Floating Alpine Coordinator Dock */}
          <div className="w-full max-w-2xl mx-auto rounded-3xl sm:rounded-full border border-white/15 bg-white/[0.05] p-3 sm:py-2.5 sm:pl-6 sm:pr-3 shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl transition-all duration-300 hover:border-emerald-400/40 hover:bg-white/[0.08] animate-alpine-float">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </span>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1c39e]">
                    <span>Campus Coordinators Live</span>
                    <span className="text-white/40">·</span>
                    <span className="text-emerald-300 font-semibold lowercase tracking-normal">instant help</span>
                  </div>
                  <p className="text-xs text-stone-200/90 font-medium">
                    Questions or group booking? Talk directly to student leads.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-semibold tabular-nums">
                <a
                  href={`tel:${tripConfig.emergencyHelplines[0] || CONTACT_INFO.coordinatorPhone1}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f1c39e] px-4 py-2 text-xs font-bold text-[#17231f] shadow-md transition-all hover:bg-white hover:scale-105 active:scale-95"
                  title="Direct Phone Call"
                >
                  <Phone className="h-3.5 w-3.5 text-[#163C32]" />
                  <span>Call +91 {tripConfig.emergencyHelplines[0] || CONTACT_INFO.coordinatorPhone1}</span>
                </a>
                <a
                  href={`https://wa.me/91${tripConfig.emergencyHelplines[1] || CONTACT_INFO.coordinatorPhone2}?text=Hi%20Coordinator,%20I'm%20interested%20in%20the%20Himalayan%20Escape%20trip.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-950/70 px-4 py-2 text-xs font-bold text-emerald-200 shadow-md backdrop-blur-md transition-all hover:bg-emerald-900/90 hover:text-white hover:scale-105 active:scale-95"
                  title="WhatsApp Coordinator"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/65 sm:text-xs">
            Departing from {tripConfig.pickupLocation} - {tripConfig.reportingTime}
          </p>
          <div className="w-full max-w-xl pt-1 sm:max-w-2xl">
            <MountainWeatherWidget />
          </div>
        </div>
      </section>

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
                Got questions or booking seats with friends? Call or WhatsApp <strong>Lead Coordinator: +91 8126854850</strong> or Helpline: <strong>+91 6398412828</strong>
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
              href="https://wa.me/918126854850?text=Hi%20Coordinator,%20I'm%20interested%20in%20the%20Himalayan%20Escape%20trip."
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
      {/* EXPEDITION PRICING SECTION - LITTLE UNDER HERO           */}
      {/* ======================================================== */}
      <section id="pricing" className="mx-auto mt-12 w-full max-w-5xl px-4 sm:px-6 scroll-mt-24">
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
            Lock your seat with a ₹{depPrice.toLocaleString('en-IN')} advance deposit today. Flat ₹{soloPrice.toLocaleString('en-IN')} all-inclusive per traveller. Pay the remaining ₹{soloBalance.toLocaleString('en-IN')} balance before boarding.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* Card 1: Solo Explorer */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[#e2ddd3] bg-white p-7 sm:p-8 shadow-[0_15px_45px_rgba(21,57,47,0.06)] transition-all hover:border-[#163C32]/30 hover:shadow-[0_20px_50px_rgba(21,57,47,0.10)]">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">
                    Solo & Duo Travellers
                  </span>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#163C32]">
                    Solo Explorer
                  </h3>
                  <p className="mt-0.5 text-xs text-[#748078]">
                    1 to {groupThreshold - 1} travellers
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf3ef] text-[#163C32]">
                  <UserRound className="h-5 w-5" />
                </span>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#17251f]">
                  ₹{soloPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-medium text-[#77817b]">/ traveller</span>
              </div>

              {/* Deposit Pill */}
              <div className="mt-3 inline-flex flex-wrap items-center gap-1.5 rounded-xl bg-[#f5f4ef] px-3.5 py-2 text-xs font-semibold text-[#526058] border border-[#e8e4da]">
                <span className="text-[#163C32] font-bold">₹{depPrice.toLocaleString('en-IN')} advance</span>
                <span className="text-[#a0a8a3]">·</span>
                <span>₹{soloBalance.toLocaleString('en-IN')} due before departure</span>
              </div>

              <div className="my-6 h-px bg-[#eeebe2]" />

              {/* Inclusions */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#718078]">
                  What&apos;s included:
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#4b5852]">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#245b4a]" />
                    <span>Dedicated AC coach seat (pick window or aisle)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#245b4a]" />
                    <span>5 nights (3-star Manali hotel + Kasol camp + overnight journeys)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#245b4a]" />
                    <span>3 Dinners (Pure Veg) & 3 Breakfasts included</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#245b4a]" />
                    <span>Solang Valley, Atal Tunnel & Kasol excursions</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#245b4a]" />
                    <span>Instant digital QR boarding pass on phone</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-2">
              <Link
                href="/book"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#163C32] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#205345] hover:shadow-lg"
              >
                Choose Your Seat <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Student Squad Deal (Highlighted) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#153a30] p-7 sm:p-8 text-white shadow-[0_24px_65px_rgba(14,47,38,0.24)] border border-emerald-400/20">
            {/* Background ambient decorative shapes */}
            <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-6 h-36 w-36 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />

            <div className="relative z-10">
              {/* Highlight Badge */}
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#f1c39e] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#1d2e27]">
                <Sparkles className="h-3.5 w-3.5" />
                Student Squad Deal · Auto-Applied
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1c39e]">
                    Group Advantage
                  </span>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight !text-white text-white">
                    The Squad Rate
                  </h3>
                  <p className="mt-0.5 text-xs text-emerald-100/85">
                    {groupThreshold}+ travellers on a single booking
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#f1c39e]">
                  <Users className="h-5 w-5" />
                </span>
              </div>

              {/* Price & Savings */}
              <div className="mt-6 flex flex-wrap items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight !text-white text-white">
                  ₹{squadPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-medium text-emerald-100/80">/ traveller</span>
                <span className="text-base font-semibold text-emerald-200/50 line-through">
                  ₹{soloPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Deposit Pill */}
              <div className="mt-3 inline-flex flex-wrap items-center gap-1.5 rounded-xl bg-black/25 px-3.5 py-2 text-xs font-semibold text-emerald-100/90 border border-white/10">
                <span className="text-[#f1c39e] font-bold">₹{depPrice.toLocaleString('en-IN')} advance</span>
                <span className="text-white/40">·</span>
                <span>₹{squadBalance.toLocaleString('en-IN')} due before departure</span>
              </div>

              {/* Savings Highlight Pill */}
              <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-emerald-400/25 bg-emerald-950/60 px-3.5 py-2 text-xs backdrop-blur-sm">
                <span className="font-semibold text-emerald-100">
                  Save ₹{squadSaving.toLocaleString('en-IN')} per seat (₹{(squadSaving * groupThreshold).toLocaleString('en-IN')} total)
                </span>
                <span className="shrink-0 rounded-full bg-[#f1c39e] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#1d2e27]">
                  No code needed
                </span>
              </div>

              <div className="my-6 h-px bg-white/10" />

              {/* Inclusions */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/70">
                  Everything in Solo, plus squad perks:
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-50/90">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#f1c39e]" />
                    <span>Guaranteed adjacent seats for your whole group</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-[#f1c39e]" />
                    <span>Synchronized room allocations in Manali & Kasol</span>
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

        {/* Value & Transparency Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#e2ddd3] bg-white/80 p-5 backdrop-blur-sm text-xs text-[#646864]">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-2 font-medium text-[#171918]">
              <ShieldCheck className="h-4 w-4 text-[#163C32]" />
              No Hidden Fees
            </span>
            <span className="flex items-center gap-2 font-medium text-[#171918]">
              <CheckCircle2 className="h-4 w-4 text-[#163C32]" />
              Pay ₹{depPrice.toLocaleString('en-IN')} Now · Rest Later
            </span>
            <span className="flex items-center gap-2 font-medium text-[#171918]">
              <Users className="h-4 w-4 text-[#163C32]" />
              Auto {groupThreshold}+ Group Discount
            </span>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 font-bold text-[#163C32] hover:text-[#D87945] transition-colors shrink-0"
          >
            Explore full pricing details & FAQs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Main Content Sections with Standard Spacing */}
      <div className="w-full space-y-20 sm:space-y-28 pt-16 sm:pt-20">
        {/* ======================================================== */}
        {/* 2. TRIP INTRODUCTION SECTION                             */}
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
                Himalayan Escape is an independent student mountain expedition departing {tripConfig.pickupLocation}. Travel from the plains of North India into the high valleys of Himachal Pradesh, with comfortable round-trip transport and time to explore together.
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
        <HomeScenicCarousel />

        {/* ======================================================== */}
        {/* 3.5. DESTINATION HIGHLIGHTS CAROUSEL                     */}
        {/* ======================================================== */}
        <DestinationCarousel />

        {/* ======================================================== */}
        {/* 4. ITINERARY (VERTICAL EDITORIAL TIMELINE)               */}
        {/* ======================================================== */}
        <section id="itinerary" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#163C32] uppercase tracking-widest">
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
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#163C32] text-white tracking-wide">
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
        {/* 4.5. STUDENT ESSENTIALS                                   */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* 6. WHAT'S INCLUDED SECTION                               */}
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
                <h3 className="font-bold text-base text-[#171918]">Round-trip AC coach travel</h3>
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
                <span className="text-xs font-semibold text-[#163C32] uppercase tracking-widest">
                  COMFORT ON THE ROAD
                </span>
                <h3 className="text-2xl font-black text-[#171918]">
                  Choose your coach seat
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
                <span className="text-xs font-bold text-[#163C32]">Pick your preferred seat</span>
                <p className="text-xs text-[#646864]">Choose a window or aisle seat during booking.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-1">
                <span className="text-xs font-bold text-[#163C32]">10-Minute Hold Guarantee</span>
                <p className="text-xs text-[#646864]">Seats remain locked exclusively for you during checkout.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-1">
                <span className="text-xs font-bold text-[#163C32]">{activeBusCount} {activeBusCount === 1 ? 'Coach' : 'Coaches'} Available</span>
                <p className="text-xs text-[#646864]">Live fleet count for the Mathura departure.</p>
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
            Your mountain escape starts with a ₹{depPrice.toLocaleString('en-IN')} advance reservation. Review the full price and remaining balance before you pay.
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
