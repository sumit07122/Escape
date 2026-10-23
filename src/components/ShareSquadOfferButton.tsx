'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

interface ShareSquadOfferButtonProps {
  threshold: number;
  savingPerTraveller: number;
  totalSaving: number;
}

export default function ShareSquadOfferButton({
  threshold,
  savingPerTraveller,
  totalSaving,
}: ShareSquadOfferButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareOffer = async () => {
    const url = `${window.location.origin}/pricing`;
    const text = `Planning a Manali × Kasol student trip? Bring ${threshold} travellers on one booking and save ₹${savingPerTraveller.toLocaleString('en-IN')} each (₹${totalSaving.toLocaleString('en-IN')} total). See the offer: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Himalayan Escape squad offer', text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={shareOffer}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d6d1c5] bg-white px-5 py-3 text-sm font-bold text-[#1c372e] transition hover:border-[#a8b7ac]"
      aria-live="polite"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Offer link copied' : 'Share with friends'}
    </button>
  );
}
