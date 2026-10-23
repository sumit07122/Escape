'use client';

import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface SeatHoldTimerProps {
  selectedSeats: string[];
  secondsRemaining: number;
  busNumber?: string;
}

export default function SeatHoldTimer({
  selectedSeats,
  secondsRemaining,
  busNumber,
}: SeatHoldTimerProps) {
  if (selectedSeats.length === 0) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = secondsRemaining <= 90;

  if (secondsRemaining <= 0) {
    return (
      <div className="p-3 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">
            Your reservation hold for Seat{selectedSeats.length > 1 ? 's' : ''} [{selectedSeats.join(', ')}] has expired. Please pick your seat again.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`sticky top-3 z-30 w-full max-w-xl p-3 rounded-2xl border transition-all duration-300 flex flex-wrap items-center justify-between gap-3 shadow-lg backdrop-blur-sm ${
        isUrgent
          ? 'bg-rose-50/95 border-rose-500/40 text-rose-900 animate-pulse'
          : 'bg-amber-50/95 border-amber-500/30 text-amber-950'
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-medium">
        <Clock className={`w-4 h-4 shrink-0 ${isUrgent ? 'text-rose-600' : 'text-amber-600'}`} />
        <span>
          Seat{selectedSeats.length > 1 ? 's' : ''}{' '}
          <span className="font-mono font-black text-[#163C32]">
            [{selectedSeats.join(', ')}]
          </span>{' '}
          {busNumber ? `on ${busNumber} ` : ''}is locked for you.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
          RESERVATION EXPIRES IN:
        </span>
        <span
          className={`font-mono text-sm sm:text-base font-black px-2.5 py-0.5 rounded-lg border ${
            isUrgent
              ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
              : 'bg-stone-900 text-amber-400 border-white/10'
          }`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
