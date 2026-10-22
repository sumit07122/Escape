'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, MapPin, AlertTriangle, ArrowRight,
  ChevronDown, ChevronUp, Sparkles, Compass
} from 'lucide-react';
import { ITINERARY_DAYS, TRIP_METADATA } from '@/lib/constants';

export default function ItineraryPage() {
  const [days, setDays] = useState<any[]>(ITINERARY_DAYS);
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
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Compass className="w-4 h-4" /> DAY-BY-DAY EXPEDITION GUIDE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Complete 6-Day Itinerary
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          GLA University Mathura → Manali → Solang Valley → Atal Tunnel → Kasol → Manikaran → Mathura
        </p>
      </div>

      {/* Mandatory Weather & Road Disclaimers Banner */}
      <div className="p-6 rounded-2xl bg-amber-950/40 border-2 border-amber-500/40 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Crucial Safety & Operating Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
          {disclaimer}
        </p>
        <p className="text-xs text-amber-300/80 italic pt-1">
          * High-altitude crossings like Atal Tunnel and Sissu (Lahaul Valley) as well as Beas river rafting are governed by Himachal Pradesh administration safety clearances. Optional adventure activities are separately chargeable on-site.
        </p>
      </div>

      {/* Days List */}
      <div className="space-y-6">
        {days.map((day) => {
          const isExpanded = expandedDay === day.dayNumber;
          return (
            <div
              key={day.dayNumber}
              className={`rounded-3xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-zinc-950/90 border-emerald-500/50 shadow-2xl shadow-emerald-950/40'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Day Header Accordion Toggle */}
              <div
                onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black px-3 py-1 rounded-lg bg-emerald-500 text-zinc-950">
                      DAY 0{day.dayNumber}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">
                      {day.stayLocation}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white pt-1">
                    {day.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    {day.subtitle} • <strong className="text-amber-400">{day.mealsConfig}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-bold text-emerald-400 hidden sm:block">
                    {isExpanded ? 'Hide Schedule' : 'View Schedule'}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Day Details Body */}
              {isExpanded && (
                <div className="px-6 pb-8 sm:px-8 space-y-6 border-t border-zinc-800/80 pt-6 animate-in fade-in duration-300">
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                    {day.description}
                  </p>

                  {/* Hourly activities list */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Timeline & Activities:
                    </h3>
                    <div className="space-y-3">
                      {day.items?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80"
                        >
                          <div className="px-2.5 py-1 rounded-lg bg-zinc-800 font-mono text-xs font-bold text-emerald-400 shrink-0">
                            {item.time || 'Schedule'}
                          </div>

                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{item.activity}</h4>
                              {item.isOptional && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                                  Optional Activity
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span>{item.location}</span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-zinc-400 pt-0.5">{item.description}</p>
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
      <div className="p-8 rounded-3xl glass-card border border-emerald-500/40 text-center space-y-4">
        <h3 className="text-2xl font-black text-white">
          Ready for the Himalayan Adventure?
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Reserve your preferred window or aisle seat with just ₹1,000 today.
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg glow-orange"
        >
          <span>CHOOSE SEAT & BOOK NOW</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
