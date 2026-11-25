import React from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { INCLUSIONS_LIST, EXCLUSIONS_LIST, TRIP_METADATA } from '@/lib/constants';

export const metadata = {
  title: 'Inclusions & Exclusions | Himalayan Escape',
  description: 'Detailed list of package inclusions and exclusions for the Manali × Kasol 6D/5N expedition.',
};

export default function InclusionsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          TRANSPARENT EXPEDITION COVERAGE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Inclusions & Exclusions
        </h1>
        <p className="text-sm text-zinc-400">
          Know exactly what is provided on your 6 Days / 5 Nights journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inclusions */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">What is Included</h2>
              <span className="text-xs text-emerald-400">Covered in your package</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {INCLUSIONS_LIST.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exclusions */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">What is Excluded</h2>
              <span className="text-xs text-rose-400">Not covered / Separately payable</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {EXCLUSIONS_LIST.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-400">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-600/30 flex items-start gap-4">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed">
          {TRIP_METADATA.disclaimer}
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg glow-orange"
        >
          <span>RESERVE SEAT FOR ₹1,000</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
