import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { TRIP_METADATA } from '@/lib/constants';

export const metadata = {
  title: 'Terms & Conditions | GLA Himalayan Escape',
  description: 'Official terms of participation, behavioral guidelines, and safety conditions.',
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
          EXPEDITION AGREEMENT
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Terms & Conditions
        </h1>
        <p className="text-xs text-zinc-400">Last updated: October 2026</p>
      </div>

      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200 leading-relaxed">{TRIP_METADATA.disclaimer}</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Seat Reservation & Payment Policy</h2>
          <p>
            A non-refundable reservation deposit of ₹1,000 is required to hold and confirm your chosen bus seat. The remaining balance must be cleared prior to boarding as scheduled by the trip coordinators. Failure to clear the outstanding balance may result in cancellation without refund.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Route & Activity Flexibility</h2>
          <p>
            Weather, road conditions, landslides, snowfall, and local administration directives in Himachal Pradesh can impact travel schedules. High-altitude excursions to Solang Valley, Atal Tunnel, and Sissu are subject to safety clearance by the Border Roads Organisation (BRO) and Himachal Police. In the event of road closures, the trip team will provide alternative safe valley tours.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Traveller Conduct & Safety</h2>
          <p>
            Travellers are expected to maintain collegiate discipline and adhere to coordinator instructions at all times. Consumption of prohibited substances or unruly conduct that risks passenger safety will result in immediate disqualification from the expedition.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Digital QR Tickets</h2>
          <p>
            Each traveller receives a unique digital QR ticket upon successful confirmation. This ticket must be produced at the GLA University boarding gate for verification and check-in. Digital tickets are non-transferable without written coordinator approval.
          </p>
        </section>
      </div>
    </div>
  );
}
