import React from 'react';
import BookingFlow from '@/components/BookingFlow';

export const metadata = {
  title: 'Book Your Seat | GLA Himalayan Escape',
  description: 'Book your luxury bus seat with real-time seat selector, ₹1,000 reservation payment, and instant digital QR ticket.',
};

export default function BookPage() {
  return (
    <div className="w-full min-h-screen py-10 bg-[#F7F5EF] text-[#171918]">
      <div className="max-w-4xl mx-auto px-4 mb-4 text-center space-y-1">
        <span className="text-xs font-bold text-[#D87945] uppercase tracking-widest">
          OFFICIAL RESERVATION PORTAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#171918]">
          GLA HIMALAYAN ESCAPE
        </h1>
        <p className="text-xs sm:text-sm text-[#646864]">
          MANALI × KASOL • 6 DAYS • 5 NIGHTS • GLA UNIVERSITY, MATHURA
        </p>
      </div>

      <BookingFlow />
    </div>
  );
}
