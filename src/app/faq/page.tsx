import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { FAQ_ITEMS, CONTACT_INFO } from '@/lib/constants';

export const metadata = {
  title: 'Frequently Asked Questions | GLA Himalayan Escape',
  description: 'Answers to all common queries about booking, bus seats, reservation, 5+1 offer, and luggage.',
};

export default function FAQPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4" /> HELP & SUPPORT
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-zinc-400">
          Everything about seat holding, pricing, safety, and itinerary flexibility.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl p-6 border border-zinc-800 space-y-2.5 hover:border-emerald-500/40 transition-colors"
          >
            <h3 className="text-base font-bold text-white flex items-baseline gap-2.5">
              <span className="font-mono text-emerald-400 font-black">Q{idx + 1}.</span>
              <span>{item.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-8">
              {item.a}
            </p>
          </div>
        ))}
      </div>

      {/* Still have questions banner */}
      <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Still have questions?</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Our GLA student trip coordinators are on standby to help with your boarding queries and room assignments.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={`tel:${CONTACT_INFO.coordinatorPhone1}`}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-white hover:bg-zinc-800"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Call: {CONTACT_INFO.coordinatorPhone1}</span>
          </a>
          <a
            href={`https://wa.me/${CONTACT_INFO.whatsapp1}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-950 border border-green-600/50 text-xs font-bold text-green-300 hover:bg-green-900"
          >
            <MessageSquare className="w-4 h-4 text-green-400" />
            <span>WhatsApp Coordinator</span>
          </a>
        </div>
      </div>
    </div>
  );
}
