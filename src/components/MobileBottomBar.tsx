'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Mountain } from 'lucide-react';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const [stats, setStats] = useState<{ totalBooked: number; capacity: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/buses');
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalBooked: data.trip?.totalBooked || 0,
            capacity: data.trip?.capacity || 75,
          });
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, []);

  // Do not show on booking page or admin pages
  if (pathname === '/book' || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-4 py-3 pb-safe bg-[#08140e]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-400">
              {stats ? `${stats.totalBooked}/${stats.capacity} Booked` : 'Limited Seats'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-white">₹1,000</span>
            <span className="text-[10px] text-zinc-400">reservation to lock seat</span>
          </div>
        </div>

        <Link
          href="/book"
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-xs shadow-lg glow-orange"
        >
          <span>BOOK SEAT</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
