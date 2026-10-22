import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Users, User } from 'lucide-react';
import { INCLUSIONS_LIST } from '@/lib/constants';

export const metadata = {
  title: 'Pricing | Himalayan Escape — Student Mountain Expedition',
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
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12 bg-[#F7F5EF] text-[#171918]">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest">
          TRANSPARENT EXPEDITION PRICING
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171918]">
          One price. No surprises.
        </h1>
        <p className="text-xs sm:text-sm text-[#646864] max-w-xl mx-auto">
          One fixed rate for every explorer. Lock your reserved bus seat today with a ₹1,000 reservation deposit. Remaining ₹5,200 payable before departure.
        </p>
      </div>

      {/* Main Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Individual Traveller Card */}
        <div className="p-8 rounded-3xl bg-white border border-[#D8D2C4] space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#163C32]/10 text-[#163C32] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#171918]">Individual Booking</h3>
              <p className="text-xs text-[#646864] mt-1">Single traveller seat reservation with full amenities.</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-[#171918]">₹6,200</span>
                <span className="text-xs text-[#646864]">/ person</span>
              </div>
              <p className="text-xs font-bold text-[#D87945] mt-1">Pay ₹1,000 to reserve today</p>
              <p className="text-[11px] text-[#646864]">Remaining balance: ₹5,200</p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#171918]/80 pt-4 border-t border-[#E7E2D8]">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#163C32] shrink-0" /> 1 Dedicated 2x2 AC Bus Seat</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#163C32] shrink-0" /> Resort Stay in Manali & Kasol</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#163C32] shrink-0" /> Solang Valley, Atal Tunnel, Manikaran</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#163C32] shrink-0" /> Digital Boarding Pass with QR Code</li>
            </ul>
          </div>

          <Link
            href="/book"
            className="w-full py-3.5 rounded-xl bg-[#163C32] hover:bg-[#0F2A23] text-white font-bold text-xs text-center shadow-sm transition-all"
          >
            BOOK 1 SEAT
          </Link>
        </div>

        {/* Group Convenience Card */}
        <div className="p-8 rounded-3xl bg-[#163C32] text-white space-y-6 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-[#D87945] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#D87945] uppercase tracking-wider">
                COORDINATED SEATING
              </span>
              <h3 className="text-xl font-bold text-white">Friends & Group Booking</h3>
              <p className="text-xs text-stone-300 mt-1">Book up to 6 seats together on the same coach with adjacent seats.</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">₹6,200</span>
                <span className="text-xs text-stone-300">/ per traveller</span>
              </div>
              <p className="text-xs font-bold text-[#D87945] mt-1">₹1,000 per person reservation deposit</p>
              <p className="text-[11px] text-stone-300">Single consolidated booking reference</p>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-200 pt-4 border-t border-white/15">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#D87945] shrink-0" /> Guaranteed Adjacent Seats on Same Coach</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#D87945] shrink-0" /> Shared Resort Room Allocation</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#D87945] shrink-0" /> Single Lead Contact Coordination</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#D87945] shrink-0" /> Unified Boarding Passes for Group</li>
            </ul>
          </div>

          <Link
            href="/book"
            className="w-full py-3.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-xs text-center shadow-md transition-all"
          >
            BOOK FOR GROUP (2–6 PAX)
          </Link>
        </div>
      </div>

      {/* Multi-Traveller Table */}
      <div className="p-8 rounded-3xl bg-white border border-[#D8D2C4] space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[#171918]">Multi-Traveller Pricing Breakdown</h2>
          <p className="text-xs text-[#646864]">Strictly transparent. Exact totals calculated mathematically.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#171918]">
            <thead className="bg-[#F7F5EF] text-[#163C32] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5 rounded-l-xl">Travellers</th>
                <th className="p-3.5">Total Package</th>
                <th className="p-3.5">Pay Today (Deposit)</th>
                <th className="p-3.5 rounded-r-xl">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D8]">
              {pricingTable.map((row) => (
                <tr key={row.travellers} className="hover:bg-[#F7F5EF]/60">
                  <td className="p-3.5 font-bold">{row.travellers} {row.travellers === 1 ? 'Person' : 'People'}</td>
                  <td className="p-3.5 font-black">₹{row.total.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 font-bold text-[#D87945]">₹{row.deposit.toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-[#646864]">₹{row.remaining.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inclusions & Exclusions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-4">
          <h3 className="font-bold text-sm text-[#163C32] uppercase tracking-wider">What Is Included</h3>
          <ul className="space-y-2 text-xs text-[#171918]/80">
            {INCLUSIONS_LIST.map((inc, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#163C32] shrink-0" />
                <span>{inc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#D8D2C4] space-y-4">
          <h3 className="font-bold text-sm text-[#D87945] uppercase tracking-wider">Excluded / Optional</h3>
          <ul className="space-y-2 text-xs text-[#646864]">
            <li className="flex items-start gap-2">• Optional adventure activities (paragliding, river rafting, zorbing)</li>
            <li className="flex items-start gap-2">• Personal expenses, café visits, and shopping in Old Manali & Kasol</li>
            <li className="flex items-start gap-2">• Sissu snow clothing/boot rentals in Solang Valley</li>
            <li className="flex items-start gap-2">• Any extra meal or beverage outside the group arrangement</li>
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-2">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-extrabold text-sm shadow-md transition-all tracking-wider"
        >
          <span>SELECT COACH & RESERVE SEATS</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
