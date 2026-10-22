import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ShieldCheck, Users, User, Compass } from 'lucide-react';
import { PRICING_DEFAULTS, INCLUSIONS_LIST } from '@/lib/constants';

export const metadata = {
  title: 'Pricing | GLA Himalayan Escape',
  description: 'Simple, transparent ₹6,200 per traveller pricing. Reserve your seat with ₹1,000 today.',
};

export default function PricingPage() {
  const pricingTable = [
    { travellers: 1, total: 6200, deposit: 1000, remaining: 5200 },
    { travellers: 2, total: 12400, deposit: 2000, remaining: 10400 },
    { travellers: 3, total: 18600, deposit: 3000, remaining: 15600 },
    { travellers: 4, total: 24800, deposit: 4000, remaining: 20800 },
    { travellers: 5, total: 31000, deposit: 5000, remaining: 26000 },
    { travellers: 6, total: 37200, deposit: 6000, remaining: 31200 },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          HONEST & PROFIT-SAFE PRICING
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          ₹6,200 Per Traveller
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          One transparent rate for every explorer. Lock your reserved bus seat today with a ₹1,000 reservation deposit. Remaining ₹5,200 payable before departure.
        </p>
      </div>

      {/* Main Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Individual Traveller Card */}
        <div className="p-8 rounded-3xl bg-zinc-950 border border-white/10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Solo Explorer</h3>
              <p className="text-xs text-zinc-400 mt-1">Single traveller seat reservation with full amenities.</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">₹6,200</span>
                <span className="text-xs text-zinc-400">/ person</span>
              </div>
              <p className="text-xs font-bold text-emerald-400 mt-1">Pay ₹1,000 to reserve today</p>
              <p className="text-[11px] text-zinc-500">Remaining balance: ₹5,200</p>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Dedicated 2x2 AC Bus Seat</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 3-Star Resort Stay in Manali & Kasol</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Daily Breakfast & Dinner</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> All Sightseeing & Transfers</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Digital QR Boarding Pass</li>
            </ul>
          </div>

          <Link
            href="/book"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center shadow-lg transition-all block"
          >
            Book 1 Seat (₹1,000 Deposit)
          </Link>
        </div>

        {/* Group Booking Card (Operational benefits, no monetary discounts) */}
        <div className="p-8 rounded-3xl bg-zinc-950 border border-emerald-500/30 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Group Booking</h3>
              <p className="text-xs text-zinc-400 mt-1">Book multiple friends together under one booking ID.</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">₹6,200</span>
                <span className="text-xs text-zinc-400">× number of travellers</span>
              </div>
              <p className="text-xs font-bold text-emerald-400 mt-1">Pay ₹1,000 per person reservation</p>
              <p className="text-[11px] text-zinc-500">e.g. 2 travellers = ₹12,400 | 6 travellers = ₹37,200</p>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-800">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400 shrink-0" /> One Unified Booking Reference</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400 shrink-0" /> Same Bus Allocation where possible</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400 shrink-0" /> Adjacent-seat recommendations</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400 shrink-0" /> One consolidated management dashboard</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400 shrink-0" /> Individual Digital Passes for each traveller</li>
            </ul>
          </div>

          <Link
            href="/book"
            className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs text-center transition-all block"
          >
            Book for Group (1–6+ Travellers)
          </Link>
        </div>
      </div>

      {/* Pricing Matrix Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white">Exact Pricing & Deposit Breakdown</h3>
        <p className="text-xs text-zinc-400">Calculated strictly server-side based on the single source of truth.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Travellers</th>
                <th className="p-3.5">Total Package Fare</th>
                <th className="p-3.5">Reservation Today (Pay Now)</th>
                <th className="p-3.5">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {pricingTable.map((row) => (
                <tr key={row.travellers} className="hover:bg-white/[0.02]">
                  <td className="p-3.5 font-bold text-white">
                    {row.travellers} {row.travellers === 1 ? 'Traveller' : 'Travellers'}
                  </td>
                  <td className="p-3.5 font-bold text-zinc-200">
                    ₹{row.total.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 font-bold text-emerald-400">
                    ₹{row.deposit.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 font-semibold text-zinc-400">
                    ₹{row.remaining.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Inclusions List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white">What is Included in ₹6,200</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {INCLUSIONS_LIST.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-zinc-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl transition-all"
        >
          <span>PROCEED TO BOOKING</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
