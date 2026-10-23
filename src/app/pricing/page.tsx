export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Compass, Users, UserRound } from 'lucide-react';
import { getTripConfig } from '@/lib/trip-config';
import ShareSquadOfferButton from '@/components/ShareSquadOfferButton';

export const metadata = {
  title: 'Pricing | Himalayan Escape — Student Mountain Expedition',
  description: 'Clear expedition pricing with an automatic group rate for squads of five or more.',
};

export default async function PricingPage() {
  const config = await getTripConfig();
  const soloPrice = Number(config.packagePrice) || 6500;
  const squadPrice = Number(config.groupPackagePrice) || 6200;
  const threshold = Number(config.groupSizeThreshold) || 5;
  const deposit = Number(config.depositPrice) || 1000;
  const soloBalance = Math.max(0, soloPrice - deposit);
  const squadBalance = Math.max(0, squadPrice - deposit);
  const saving = Math.max(0, soloPrice - squadPrice);

  const steps = [
    { number: '01', title: 'Reserve your seats', detail: `Pay ₹${deposit.toLocaleString('en-IN')} per traveller to secure your places.` },
    { number: '02', title: 'Bring your squad', detail: `At ${threshold} or more travellers, checkout applies the lower group rate automatically.` },
    { number: '03', title: 'Settle the balance', detail: `Pay the remaining ₹${soloBalance.toLocaleString('en-IN')} solo or ₹${squadBalance.toLocaleString('en-IN')} per traveller with the group rate.` },
  ];

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17251f]">
      <section className="relative overflow-hidden border-b border-[#e6e2d8] bg-[#f8f7f2] px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#dbe8df] blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#678275]">
            <Compass className="h-4 w-4" /> Plan your escape
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#15392f] sm:text-6xl">
            Clear prices.<br className="hidden sm:block" /> More room for the mountains.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#65716b] sm:text-base">
            One clear seat price, plus an automatic squad saving when one booking has {threshold} or more travellers. Your rate and deposit are shown before payment.
          </p>
          <div className="mt-7 flex max-w-4xl flex-col justify-between gap-4 rounded-[1.5rem] border border-[#ead7c3] bg-[#fffaf3] p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bd744c]">The student squad offer</span>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#15392f] sm:text-2xl">Bring {threshold - 1} friends. All {threshold} get the lower rate.</h2>
              <p className="mt-1 text-xs leading-5 text-[#65716b]">Save ₹{saving.toLocaleString('en-IN')} each — ₹{(saving * threshold).toLocaleString('en-IN')} across a {threshold}-traveller booking. It applies automatically, with no promo code or deadline.</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-stretch">
              <Link href="/book" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173d32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#245b4a]">
                Start a squad booking <ArrowRight className="h-4 w-4" />
              </Link>
              <ShareSquadOfferButton threshold={threshold} savingPerTraveller={saving} totalSaving={saving * threshold} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-[2rem] border border-[#e1ded5] bg-white p-7 shadow-[0_18px_55px_rgba(21,57,47,0.07)] sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718078]">A seat for your own adventure</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#163c32]">Solo explorer</h2>
                <p className="mt-1 text-xs text-[#748078]">1–{threshold - 1} travellers</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf3ef] text-[#163c32]"><UserRound className="h-5 w-5" /></span>
            </div>
            <div className="mt-9 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-[-0.06em] text-[#17251f]">₹{soloPrice.toLocaleString('en-IN')}</span>
              <span className="pb-2 text-sm text-[#77817b]">/ traveller</span>
            </div>
            <p className="mt-2 text-xs text-[#77817b]">₹{deposit.toLocaleString('en-IN')} to reserve <span className="px-1 text-[#b7beb9]">·</span> ₹{soloBalance.toLocaleString('en-IN')} remaining</p>
            <div className="my-7 h-px bg-[#eeece5]" />
            <ul className="grid gap-3 text-sm text-[#53635b] sm:grid-cols-2">
              {['Dedicated coach seat', 'Mountain stays and meals', 'Guided expedition stops', 'Digital boarding pass'].map((item) => (
                <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#58816d]" />{item}</li>
              ))}
            </ul>
            <Link href="/book" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#173d32] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#245b4a]">
              Choose your seat <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] bg-[#153a30] p-7 text-white shadow-[0_24px_65px_rgba(14,47,38,0.22)] sm:p-9">
            <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-2 -top-6 h-44 w-44 rounded-full border border-white/10" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/70">Student squad offer</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">The squad rate</h2>
                <p className="mt-1 text-xs text-emerald-100/65">{threshold}+ travellers on one booking</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#f5c696]"><Users className="h-5 w-5" /></span>
            </div>
            <div className="relative mt-9 flex items-end gap-2">
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
