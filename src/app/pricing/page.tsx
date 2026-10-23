export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Users, User, Sparkles } from 'lucide-react';
import { INCLUSIONS_LIST } from '@/lib/constants';
import { getTripConfig } from '@/lib/trip-config';

export const metadata = {
  title: 'Pricing | Himalayan Escape — Student Mountain Expedition',
  description: 'Simple, transparent tiered squad pricing. Reserve your seat with an advance deposit today.',
};

export default async function PricingPage() {
  const tripConfig = await getTripConfig();
  const pkgPrice = Number(tripConfig.packagePrice) || 6500;
  const groupPrice = Number(tripConfig.groupPackagePrice) || 6200;
  const threshold = Number(tripConfig.groupSizeThreshold) || 5;
  const depPrice = Number(tripConfig.depositPrice) || 1000;
  const remSoloPrice = Math.max(0, pkgPrice - depPrice);
  const remGroupPrice = Math.max(0, groupPrice - depPrice);

  const pricingTable = [1, 2, 3, 4, 5, 6].map((count) => {
    const isGroup = count >= threshold;
    const perHead = isGroup ? groupPrice : pkgPrice;
    const total = count * perHead;
    const deposit = count * depPrice;
    const remaining = Math.max(0, total - deposit);
    return {
      travellers: count,
      rate: perHead,
      isGroup,
      total,
      deposit,
      remaining,
    };
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12 bg-[#F7F5EF] text-[#171918]">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest font-mono">
          TRANSPARENT EXPEDITION PRICING
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171918]">
          Tiered Squad Pricing. No Hidden Fees.
        </h1>
        <p className="text-xs sm:text-sm text-[#646864] max-w-xl mx-auto">
          Standard solo explorer rate is ₹{pkgPrice.toLocaleString('en-IN')}. Form a squad of {threshold}+ friends to unlock our flat ₹{groupPrice.toLocaleString('en-IN')} group rate (save ₹{Math.max(0, pkgPrice - groupPrice)} per head!).
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
              <h3 className="text-xl font-bold text-[#171918]">Solo Explorer (1–4 Pax)</h3>
              <p className="text-xs text-[#646864] mt-1">Single or small group seat reservation with full expedition amenities.</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-[#171918] font-mono">₹{pkgPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs text-[#646864]">/ person</span>
              </div>
              <p className="text-xs font-bold text-[#D87945] mt-1 font-mono">Pay ₹{depPrice.toLocaleString('en-IN')} to reserve today</p>
              <p className="text-[11px] text-[#646864] font-mono">Remaining balance at departure: ₹{remSoloPrice.toLocaleString('en-IN')}</p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#171918]/80 pt-4 border-t border-[#E7E2D8]">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#163C32] shrink-0" /> 1 Dedicated 2x2 AC Bus Seat</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#163C32] shrink-0" /> 3-Star Resort Stay in Manali & Riverside Camps in Kasol</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#163C32] shrink-0" /> Solang Valley, Atal Tunnel, Manikaran & Kasol Cafés</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#163C32] shrink-0" /> Instant QR Digital Boarding Pass</li>
            </ul>
          </div>

          <Link
            href="/book"
            className="w-full py-3.5 rounded-xl bg-[#163C32] hover:bg-[#0F2A23] text-white font-bold text-xs text-center shadow-sm transition-all"
          >
            Reserve Your Seat (₹{depPrice.toLocaleString('en-IN')} Deposit)
          </Link>
        </div>

        {/* Squad Discount Card */}
        <div className="p-8 rounded-3xl bg-[#163C32] text-white border border-[#163C32] space-y-6 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider font-mono shadow">
            🎉 SAVE ₹{Math.max(0, pkgPrice - groupPrice)} / HEAD
          </div>

          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Squad Discount ({threshold}+ Friends)</h3>
              <p className="text-xs text-stone-300 mt-1">Book together with 5 or more batchmates to unlock the flat discounted rate.</p>
            </div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">₹{groupPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs text-stone-300">/ person</span>
              </div>
              <p className="text-xs font-bold text-amber-300 mt-1 font-mono">₹{depPrice.toLocaleString('en-IN')} advance deposit per traveller</p>
              <p className="text-[11px] text-stone-300 font-mono">Remaining balance at departure: ₹{remGroupPrice.toLocaleString('en-IN')}/head</p>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-200 pt-4 border-t border-white/10">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Adjacent 2x2 Pushback Seats on same coach</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Shared Resort Room Allocation for your squad</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Individual Digital Boarding Passes with QR</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Single Lead Contact Coordination</li>
            </ul>
          </div>

          <Link
            href="/book"
            className="w-full py-3.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-black text-xs text-center shadow-md transition-all tracking-wider"
          >
            Book Squad (5+ Seats at ₹{groupPrice.toLocaleString('en-IN')})
          </Link>
        </div>
      </div>

      {/* Pricing Matrix Table */}
      <div className="p-8 rounded-3xl bg-white border border-[#D8D2C4] space-y-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-[#171918]">Complete Tiered Payment Matrix</h3>
          <p className="text-xs text-[#646864]">Exact breakdown of per-head rate, total package, reservation deposit and gate balance.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E7E2D8] text-[#646864] font-semibold uppercase text-[10px] font-mono">
                <th className="py-3 px-4">Travellers</th>
                <th className="py-3 px-4">Per-Person Rate</th>
                <th className="py-3 px-4">Total Package</th>
                <th className="py-3 px-4 text-[#D87945]">Reservation (Pay Now)</th>
                <th className="py-3 px-4">Gate Due (At Boarding)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D8]">
              {pricingTable.map((row) => (
                <tr key={row.travellers} className="hover:bg-[#F7F5EF] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#171918]">
                    {row.travellers} {row.travellers === 1 ? 'Traveller' : 'Travellers'}
                    {row.isGroup && (
                      <span className="ml-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        SQUAD RATE
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold font-mono">₹{row.rate.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-black font-mono">₹{row.total.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-[#D87945] font-mono">₹{row.deposit.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-[#646864] font-mono">₹{row.remaining.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom FAQ / Policy Note */}
      <div className="p-6 rounded-2xl bg-[#E7E2D8] border border-[#D8D2C4] flex items-center justify-between gap-4 flex-wrap text-xs text-[#171918]/80">
        <div>
          <p className="font-bold text-[#171918]">Need assistance with group bookings or promo codes?</p>
          <p className="text-[#646864]">Student coordinators available 24/7 on WhatsApp or helpline call.</p>
        </div>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F5EF] border border-[#D8D2C4] text-[#171918] font-bold text-xs transition-colors shrink-0"
        >
          Contact Coordinators
        </Link>
      </div>
    </div>
  );
}
