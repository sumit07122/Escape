'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, AlertTriangle, ArrowRight,
  ChevronDown, ChevronUp, Compass, Clock, Utensils,
  Bed, Sparkles, Shield, DollarSign, Calendar, MessageCircle, Phone
} from 'lucide-react';
import { ITINERARY_DAYS, TRIP_METADATA, CONTACT_INFO } from '@/lib/constants';
import PackingChecklist from '@/components/PackingChecklist';

interface ItineraryItem {
  time?: string;
  activity: string;
  location: string;
  description?: string;
  isOptional?: boolean;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  subtitle: string;
  stayLocation: string;
  mealsConfig: string;
  description: string;
  items?: ItineraryItem[];
}

const DAY_IMAGES: Record<number, { url: string; alt: string; badge: string }> = {
  1: {
    url: '/images/cinematic-coach-mountains.jpg',
    alt: 'AC Traveller Coach departing for the Himalayas',
    badge: '12:00 PM GLA Flag-off',
  },
  2: {
    url: '/images/kasol-river.jpg',
    alt: 'Parvati River and Riverside Camping in Kasol',
    badge: 'Riverside Camp & DJ Night',
  },
  3: {
    url: '/images/old-manali.jpg',
    alt: 'Old Manali and Hadimba Pine Forest',
    badge: '3-Garden Riverside Hotel',
  },
  4: {
    url: '/images/solang-valley.jpg',
    alt: 'Solang Valley Snow Slopes and Atal Tunnel',
    badge: 'Atal Tunnel & Sissu Adventure',
  },
  5: {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    alt: 'Jogini Waterfall and Christmas celebrations in Manali',
    badge: 'Jogini Trek & Christmas Magic',
  },
  6: {
    url: '/images/cinematic-coach-mountains.jpg',
    alt: 'Safe arrival at GLA University Mathura',
    badge: 'GLA University Safe Return',
  },
};

const ROUTE_STEPS = [
  { name: 'GLA University', time: 'Day 1 • 12:00 PM', role: 'Departure' },
  { name: 'Kasol Riverside', time: 'Day 2 • Camping', role: 'Parvati Valley' },
  { name: 'Manikaran Sahib', time: 'Day 2 • Hot Springs', role: 'Spiritual Shrine' },
  { name: 'Manali Hotel', time: 'Day 3 • 3 Gardens', role: 'Riverside Stay' },
  { name: 'Solang & Sissu', time: 'Day 4 • Snow Slopes', role: 'Atal Tunnel' },
  { name: 'Jogini Waterfall', time: 'Day 5 • Nature Trek', role: 'Christmas Mall Road' },
  { name: 'Manali Departure', time: 'Day 5 • 04:00 PM', role: 'Return Coach' },
  { name: 'GLA Mathura', time: 'Day 6 • Morning', role: 'Arrival' },
];

export default function ItineraryPage() {
  const [days, setDays] = useState<ItineraryDay[]>(ITINERARY_DAYS as ItineraryDay[]);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [disclaimer, setDisclaimer] = useState(TRIP_METADATA.disclaimer);

  useEffect(() => {
    async function loadItinerary() {
      try {
        const res = await fetch('/api/itinerary');
        if (res.ok) {
          const data = await res.json();
          if (data.days && data.days.length > 0) {
            setDays(data.days);
          }
          if (data.disclaimer) {
            setDisclaimer(data.disclaimer);
          }
        }
      } catch {
        // Fallback to static SSOT
      }
    }
    loadItinerary();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12 bg-[#F7F5EF] text-[#171918]">
      {/* Header Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#163C32]/15 bg-[#edf3ef] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#163C32]">
          <Sparkles className="w-3.5 h-3.5 text-[#D87945]" />
          <span>Christmas Special 2026 • 6 Days / 5 Nights</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171918] tracking-tight">
          Complete 6-Day Himalayan Itinerary
        </h1>
        <p className="text-sm sm:text-base text-[#646864] max-w-2xl mx-auto leading-relaxed">
          From riverside camping under pine canopies in Kasol to high-altitude snow adventures in Solang Valley and Christmas festivities along Manali Mall Road.
        </p>

        {/* Departure Notice Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-white border border-[#D8D2C4] px-5 py-3 shadow-sm text-xs font-medium text-[#171918]">
          <span className="flex items-center gap-1.5 font-bold text-[#163C32]">
            <Clock className="w-4 h-4 text-[#D87945]" />
            Departure: 12:00 PM sharp (GLA University, Mathura)
          </span>
          <span className="text-[#D8D2C4] hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5 font-bold text-[#163C32]">
            <MapPin className="w-4 h-4 text-[#D87945]" />
            Return Departure: 04:00 PM (Manali on Day 5)
          </span>
        </div>
      </div>

      {/* Visual Journey Schematic Route */}
      <div className="p-6 rounded-3xl bg-white border border-[#D8D2C4] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#163C32]">
            <Compass className="w-4 h-4 text-[#D87945]" />
            <span>Official Journey Route & Connected Milestones</span>
          </div>
          <span className="text-[11px] font-semibold text-[#646864]">Round-trip AC Traveller</span>
        </div>

        {/* Mobile Horizontal Scroll Route Map */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-3 min-w-[760px] pt-2">
            {ROUTE_STEPS.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[#F7F5EF] border border-[#E7E2D8] w-28 shrink-0 transition-transform hover:scale-105">
                  <span className="text-[10px] font-black uppercase text-[#D87945]">{step.role}</span>
                  <strong className="text-xs font-bold text-[#171918] pt-1">{step.name}</strong>
                  <span className="text-[10px] text-[#646864] pt-0.5">{step.time}</span>
                </div>
                {idx < ROUTE_STEPS.length - 1 && (
                  <div className="w-6 h-0.5 bg-[#D8D2C4] relative shrink-0">
                    <span className="absolute -top-1 right-0 w-2 h-2 border-t-2 border-r-2 border-[#D8D2C4] transform rotate-45" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Crucial Operating & Weather Disclaimer */}
      <div className="p-6 rounded-2xl bg-[#E7E2D8] border border-[#D8D2C4] space-y-2.5">
        <div className="flex items-center gap-2 text-[#D87945] font-bold text-sm uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Crucial Safety & Operating Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-[#171918]/85 leading-relaxed">
          {disclaimer}
        </p>
        <div className="grid sm:grid-cols-2 gap-2 pt-1 text-xs text-[#646864]">
          <p>• <strong>Solang Valley Adventure Activities:</strong> Paragliding, skiing, and ATV rides are optional and operated by registered local operators at additional personal cost.</p>
          <p>• <strong>Atal Tunnel & Sissu:</strong> Regulated by Himachal Pradesh Police & BRO snow safety clearances. Rohtang Pass is an alternative strictly subject to opening and permits.</p>
        </div>
      </div>

      {/* 6-Day Connected Vertical Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#171918]">
            Day-by-Day Expedition Schedule
          </h2>
          <span className="text-xs font-bold text-[#646864]">Click any day to view details</span>
        </div>

        <div className="relative border-l-2 border-[#163C32]/20 ml-4 sm:ml-6 space-y-8 pl-4 sm:pl-8">
          {days.map((day) => {
            const isExpanded = expandedDay === day.dayNumber;
            const dayMedia = DAY_IMAGES[day.dayNumber] || DAY_IMAGES[1];

            return (
              <div key={day.dayNumber} className="relative group">
                {/* Stepper Node Marker */}
                <div className={`absolute -left-[25px] sm:-left-[41px] top-6 w-8 h-8 rounded-full border-4 border-[#F7F5EF] flex items-center justify-center text-xs font-black shadow-sm transition-all ${
                  isExpanded ? 'bg-[#D87945] text-white scale-110' : 'bg-[#163C32] text-white group-hover:bg-[#D87945]'
                }`}>
                  {day.dayNumber}
                </div>

                {/* Day Card */}
                <div
                  className={`rounded-3xl border transition-all overflow-hidden bg-white ${
                    isExpanded
                      ? 'border-[#163C32] shadow-[0_15px_40px_rgba(22,60,50,0.12)]'
                      : 'border-[#D8D2C4] hover:border-[#163C32]/50 hover:shadow-md'
                  }`}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                    className="p-6 sm:p-7 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 select-none"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black px-3 py-1 rounded-full bg-[#163C32] text-white uppercase tracking-wider">
                          DAY 0{day.dayNumber}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#edf3ef] text-[#163C32]">
                          <Bed className="w-3.5 h-3.5 text-[#D87945]" />
                          {day.stayLocation}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF3EC] text-[#D87945]">
                          <Utensils className="w-3.5 h-3.5" />
                          {day.mealsConfig}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-[#171918] tracking-tight">
                        {day.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#646864] font-medium">
                        {day.subtitle}
                      </p>
                    </div>

                    {/* Toggle Indicator */}
                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <span className="text-xs font-bold text-[#163C32] hidden sm:block">
                        {isExpanded ? 'Collapse' : 'Explore Day'}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-[#edf3ef] flex items-center justify-center text-[#163C32] transition-transform group-hover:scale-105">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Body */}
                  {isExpanded && (
                    <div className="px-6 pb-8 sm:px-8 space-y-6 border-t border-[#E7E2D8] pt-6">
                      {/* Day Visual Banner */}
                      <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden shadow-inner border border-[#D8D2C4]">
                        <img
                          src={dayMedia.url}
                          alt={dayMedia.alt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                          <span className="font-bold bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                            {dayMedia.badge}
                          </span>
                          <span className="text-white/80 font-medium hidden sm:inline">
                            Himalayan Escape Christmas Expedition
                          </span>
                        </div>
                      </div>

                      {/* Overview Paragraph */}
                      <p className="text-xs sm:text-sm text-[#171918]/85 leading-relaxed bg-[#F7F5EF] p-4 sm:p-5 rounded-2xl border border-[#D8D2C4]">
                        {day.description}
                      </p>

                      {/* Activity Timetable */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black text-[#163C32] uppercase tracking-wider">
                          <Clock className="w-4 h-4 text-[#D87945]" />
                          <span>Detailed Hourly Timeline:</span>
                        </div>

                        <div className="space-y-2.5">
                          {day.items?.map((item: ItineraryItem, idx: number) => (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4 p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7E2D8] transition-all hover:bg-white hover:border-[#163C32]/30"
                            >
                              <div className="px-3 py-1 rounded-lg bg-white border border-[#D8D2C4] font-mono text-xs font-bold text-[#163C32] shrink-0 sm:w-36 text-center sm:text-left">
                                {item.time || 'Activity'}
                              </div>

                              <div className="space-y-1 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-sm font-bold text-[#171918]">{item.activity}</h4>
                                  {item.isOptional && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D87945]/15 text-[#D87945] border border-[#D87945]/30 uppercase flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      Self-Paid Adventure
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#646864]">
                                  <MapPin className="w-3.5 h-3.5 text-[#D87945] shrink-0" />
                                  <span>{item.location}</span>
                                </div>
                                {item.description && (
                                  <p className="text-xs text-[#646864] pt-0.5 leading-relaxed">{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inclusions & Exclusions Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#D8D2C4] space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#163C32]">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Included in ₹6,200 Package</span>
          </div>
          <ul className="space-y-2 text-xs text-[#171918]/85">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>Round-trip AC Traveller transport from GLA University, Mathura</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>1 Night Riverside Camping in Kasol with bonfire & DJ night</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>2 Nights in a 3-star riverside hotel in Manali featuring 3 gardens</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>Total 3 Dinners + 3 Breakfasts (Pure Veg Buffets)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>Solang Valley, Atal Tunnel (9.02 km) & Sissu (Lahaul Valley) excursion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>Jogini Waterfall trek & Christmas celebration on Manali Mall Road</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>Guaranteed reserved coach seat with digital QR boarding ticket</span>
            </li>
          </ul>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#D8D2C4] space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#D87945]">
            <AlertTriangle className="w-4 h-4 text-[#D87945]" />
            <span>Package Exclusions</span>
          </div>
          <ul className="space-y-2 text-xs text-[#171918]/85">
            <li className="flex items-start gap-2">
              <span className="text-[#D87945] font-bold shrink-0">✗</span>
              <span>No meals during road travel/transit (Day 1 departure & Day 5 return journey)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D87945] font-bold shrink-0">✗</span>
              <span>Snow/Sports activities (Paragliding, skiing, ATV in Solang are self-paid)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D87945] font-bold shrink-0">✗</span>
              <span>No drinks, personal café hopping, tips or shopping expenses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D87945] font-bold shrink-0">✗</span>
              <span>Room heater charges at hotels or special room service orders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D87945] font-bold shrink-0">✗</span>
              <span>Any cost arising from natural landslides, severe roadblocks or weather diversions</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Packing Checklist */}
      <PackingChecklist />

      {/* Bottom Booking & Coordinator Dock */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#163C32] text-white text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f1c39e]">
            Christmas Mountain Expedition 2026
          </span>
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Celebrate Christmas in the Himalayas?
          </h3>
          <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed">
            Reserve your seat with just ₹1,000 today. Flat ₹6,200 total package. Remaining ₹5,200 balance due before boarding at GLA University.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/book"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#f1c39e] hover:bg-white text-[#17231f] font-bold text-sm shadow-lg transition-transform hover:scale-105"
          >
            <span>RESERVE SEAT (₹1,000 ADVANCE)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`https://wa.me/91${CONTACT_INFO.organizerPhone}?text=Hi%20Saurabh,%20I%20have%20questions%20about%20the%20Himalayan%20Escape%20Christmas%20Itinerary.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-300" />
            <span>Chat with Coordinator</span>
          </a>
        </div>
      </div>
    </div>
  );
}
