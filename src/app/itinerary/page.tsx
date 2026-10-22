'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, AlertTriangle, ArrowRight,
  ChevronDown, ChevronUp, Compass
} from 'lucide-react';
import { ITINERARY_DAYS, TRIP_METADATA } from '@/lib/constants';

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
        // Fallback to static
      }
    }
    loadItinerary();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12 bg-[#F7F5EF] text-[#171918]">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Compass className="w-4 h-4" /> DAY-BY-DAY EXPEDITION GUIDE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171918]">
          Complete 6-Day Itinerary
        </h1>
        <p className="text-sm text-[#646864] max-w-xl mx-auto">
          Pickup: Near GLA Main Gate, Mathura → Manali → Solang Valley → Atal Tunnel → Kasol → Manikaran → Mathura
        </p>
      </div>

      {/* Mandatory Weather & Road Disclaimers Banner */}
      <div className="p-6 rounded-2xl bg-[#E7E2D8] border border-[#D8D2C4] space-y-2">
        <div className="flex items-center gap-2 text-[#D87945] font-bold text-sm uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Crucial Safety & Operating Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-[#171918]/80 leading-relaxed">
          {disclaimer}
        </p>
        <p className="text-xs text-[#646864] italic pt-1">
          * High-altitude crossings like Atal Tunnel and Sissu (Lahaul Valley) as well as Beas river rafting are governed by Himachal Pradesh administration safety clearances. Optional adventure activities are separately chargeable on-site.
        </p>
      </div>

      {/* Days List */}
      <div className="space-y-5">
        {days.map((day) => {
          const isExpanded = expandedDay === day.dayNumber;
          return (
            <div
              key={day.dayNumber}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-white border-[#163C32] shadow-sm'
                  : 'bg-white border-[#D8D2C4] hover:border-[#B4AA96]'
              }`}
            >
              {/* Day Header Accordion Toggle */}
              <div
                onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                className="p-6 sm:p-7 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black px-2.5 py-1 rounded bg-[#163C32] text-white">
                      DAY 0{day.dayNumber}
                    </span>
                    <span className="text-xs font-semibold text-[#646864]">
                      {day.stayLocation}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#171918] pt-1">
                    {day.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#646864]">
                    {day.subtitle} • <strong className="text-[#D87945]">{day.mealsConfig}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-bold text-[#163C32] hidden sm:block">
                    {isExpanded ? 'Hide Schedule' : 'View Schedule'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#E7E2D8] flex items-center justify-center text-[#171918]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Day Details Body */}
              {isExpanded && (
                <div className="px-6 pb-7 sm:px-7 space-y-6 border-t border-[#E7E2D8] pt-6">
                  <p className="text-xs sm:text-sm text-[#171918]/85 leading-relaxed bg-[#F7F5EF] p-4 rounded-xl border border-[#D8D2C4]">
                    {day.description}
                  </p>

                  {/* Hourly activities list */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[#163C32] uppercase tracking-wider">
                      Timeline & Activities:
                    </h3>
                    <div className="space-y-2.5">
                      {day.items?.map((item: ItineraryItem, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4]"
                        >
                          <div className="px-2.5 py-1 rounded bg-white border border-[#D8D2C4] font-mono text-xs font-bold text-[#163C32] shrink-0">
                            {item.time || 'Schedule'}
                          </div>

                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-[#171918]">{item.activity}</h4>
                              {item.isOptional && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D87945]/15 text-[#D87945] border border-[#D87945]/30 uppercase">
                                  Optional Activity
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#646864]">
                              <MapPin className="w-3.5 h-3.5 text-[#D87945] shrink-0" />
                              <span>{item.location}</span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-[#646864] pt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="p-8 rounded-3xl bg-white border border-[#D8D2C4] text-center space-y-4">
        <h3 className="text-2xl font-black text-[#171918]">
          Ready for the Himalayan Adventure?
        </h3>
        <p className="text-xs sm:text-sm text-[#646864] max-w-md mx-auto">
          Reserve your preferred window or aisle seat with just ₹1,000 today.
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-sm shadow-md"
        >
          <span>CHOOSE SEAT & BOOK NOW</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
