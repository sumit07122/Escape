'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Flame, Zap, Mountain, Ticket, Users, Sparkles } from 'lucide-react';

interface ToastItem {
  id: string;
  icon: 'flame' | 'zap' | 'mountain' | 'ticket' | 'users' | 'sparkles';
  title: string;
  subtitle: string;
}

const DEFAULT_TOASTS: ToastItem[] = [
  {
    id: '1',
    icon: 'flame',
    title: 'Rahul from CS reserved Seat L12',
    subtitle: 'Bus 01 (Himalayan Eagle) • 3 mins ago',
  },
  {
    id: '2',
    icon: 'zap',
    title: 'Squad of 5 just unlocked ₹6,200 rate!',
    subtitle: 'Saved ₹1,500 total group discount • 5 mins ago',
  },
  {
    id: '3',
    icon: 'mountain',
    title: 'High Demand on Deluxe Coaches',
    subtitle: 'Only 18 seats remaining across Bus 01 & Bus 02',
  },
  {
    id: '4',
    icon: 'ticket',
    title: 'Priya locked Window Seat R04',
    subtitle: 'Bus 02 (Parvati Cruiser) • 6 mins ago',
  },
  {
    id: '5',
    icon: 'users',
    title: 'Ankit & 2 batchmates reserved seats',
    subtitle: 'Seats L07, L08 & R07 • 9 mins ago',
  },
  {
    id: '6',
    icon: 'sparkles',
    title: 'Aman booked Front Window Seat R01',
    subtitle: 'Panoramic mountain view cabin • 12 mins ago',
  },
];

export default function SocialProofToast() {
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [toastIndex, setToastIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Check if user is currently interacting with an input/checkout field
  const isUserTyping = useCallback(() => {
    if (typeof document === 'undefined') return false;
    const activeEl = document.activeElement;
    if (!activeEl) return false;
    const tagName = activeEl.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  }, []);

  useEffect(() => {
    if (dismissed) return;

    // Show initial toast after 7 seconds
    const initialTimer = setTimeout(() => {
      if (!isUserTyping()) {
        setCurrentToast(DEFAULT_TOASTS[0]);
        setVisible(true);
      }
    }, 7000);

    return () => clearTimeout(initialTimer);
  }, [dismissed, isUserTyping]);

  useEffect(() => {
    if (dismissed) return;

    // Interval to cycle toasts every 32 seconds
    const interval = setInterval(() => {
      if (isUserTyping()) {
        // Skip cycle if user is actively filling out a form
        return;
      }

      // Hide current toast first
      setVisible(false);

      setTimeout(() => {
        setToastIndex((prev) => {
          const nextIdx = (prev + 1) % DEFAULT_TOASTS.length;
          setCurrentToast(DEFAULT_TOASTS[nextIdx]);
          setVisible(true);
          return nextIdx;
        });
      }, 500);

      // Auto-hide toast after 7 seconds of display
      setTimeout(() => {
        setVisible(false);
      }, 7500);
    }, 32000);

    return () => clearInterval(interval);
  }, [dismissed, isUserTyping]);

  if (!currentToast || dismissed) return null;

  const renderIcon = (type: ToastItem['icon']) => {
    switch (type) {
      case 'flame':
        return <Flame className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'mountain':
        return <Mountain className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'ticket':
        return <Ticket className="w-4 h-4 text-[#D87945] shrink-0" />;
      case 'users':
        return <Users className="w-4 h-4 text-purple-400 shrink-0" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-6 z-40 transition-all duration-500 ease-out transform ${
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <div className="backdrop-blur-md bg-stone-900/90 border border-white/10 rounded-xl p-3.5 shadow-2xl flex items-center gap-3 max-w-sm text-left">
        {/* Pulsing Green Status Dot */}
        <div className="relative flex items-center justify-center shrink-0">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>

        {/* Icon Frame */}
        <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
          {renderIcon(currentToast.icon)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-bold text-white tracking-tight leading-snug truncate">
            {currentToast.title}
          </p>
          <p className="text-[10px] text-stone-400 font-medium leading-tight truncate">
            {currentToast.subtitle}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
