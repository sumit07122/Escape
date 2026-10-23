export const dynamic = 'force-dynamic';

import React from 'react';
import BookingFlow from '@/components/BookingFlow';
import { getTripConfig } from '@/lib/trip-config';
import { Megaphone, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Book Your Seat | Himalayan Escape — Student Mountain Expedition',
  description: 'Book your luxury bus seat with real-time seat selector, advance reservation payment, and instant digital QR ticket.',
};

export default async function BookPage() {
  const tripConfig = await getTripConfig();

  return (
    <div className="w-full min-h-screen py-10 bg-[#F7F5EF] text-[#171918]">
      {/* Emergency Live Broadcast Banner if Active */}
      {tripConfig.announcementActive && tripConfig.announcementBanner && (
        <div className="max-w-4xl mx-auto mb-6 px-4">
          <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-950 shadow-md flex items-start sm:items-center gap-3 animate-in fade-in">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs sm:text-sm">
              <span className="font-mono font-black uppercase tracking-wider block text-[10px] text-amber-800">
                Official Expedition Notice
              </span>
              <p className="font-semibold text-stone-900 mt-0.5">
                {tripConfig.announcementBanner}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 mb-4 text-center space-y-1">
        <span className="text-xs font-bold text-[#D87945] uppercase tracking-widest font-mono">
          STUDENT RESERVATION PORTAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#171918]">
          {tripConfig.tripTitle || 'HIMALAYAN ESCAPE'}
        </h1>
        <p className="text-xs sm:text-sm text-[#646864] uppercase font-medium">
          {tripConfig.subtitle || 'MANALI × KASOL • STUDENT EXPEDITION'} • PICKUP: {tripConfig.pickupLocation || 'NEAR MAIN GATE (NH-2), MATHURA'} • REPORTING: {tripConfig.reportingTime || '07:00 PM'}
        </p>
      </div>

      <BookingFlow />
    </div>
  );
}
