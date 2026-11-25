'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Flame, Sparkles, CheckCircle2, Users, Bus } from 'lucide-react';

interface BookingActivity {
  id: string;
  type: 'seat' | 'squad' | 'duo' | 'milestone';
  title: string;
  subtitle: string;
  timeAgo: string;
  tag: string;
  seatInfo?: string;
}

const RECENT_ACTIVITIES: BookingActivity[] = [
  {
    id: 'act-1',
    type: 'seat',
    title: 'Aman V. (GLA CSE)',
    subtitle: 'Locked Seat L3 on Coach 01',
    timeAgo: '3m ago',
    tag: 'Window Seat',
    seatInfo: 'Coach 01 • Seat L3',
  },
  {
    id: 'act-2',
    type: 'duo',
    title: 'Priya & Sneha (Biotech)',
    subtitle: 'Reserved Duo Explorer (L1, L2)',
    timeAgo: '11m ago',
    tag: 'Duo Explorer',
    seatInfo: 'Coach 01 • Seats L1-L2',
  },
  {
    id: 'act-3',
    type: 'seat',
    title: 'Kavya M. (BBA)',
    subtitle: 'Reserved Seat L5 on Coach 01',
    timeAgo: '24m ago',
    tag: 'Single Explorer',
    seatInfo: 'Coach 01 • Seat L5',
  },
  {
    id: 'act-4',
    type: 'squad',
    title: 'Squad of 4 (Hostel B)',
    subtitle: 'Locked Rohtang Group Booking',
    timeAgo: '42m ago',
    tag: 'Squad Tier',
    seatInfo: 'Seats R3, R4, R5, R6',
  },
  {
    id: 'act-5',
    type: 'seat',
    title: 'Aditya S. (Mechanical)',
    subtitle: 'Confirmed Aisle Seat R7 on Coach 01',
    timeAgo: '1h ago',
    tag: 'Coach 01',
    seatInfo: 'Coach 01 • Seat R7',
  },
  {
    id: 'act-6',
    type: 'milestone',
    title: 'Coach 01 is 32% Full',
    subtitle: '17 seats remaining before Coach 02 opens',
    timeAgo: 'Live',
    tag: 'High Demand',
    seatInfo: 'Limited Seats Left',
  },
  {
    id: 'act-7',
    type: 'duo',
    title: 'Aryan & Harshit (BCA)',
    subtitle: 'Reserved Rear Bench B1 & B2',
    timeAgo: '1h 15m ago',
    tag: 'Rear Bench Squad',
    seatInfo: 'Coach 01 • Seats B1-B2',
  },
];

export default function SocialProofPopup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('gla_social_proof_dismissed') === '1') {
      setIsDismissed(true);
      return;
    }

    // Initial delay before first popup shows
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4500);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (isDismissed || isPaused) return;

    // Show for 5.5 seconds, hide for 12 seconds, then switch to next activity
    const cycleInterval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % RECENT_ACTIVITIES.length);
        setIsVisible(true);
      }, 12000);
    }, 18000);

    return () => clearInterval(cycleInterval);
  }, [isDismissed, isPaused]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gla_social_proof_dismissed', '1');
    }
  };

  if (isDismissed) return null;

  const current = RECENT_ACTIVITIES[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed z-40 transition-all duration-500 ease-out left-4 sm:left-6 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      } bottom-24 sm:bottom-7 max-w-[320px] sm:max-w-[360px] w-full`}
      aria-live="polite"
    >
      <Link
        href="/book#buses"
        className="block group relative overflow-hidden rounded-2xl bg-stone-900/95 border border-white/15 p-3.5 sm:p-4 text-stone-100 shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl hover:border-amber-400/50 hover:bg-stone-900 transition-all cursor-pointer"
      >
        {/* Subtle Ambient Backlight */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />

        <div className="flex items-start gap-3">
          {/* Avatar Icon */}
          <div className="w-10 h-10 rounded-xl bg-stone-800 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform text-amber-300">
            {current.type === 'milestone' ? (
              <Bus className="w-5 h-5 text-amber-400 animate-pulse" />
            ) : current.type === 'squad' || current.type === 'duo' ? (
              <Users className="w-5 h-5 text-emerald-400" />
            ) : (
              <Flame className="w-5 h-5 text-amber-400" />
            )}
          </div>

          {/* Activity Text */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                {current.tag}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {current.timeAgo}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
              {current.title}
            </h4>

            <p className="text-[11px] text-stone-300 leading-tight mt-0.5 line-clamp-1">
              {current.subtitle}
            </p>

            <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-amber-400/90 pt-1.5 border-t border-white/10">
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified GLA Booking
              </span>
              <span className="font-bold underline decoration-amber-400/40 underline-offset-2 group-hover:text-white transition-colors">
                Select Seat →
              </span>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            className="text-stone-400 hover:text-stone-200 p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </Link>
    </div>
  );
}

// Compact Live Booking Micro-Ticker for the Hero Section
export function HeroLiveBookingTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % RECENT_ACTIVITIES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const act = RECENT_ACTIVITIES[index];

  return (
    <Link
      href="/book#buses"
      className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-stone-900/85 hover:bg-stone-900 border border-amber-400/30 hover:border-amber-400/60 shadow-lg text-[11px] sm:text-xs text-stone-200 backdrop-blur-md transition-all group"
    >
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
      </span>
      <span className="font-medium">
        <strong className="text-white group-hover:text-amber-300 transition-colors">{act.title}</strong>{' '}
        <span className="text-stone-300">{act.subtitle}</span>
      </span>
      <span className="hidden sm:inline-block text-[10px] text-amber-300/80 font-mono pl-1 border-l border-white/15">
        {act.timeAgo}
      </span>
      <span className="text-amber-400 text-[10px] font-bold group-hover:translate-x-0.5 transition-transform">
        →
      </span>
    </Link>
  );
}
