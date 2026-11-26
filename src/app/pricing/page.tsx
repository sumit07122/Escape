export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Compass, Users, UserRound, Sparkles, ShieldCheck } from 'lucide-react';
import { getTripConfig } from '@/lib/trip-config';

export const metadata = {
  title: 'Pricing | Himalayan Escape – Christmas Special 2026',
  description: 'Clear expedition pricing: ₹6,199 per person, ₹1,000 reservation deposit, and ₹600 group discount for 5+ travellers.',
};

export default async function PricingPage() {
  const config = await getTripConfig();
  const packagePrice = Number(config.packagePrice) || 6199;
  const deposit = Number(config.depositPrice) || 1000;
  const groupDiscount = Number(config.groupDiscountAmount) || 600;
  const threshold = Number(config.groupSizeThreshold) || 5;
  const soloBalance = Math.max(0, packagePrice - deposit);

  const pricingTiers = [
    { pax: 1, total: 6199, discount: 0, final: 6199, deposit: 1000, balance: 5199 },
    { pax: 2, total: 12398, discount: 0, final: 12398, deposit: 2000, balance: 10398 },
    { pax: 4, total: 24796, discount: 0, final: 24796, deposit: 4000, balance: 20796 },
    { pax: 5, total: 30995, discount: 600, final: 30395, deposit: 5000, balance: 25395, isGroup: true },
    { pax: 6, total: 37194, discount: 600, final: 36594, deposit: 6000, balance: 30594, isGroup: true },
    { pax: 10, total: 61990, discount: 600, final: 61390, deposit: 10000, balance: 51390, isGroup: true },
  ];

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17251f]">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-[#e6e2d8] bg-[#f8f7f2] px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#dbe8df] blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#678275]">
            <Compass className="h-4 w-4" /> Christmas Special 2026 Pricing
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#15392f] sm:text-6xl">
            Clear prices.<br className="hidden sm:block" /> Full Himalayan adventure.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#65716b] sm:text-base">
            Flat ₹{packagePrice.toLocaleString('en-IN')} all-inclusive per traveller. Lock your seat with a ₹{deposit.toLocaleString('en-IN')} advance deposit today. Book 5 or more travellers together and receive an instant ₹{groupDiscount.toLocaleString('en-IN')} group discount on your total booking.
          </p>

          {/* Group Banner */}
          <div className="mt-7 flex max-w-4xl flex-col justify-between gap-4 rounded-[1.5rem] border border-[#ead7c3] bg-[#fffaf3] p-5 sm:flex-row sm:items-center sm:p-6 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#bd744c]">
                <Sparkles className="w-3.5 h-3.5" /> Group Adventure Offer
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#15392f] sm:text-2xl">
                Book 5+ Travellers · Get ₹{groupDiscount} Off Total
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#65716b]">
                Groups of 5 or more save ₹600 on the entire booking total. Applied automatically to the remaining balance with zero promo codes needed.
              </p>
            </div>
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173d32] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#245b4a] shrink-0 shadow"
            >
              Book Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 space-y-12">
        {/* Transparent Booking Comparison Table */}
        <div className="rounded-[2rem] border border-[#e1ded5] bg-white p-6 sm:p-9 shadow-[0_15px_45px_rgba(21,57,47,0.06)] space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">
              Transparent Pricing Matrix
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#163c32]">
              Official Group & Individual Pricing Breakdown
            </h2>
            <p className="text-xs text-[#748078]">
              Deposit is ₹1,000 multiplied by the number of travellers. The ₹600 group discount applies once to the total for bookings of 5 or more travellers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#eeece5] text-[11px] font-bold uppercase tracking-wider text-[#718078]">
                  <th className="py-3 px-3">Travellers</th>
                  <th className="py-3 px-3">Package Total</th>
                  <th className="py-3 px-3">Group Discount</th>
                  <th className="py-3 px-3">Final Total</th>
                  <th className="py-3 px-3">Advance Deposit (Pay Now)</th>
                  <th className="py-3 px-3">Remaining Balance (At Boarding)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f0e8]">
                {pricingTiers.map((tier) => (
                  <tr
                    key={tier.pax}
                    className={`transition-colors hover:bg-[#f9f8f4] ${
                      tier.isGroup ? 'bg-[#f4f8f5] font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 font-bold text-[#163c32]">
                      {tier.pax} {tier.pax === 1 ? 'Traveller' : 'Travellers'}
                      {tier.isGroup && (
                        <span className="ml-2 rounded-full bg-[#163c32] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide">
                          Group Offer
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-[#53635b]">₹{tier.total.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-3 text-emerald-700 font-semibold">
                      {tier.discount > 0 ? `-₹${tier.discount}` : '₹0'}
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-[#17251f]">
                      ₹{tier.final.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-[#bd744c] font-bold">
                      ₹{tier.deposit.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#163c32]">
                      ₹{tier.balance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2 Feature Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card 1: Standard Individual Package */}
          <article className="relative overflow-hidden rounded-[2rem] border border-[#e1ded5] bg-white p-7 shadow-sm sm:p-9 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">
                    Solo & Small Groups
                  </span>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#163c32]">
                    Standard Expedition Package
                  </h3>
                  <p className="mt-1 text-xs text-[#748078]">1 to 4 travellers</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf3ef] text-[#163c32]">
                  <UserRound className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#17251f]">
                  ₹{packagePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-medium text-[#77817b]">/ person</span>
              </div>
              <p className="mt-2 text-xs text-[#77817b]">
                ₹{deposit.toLocaleString('en-IN')} advance deposit · ₹{soloBalance.toLocaleString('en-IN')} due before boarding
              </p>

              <div className="my-6 h-px bg-[#eeece5]" />

              <ul className="space-y-3 text-xs sm:text-sm text-[#53635b]">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#163c32] shrink-0" />
                  <span>Round-trip AC Traveller Bus from GLA University, Mathura</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#163c32] shrink-0" />
                  <span>1 Night Riverside Camping in Kasol</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#163c32] shrink-0" />
                  <span>2 Nights in 4-Star Riverside Hotel in Manali</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#163c32] shrink-0" />
                  <span>Total 3 Breakfasts & 3 Dinners included (Pure Veg)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#163c32] shrink-0" />
                  <span>Day 5 Solang Valley Snow Point, Atal Tunnel & Kasol</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#163c32] shrink-0" />
                  <span>Interactive seat reservation with instant digital QR ticket</span>
                </li>
              </ul>
            </div>

            <Link
              href="/book"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#173d32] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#245b4a]"
            >
              Choose Your Seat <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          {/* Card 2: 5+ Group Adventure Offer */}
          <article className="relative overflow-hidden rounded-[2rem] bg-[#153a30] p-7 text-white shadow-xl sm:p-9 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1c39e]">
                    5+ Travellers Advantage
                  </span>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                    Group Adventure Offer
                  </h3>
                  <p className="mt-1 text-xs text-emerald-100/80">
                    5 or more travellers booking together
                  </p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#f5c696]">
                  <Users className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  ₹{groupDiscount} Off
                </span>
                <span className="text-sm font-medium text-emerald-100/80">on entire booking total</span>
              </div>
              <p className="mt-2 text-xs text-emerald-100/80">
                ₹{deposit.toLocaleString('en-IN')}/person deposit · Discount applied to remaining balance
              </p>

              <div className="my-6 h-px bg-white/10" />

              <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-1 mb-6">
                <span className="text-xs font-bold text-[#f1c39e] block">Transparent Calculation</span>
                <p className="text-xs text-emerald-100/80">
                  Example: 5 Travellers = (5 × ₹6,199) - ₹600 = ₹30,395 final total. Pay ₹5,000 deposit now, remaining balance is ₹25,395 before boarding.
                </p>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-emerald-50/90">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#f1c39e] shrink-0" />
                  <span>Guaranteed adjacent / grouped seats together on bus</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#f1c39e] shrink-0" />
                  <span>Single checkout with individual digital QR tickets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#f1c39e] shrink-0" />
                  <span>Synchronized room allotments in Kasol & Manali</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#f1c39e] shrink-0" />
                  <span>Direct WhatsApp group coordination for boarding at GLA</span>
                </li>
              </ul>
            </div>

            <Link
              href="/book"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f1c39e] px-5 py-4 text-sm font-bold text-[#1d2e27] transition hover:bg-white"
            >
              Book Group Seats <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </div>

        {/* 3 Steps */}
        <section className="rounded-[2rem] border border-[#e5e1d7] bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b806f]">Three easy steps</span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#163c32]">How Booking Works</h2>
            </div>
            <p className="text-xs text-[#77817b]">No hidden fees. Your final total is verified before checkout.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl bg-[#f7f7f2] p-5 space-y-2">
              <span className="font-mono text-xs font-bold tracking-widest text-[#c17950]">01</span>
              <h3 className="text-base font-bold text-[#203c32]">Select Your Bus Seats</h3>
              <p className="text-xs leading-relaxed text-[#6e7972]">Pick your preferred window or aisle seat on the live seat map with a guaranteed 10-minute hold.</p>
            </article>
            <article className="rounded-2xl bg-[#f7f7f2] p-5 space-y-2">
              <span className="font-mono text-xs font-bold tracking-widest text-[#c17950]">02</span>
              <h3 className="text-base font-bold text-[#203c32]">Pay ₹1,000 Deposit</h3>
              <p className="text-xs leading-relaxed text-[#6e7972]">Pay ₹1,000 advance per seat via Razorpay UPI/Cards to permanently confirm your reservation.</p>
            </article>
            <article className="rounded-2xl bg-[#f7f7f2] p-5 space-y-2">
              <span className="font-mono text-xs font-bold tracking-widest text-[#c17950]">03</span>
              <h3 className="text-base font-bold text-[#203c32]">Settle Balance at GLA Boarding</h3>
              <p className="text-xs leading-relaxed text-[#6e7972]">Pay the remaining balance before boarding the AC Traveller Bus at GLA University, Mathura.</p>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
              <span className="text-5xl font-semibold tracking-[-0.06em] text-white">₹{squadPrice.toLocaleString('en-IN')}</span>
              <span className="pb-2 text-sm text-emerald-100/65">/ traveller</span>
            </div>
            <p className="relative mt-2 text-xs text-emerald-100/65">₹{deposit.toLocaleString('en-IN')} to reserve <span className="px-1 text-white/25">·</span> ₹{squadBalance.toLocaleString('en-IN')} remaining</p>
            <div className="my-7 h-px bg-white/10" />
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
              <div>
                <p className="text-sm font-semibold">Save ₹{(saving * threshold).toLocaleString('en-IN')} across {threshold} seats</p>
                <p className="mt-1 text-xs text-emerald-100/65">Each traveller in a booking of {threshold}+ gets ₹{saving.toLocaleString('en-IN')} off. Applied automatically.</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#f0c593] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#28372f]">No code needed</span>
            </div>
            <Link href="/book" className="relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e7a476] px-5 py-4 text-sm font-bold text-[#1d2e27] transition hover:bg-[#f1c49e]">
              Book together <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </div>

        <section className="mt-7 rounded-[2rem] border border-[#e5e1d7] bg-white p-6 shadow-[0_15px_45px_rgba(21,57,47,0.05)] sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b806f]">Three easy steps</span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#163c32]">Know what happens next</h2>
            </div>
            <p className="text-xs text-[#77817b]">No hidden charges. Your final total is confirmed at checkout.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-2xl bg-[#f7f7f2] p-5">
                <span className="font-mono text-xs font-bold tracking-widest text-[#c17950]">{step.number}</span>
                <h3 className="mt-4 text-base font-semibold text-[#203c32]">{step.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#6e7972]">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-[1.75rem] border border-[#e3ded2] bg-[#eeeae0] p-6 sm:flex-row sm:items-center sm:px-8">
          <div>
            <h2 className="text-base font-semibold text-[#1c372e]">Need help bringing everyone together?</h2>
            <p className="mt-1 text-xs text-[#6e7972]">Talk with a trip coordinator about squad bookings and payment.</p>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-[#d6d1c5] bg-white px-5 py-3 text-xs font-bold text-[#1c372e] transition hover:border-[#a8b7ac]">
            Contact coordinators <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
