'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#D8D2C4] px-4 py-3 bg-[#F7F5EF]/95 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#163C32]" />
            <span className="text-[11px] font-bold text-[#163C32]">
              {stats ? `${stats.totalBooked}/${stats.capacity} Booked` : '75 Total Capacity'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-[#171918]">₹1,000</span>
            <span className="text-[10px] text-[#646864]">to reserve seat</span>
          </div>
        </div>

        <Link
          href="/book"
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-xs shadow-sm"
        >
          <span>BOOK SEAT</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
