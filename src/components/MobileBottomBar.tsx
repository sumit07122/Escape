'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const [stats, setStats] = useState<{ available: number; capacity: number; deposit: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [busesRes, configRes] = await Promise.all([
          fetch('/api/buses', { cache: 'no-store' }),
          fetch('/api/trip-config', { cache: 'no-store' }),
        ]);
        const [buses, tripConfig] = await Promise.all([
          busesRes.ok ? busesRes.json() : Promise.resolve(null),
          configRes.ok ? configRes.json() : Promise.resolve(null),
        ]);
        if (buses?.trip) {
          setStats({
            available: Number(buses.trip.totalAvailable ?? 0),
            capacity: Number(buses.trip.capacity ?? 0),
            deposit: Number(tripConfig?.config?.depositPrice ?? 1000),
          });
        }
      } catch {
        // Keep the booking action available if live stats are offline.
      }
    }
    load();
  }, []);

  if (pathname === '/book' || pathname?.startsWith('/admin')) return null;

  return (
    <div className="mobile-bottom-bar fixed inset-x-0 bottom-0 z-40 border-t border-[#D8D2C4] bg-[#F7F5EF]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-8px_28px_rgba(14,38,32,0.10)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#163C32]" />
            <span className="truncate text-[11px] font-bold text-[#163C32]">
              {stats ? `${stats.available} seats left` : 'Live seat availability'}
            </span>
            {stats && <span className="hidden text-[10px] text-[#646864] min-[380px]:inline">of {stats.capacity}</span>}
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-sm font-black text-[#171918]">{'\u20B9'}{stats?.deposit.toLocaleString('en-IN') || '1,000'}</span>
            <span className="truncate text-[10px] text-[#646864]">to reserve</span>
          </div>
        </div>
        <Link
          href="/book"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#D87945] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#C26735] min-[380px]:px-5"
        >
          <span>Reserve · ₹{stats?.deposit.toLocaleString('en-IN') || '1,000'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
