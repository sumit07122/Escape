'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { X, Flame, Sparkles, CheckCircle2, Users, Bus, Zap } from 'lucide-react';

interface BookingActivity {
  id: string;
  type: 'seat' | 'squad' | 'duo' | 'milestone';
  title: string;
  subtitle: string;
  timestamp: number; // in milliseconds
  tag: string;
  seatInfo?: string;
  isFresh?: boolean;
}

// Rich repository of authentic GLA student names & departments
const STUDENT_PROFILES = [
  { name: 'Aman V.', dept: 'GLA CSE', seat: 'Seat L3 (Window)', coach: 'Coach 01' },
  { name: 'Priya & Sneha', dept: 'Biotech', seat: 'Seats L1, L2', coach: 'Coach 01', type: 'duo' },
  { name: 'Kavya M.', dept: 'GLA BBA', seat: 'Seat L5', coach: 'Coach 01' },
  { name: 'Squad from Hostel B', dept: 'Hostel B', seat: 'Seats R3, R4, R5, R6', coach: 'Coach 01', type: 'squad' },
  { name: 'Aditya S.', dept: 'Mechanical', seat: 'Seat R7 (Aisle)', coach: 'Coach 01' },
  { name: 'Aryan & Harshit', dept: 'GLA BCA', seat: 'Rear Bench B1, B2', coach: 'Coach 01', type: 'duo' },
  { name: 'Tanvi D.', dept: 'Biotech', seat: 'Seat R8', coach: 'Coach 01' },
  { name: 'Devansh K.', dept: 'GLA CSE', seat: 'Seat L6 (Aisle)', coach: 'Coach 01' },
  { name: 'Ananya R.', dept: 'GLA MBA', seat: 'Seat L7 (Window)', coach: 'Coach 01' },
  { name: 'Squad of 3 (Wing 4)', dept: 'Engineering', seat: 'Seats L8, R9, B3', coach: 'Coach 01', type: 'squad' },
  { name: 'Sahil T.', dept: 'GLA Civil', seat: 'Seat R1', coach: 'Coach 01' },
  { name: 'Isha & Pooja', dept: 'B.Pharma', seat: 'Seats L4, L5', coach: 'Coach 02', type: 'duo' },
  { name: 'Varun P.', dept: 'GLA ECE', seat: 'Seat L2 (Window)', coach: 'Coach 02' },
  { name: 'Nikhil B.', dept: 'GLA CSE', seat: 'Seat R2', coach: 'Coach 02' },
  { name: 'Riddhima S.', dept: 'GLA BBA', seat: 'Seat L3', coach: 'Coach 02' },
  { name: 'Dhruv M.', dept: 'GLA BCA', seat: 'Seat R4', coach: 'Coach 02' },
];

function formatTimeAgo(msAgo: number): string {
  const seconds = Math.floor(msAgo / 1000);
  if (seconds < 45) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function SocialProofPopup() {
  const [activities, setActivities] = useState<BookingActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize realistic staggered activities based on current time
  useEffect(() => {
    // Check session dismissal
    if (typeof window !== 'undefined' && sessionStorage.getItem('gla_social_proof_dismissed') === '1') {
      setIsDismissed(true);
      return;
    }

    const now = Date.now();
    const initialPool: BookingActivity[] = [
      {
        id: 'init-1',
        type: 'seat',
        title: 'Aman V. (GLA CSE)',
        subtitle: 'Locked Seat L3 on Coach 01',
        timestamp: now - 3 * 60 * 1000, // 3m ago
        tag: 'Window Seat',
        seatInfo: 'Coach 01 • Seat L3',
      },
      {
        id: 'init-2',
        type: 'duo',
        title: 'Priya & Sneha (Biotech)',
        subtitle: 'Reserved Duo Explorer (L1, L2)',
        timestamp: now - 9 * 60 * 1000, // 9m ago
        tag: 'Duo Explorer',
        seatInfo: 'Coach 01 • Seats L1-L2',
      },
      {
        id: 'init-3',
        type: 'seat',
        title: 'Kavya M. (BBA)',
        subtitle: 'Reserved Seat L5 on Coach 01',
        timestamp: now - 18 * 60 * 1000, // 18m ago
        tag: 'Single Explorer',
        seatInfo: 'Coach 01 • Seat L5',
      },
      {
        id: 'init-4',
        type: 'squad',
        title: 'Squad of 4 (Hostel B)',
        subtitle: 'Locked Rohtang Group Booking',
        timestamp: now - 32 * 60 * 1000, // 32m ago
        tag: 'Squad Tier',
        seatInfo: 'Seats R3, R4, R5, R6',
      },
      {
        id: 'init-5',
        type: 'seat',
        title: 'Aditya S. (Mechanical)',
        subtitle: 'Confirmed Aisle Seat R7 on Coach 01',
        timestamp: now - 48 * 60 * 1000, // 48m ago
        tag: 'Coach 01',
        seatInfo: 'Coach 01 • Seat R7',
      },
      {
        id: 'init-6',
        type: 'milestone',
        title: 'Coach 01 is 32% Filled',
        subtitle: '17 seats remaining before Coach 02 opens',
        timestamp: now - 65 * 60 * 1000,
        tag: 'High Demand',
        seatInfo: 'Limited Seats Left',
      },
    ];

    setActivities(initialPool);

    // Initial popup display delay
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4500);

    return () => clearTimeout(initialTimer);
  }, []);

  // Periodic rotation interval (every 16s: show for 6s, hide for 10s)
  useEffect(() => {
    if (isDismissed || isPaused || activities.length === 0) return;

    const cycleTimer = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 10000);
    }, 16000);

    return () => clearInterval(cycleTimer);
  }, [isDismissed, isPaused, activities.length]);

  // Dynamic injector: generates a brand-new booking notification every 5 to 7 minutes!
  useEffect(() => {
    if (isDismissed) return;

    const intervalMin = 5;
    const intervalMs = (intervalMin * 60 + Math.floor(Math.random() * 90)) * 1000; // ~5-6.5 mins

    const newBookingTimer = setInterval(() => {
      const now = Date.now();
      const randomProfile = STUDENT_PROFILES[Math.floor(Math.random() * STUDENT_PROFILES.length)];
      const newAct: BookingActivity = {
        id: `dyn-${now}`,
        type: (randomProfile.type as any) || 'seat',
        title: `${randomProfile.name} (${randomProfile.dept})`,
        subtitle: `Just reserved ${randomProfile.seat} on ${randomProfile.coach}`,
        timestamp: now,
        tag: 'Just Booked 🔥',
        seatInfo: `${randomProfile.coach} • ${randomProfile.seat}`,
        isFresh: true,
      };

      setActivities((prev) => [newAct, ...prev.slice(0, 15)]);
      // Immediately flash the new booking!
      setCurrentIndex(0);
      setIsVisible(true);
    }, intervalMs);

    return () => clearInterval(newBookingTimer);
  }, [isDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gla_social_proof_dismissed', '1');
    }
  };

  if (isDismissed || activities.length === 0) return null;

  const current = activities[currentIndex] || activities[0];
  const timeAgoStr = formatTimeAgo(Date.now() - current.timestamp);

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
        className={`block group relative overflow-hidden rounded-2xl bg-stone-900/95 border p-3.5 sm:p-4 text-stone-100 shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all cursor-pointer ${
          current.isFresh ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-white/15 hover:border-amber-400/50'
        }`}
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
            ) : current.isFresh ? (
              <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
            ) : (
              <Flame className="w-5 h-5 text-amber-400" />
            )}
          </div>

          {/* Activity Text */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                current.isFresh
                  ? 'bg-amber-500 text-stone-950 font-black animate-pulse'
                  : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
              }`}>
                {current.tag}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {timeAgoStr}
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
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Student Booking
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
