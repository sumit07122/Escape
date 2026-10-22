import React from 'react';
import Link from 'next/link';
import { Mountain, Users, Calendar, MapPin, Bus, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { TRIP_METADATA, PRICING_DEFAULTS, PACKING_LIST } from '@/lib/constants';

export const metadata = {
  title: 'Trip Details | GLA Himalayan Escape Manali × Kasol',
  description: 'Complete expedition specifications, vehicle configuration, packing list, and trip guidelines.',
};

export default function TripDetailsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
          EXPEDITION SPECIFICATION
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Trip Details & Overview
        </h1>
        <p className="text-sm text-zinc-400">
          GLA University Mathura to Himachal Pradesh Western Himalayas
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-6 border border-zinc-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Duration & Dates</h3>
          <p className="text-xs text-zinc-400">6 Days / 5 Nights total duration. Departure from GLA University campus.</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-zinc-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Trip Capacity</h3>
          <p className="text-xs text-zinc-400">Strictly 75 total travellers across 4 luxury tourist coaches.</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-zinc-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Bus className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Luxury 2×2 Coaches</h3>
          <p className="text-xs text-zinc-400">23 passenger seats + 1 driver + 1 conductor per bus. Reclining seats & AC.</p>
        </div>
      </div>

      {/* Packing List */}
      <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            PREPARATION CHECKLIST
          </span>
          <h2 className="text-2xl font-black text-white">Recommended Packing List</h2>
          <p className="text-xs text-zinc-400">
            Himalayan weather in Manali and Kasol drops significantly after sunset. Pack appropriately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PACKING_LIST.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3"
            >
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${item.essential ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{item.item}</span>
                  {item.essential && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/30 uppercase">
                      Essential
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg glow-orange"
        >
          <span>PROCEED TO SEAT BOOKING</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
