import React from 'react';
import Link from 'next/link';
import { Users, Calendar, Bus, CheckCircle2, ArrowRight } from 'lucide-react';
import { PACKING_LIST } from '@/lib/constants';

export const metadata = {
  title: 'Trip Overview | Himalayan Escape — Student Mountain Expedition',
  description: 'Complete expedition specifications, vehicle configuration, packing list, and trip guidelines for Manali & Kasol.',
};

export default function TripOverviewPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12 bg-[#F7F5EF] text-[#171918]">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest">
          EXPEDITION SPECIFICATION
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171918]">
          Trip Overview
        </h1>
        <p className="text-sm text-[#646864]">
          Pickup & Reporting: Near Main Gate (NH-2), Mathura → Manali → Solang Valley → Kasol → Manikaran → Mathura
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#163C32]/10 text-[#163C32] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#171918] text-base">Duration & Schedule</h3>
          <p className="text-xs text-[#646864]">6 Days / 5 Nights total duration. Pickup & Reporting: Near Main Gate (NH-2), Mathura.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#D87945]/10 text-[#D87945] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#171918] text-base">Expedition Capacity</h3>
          <p className="text-xs text-[#646864]">Dedicated passenger capacity limit across luxury tourist coaches.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#163C32]/10 text-[#163C32] flex items-center justify-center">
            <Bus className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#171918] text-base">Luxury 2×2 Tourist Coaches</h3>
          <p className="text-xs text-[#646864]">23 passenger seats + 1 driver + 1 conductor per coach. Reclining pushback seats & AC.</p>
        </div>
      </div>

      {/* Packing List */}
      <div className="p-8 rounded-3xl bg-white border border-[#D8D2C4] space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#163C32] uppercase tracking-wider">
            PREPARATION CHECKLIST
          </span>
          <h2 className="text-2xl font-black text-[#171918]">Recommended Packing List</h2>
          <p className="text-xs text-[#646864]">
            Himalayan temperatures in Manali and Kasol drop significantly in the evening. Pack warm layers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PACKING_LIST.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] flex items-start gap-3"
            >
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${item.essential ? 'text-[#163C32]' : 'text-[#646864]'}`} />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#171918]">{item.item}</span>
                  {item.essential && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#163C32]/10 text-[#163C32] uppercase">
                      Essential
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#646864]">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-sm shadow-md transition-all"
        >
          <span>CHOOSE SEAT & BOOK NOW</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
