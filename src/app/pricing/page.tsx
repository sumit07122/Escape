import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles, Heart, Users, User, ShieldCheck } from 'lucide-react';
import { PRICING_DEFAULTS } from '@/lib/constants';

export const metadata = {
  title: 'Pricing & Special Offers | GLA Himalayan Escape',
  description: 'Single, Couple and 5+1 Group packages with transparent ₹1,000 reservation deposit and referral discounts.',
};

export default function PricingPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
          TRANSPARENT COLLEGE EXPEDITION PRICING
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Choose Your Plan
        </h1>
        <p className="text-sm text-zinc-400">
          Only ₹1,000 reservation required today. Balance payable before departure.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Single */}
        <div className="glass-card rounded-3xl p-8 border border-zinc-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Single Explorer</h3>
              <p className="text-xs text-zinc-400 mt-1">For individual travellers seeking adventure & friendship.</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">₹6,200</span>
                <span className="text-xs text-zinc-400">/ person</span>
              </div>
              <p className="text-xs font-bold text-orange-400 mt-1">Pay ₹1,000 reservation today</p>
              <p className="text-[11px] text-zinc-500">Remaining balance: ₹5,200</p>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Reserved Bus Seat (Interactive Selector)</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Manali & Kasol Resort Stay (Sharing Basis)</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Daily Breakfast & Dinner</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> All Sightseeing & Transfers</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Digital QR Ticket Pass</li>
            </ul>
          </div>

          <Link
            href="/book"
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center border border-zinc-700 block"
          >
            Select Single
          </Link>
        </div>

        {/* Couple */}
        <div className="glass-card rounded-3xl p-8 border-2 border-orange-500/60 shadow-xl shadow-orange-950/40 space-y-6 flex flex-col justify-between relative bg-gradient-to-b from-orange-950/20 to-zinc-950">
          <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider shadow">
            MOST POPULAR
          </span>

          <div className="space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Couple Package</h3>
              <p className="text-xs text-zinc-400 mt-1">Exclusive package for two travellers with private room.</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">₹6,500</span>
                <span className="text-xs text-zinc-400">total for 2 travellers</span>
              </div>
              <p className="text-xs font-bold text-orange-400 mt-1">Pay ₹1,000 reservation today</p>
              <p className="text-[11px] text-zinc-500">Remaining balance: ₹5,500</p>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-200 pt-4 border-t border-zinc-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 2 Adjacent Reserved Bus Seats</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Private Double-Occupancy Room in Manali & Kasol</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Daily Breakfast & Dinner for 2</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> All Sightseeing & Atal Tunnel Excursion</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 2 Individual Digital QR Passes</li>
            </ul>
          </div>

          <Link
            href="/book"
            className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs text-center shadow-lg glow-orange block"
          >
            Select Couple Package
          </Link>
        </div>

        {/* Group 5+1 */}
        <div className="glass-card rounded-3xl p-8 border border-amber-500/50 space-y-6 flex flex-col justify-between bg-gradient-to-b from-amber-950/20 to-zinc-950">
          <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-amber-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider shadow">
            5 + 1 FREE
          </span>

          <div className="space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Group Squad (5+1)</h3>
              <p className="text-xs text-zinc-400 mt-1">Pay for 5 paid friends and 6th friend travels 100% free.</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">₹31,000</span>
                <span className="text-xs text-zinc-400">for 6 travellers</span>
              </div>
              <p className="text-xs font-bold text-amber-400 mt-1">Instant ₹6,200 Group Savings</p>
              <p className="text-[11px] text-zinc-500">Pay ₹1,000 reservation today</p>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 6 Reserved Bus Seats for the Squad</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 6th Friend Gets 100% Free Travel & Stay</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Resort Accommodation for all 6</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Campfire & Music Bonding Night</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 6 Individual Boarding Passes</li>
            </ul>
          </div>

          <Link
            href="/book"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs text-center shadow-lg block"
          >
            Claim 5+1 Group Offer
          </Link>
        </div>
      </div>
    </div>
  );
}
