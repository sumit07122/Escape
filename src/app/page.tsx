export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import {
  Mountain, Calendar, ArrowRight, ShieldCheck,
  CheckCircle2, Bus, Users, AlertCircle
} from 'lucide-react';
import { TRIP_METADATA, CONTACT_INFO, ITINERARY_DAYS } from '@/lib/constants';
import { getSeatAvailability } from '@/lib/trip-config';
import { db } from '@/lib/db';
import { verifyUserSession } from '@/lib/auth';
import DestinationCarousel from '@/components/DestinationCarousel';
import SnowEffect from '@/components/SnowEffect';
import MountainWeatherWidget from '@/components/MountainWeatherWidget';

export default async function HomePage() {
  const availability = await getSeatAvailability();
  const tripConfig = availability.tripConfig;
  const availableSeats = availability.availableSeats;
  const depPrice = Number(tripConfig.depositPrice) || 1000;
  const soloPrice = Number(tripConfig.packagePrice) || 6500;
  const squadPrice = Number(tripConfig.groupPackagePrice) || 6200;
  const groupThreshold = Number(tripConfig.groupSizeThreshold) || 5;
  const squadSaving = Math.max(0, soloPrice - squadPrice);
  const activeBusCount = await db.bus.count({
    where: { status: 'ACTIVE' },
  }).catch(() => 0);

  // Retrieve user session from cookie if logged in
  const cookieStore = await cookies();
  const token =
    cookieStore.get('gla_user_session')?.value ||
    cookieStore.get('user_session')?.value;
  const userSession = token ? verifyUserSession(token) : null;


  return (
    <div className="w-full flex flex-col bg-[#F7F5EF] text-[#171918]">
      {/* ======================================================== */}
      <section className="relative isolate min-h-[82vh] overflow-hidden bg-[#091a17] px-5 pb-24 pt-28 text-center text-white sm:min-h-[88vh] sm:px-8 sm:pb-28 sm:pt-32">
        <div className="absolute inset-0 -z-20">
          <img src="/hero-mountain.jpg" alt="A forested Himalayan valley and river" className="h-full w-full object-cover object-[center_42%]" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,19,17,0.48)_0%,rgba(7,19,17,0.22)_30%,rgba(7,19,17,0.48)_60%,#091a17_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/30 to-transparent" />
        <SnowEffect />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-100 shadow-lg backdrop-blur-md sm:text-xs">
              <Mountain className="h-4 w-4 text-[#f0b588]" />
              Independent student expedition
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-950/35 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-50 backdrop-blur-md sm:text-xs">
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
                  Start your booking <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#trip-overview" className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20">
                  Explore the expedition
                </Link>
              </>
            )}
          </div>

          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/65 sm:text-xs">
            Departing from {tripConfig.pickupLocation} - {tripConfig.reportingTime}
          </p>
          <div className="w-full max-w-sm pt-1">
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

      <section className="mx-auto mt-12 w-full max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#163C32] px-6 py-7 text-white shadow-[0_22px_55px_rgba(14,38,32,0.18)] sm:px-9 sm:py-8">
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-1 -top-14 h-44 w-44 rounded-full border border-white/10" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1c39e]"><Users className="h-4 w-4" /> The group-chat upgrade</span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Bring {groupThreshold - 1} friends. Save ₹{squadSaving.toLocaleString('en-IN')} each.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">Book {groupThreshold} or more travellers together and the lower rate applies automatically — no code needed. That&apos;s ₹{(squadSaving * groupThreshold).toLocaleString('en-IN')} saved across a {groupThreshold}-person booking.</p>
            </div>
            <Link href="/pricing" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f1c39e] px-5 py-3 text-sm font-bold text-[#17231f] transition hover:bg-white">
              See the squad deal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

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
        {/* 4.5. STUDENT ESSENTIALS                                   */}
        {/* ======================================================== */}
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
                <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest font-mono">
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
