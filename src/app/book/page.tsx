import React from 'react';
import BookingFlow from '@/components/BookingFlow';
import { TRIP_METADATA } from '@/lib/constants';

export const metadata = {
  title: 'Book Your Seat | GLA Himalayan Escape Manali × Kasol',
  description: 'Book your luxury bus seat with real-time seat selector, ₹1,000 reservation payment, and instant digital QR ticket.',
};

export default function BookPage() {
  return (
    <div className="w-full min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 mb-4 text-center">
        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
          OFFICIAL REGISTRATION PORTAL
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white mt-1">
          {TRIP_METADATA.name}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {TRIP_METADATA.title} • {TRIP_METADATA.duration} • GLA University Mathura
        </p>
      </div>

      <BookingFlow />
    </div>
  );
}
