'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bus, Clock, Check, Sparkles, AlertCircle, RefreshCw, UserCheck, ShieldAlert } from 'lucide-react';
import { SittingPreference, SeatStatus } from '@/types';
import { isSeatRecommended, formatHoldCountdown } from '@/lib/bus-seating';

interface SeatData {
  id: string;
  seatNumber: string;
  seatType: 'DRIVER' | 'CONDUCTOR' | 'PASSENGER';
  rowNumber: number;
  side: 'LEFT' | 'RIGHT' | 'REAR' | 'FRONT';
  position: 'WINDOW' | 'AISLE' | 'REAR' | 'CABIN';
  isBookable: boolean;
  status: SeatStatus;
  heldSecondsRemaining: number;
  isMyHold: boolean;
  bookedDetails?: {
    travellerName: string;
    bookingId: string;
  } | null;
}

interface BusSummary {
  id: string;
  busNumber: string;
  vehicleName: string;
  vehicleNumber: string;
  passengerCapacity: number;
  stats: {
    totalSeats: number;
    bookedCount: number;
    heldCount: number;
    availableCount: number;
    isFull: boolean;
  };
}

interface BusSeatMapProps {
  requiredSeatsCount: number; // 1 for Single, 2 for Couple, 6 for Group
  selectedSeats: string[];
  selectedBusId: string;
  onSeatSelect: (busId: string, seatNumbers: string[]) => void;
  bookingSessionId: string;
  preference?: SittingPreference;
  packageType?: string;
  readOnly?: boolean;
  isAdmin?: boolean;
  onAdminSeatClick?: (seat: SeatData, busId: string) => void;
}

export default function BusSeatMap({
  requiredSeatsCount,
  selectedSeats,
  selectedBusId,
  onSeatSelect,
  bookingSessionId,
  preference = 'NO_PREFERENCE',
  packageType = 'SINGLE',
  readOnly = false,
  isAdmin = false,
  onAdminSeatClick,
}: BusSeatMapProps) {
  const [buses, setBuses] = useState<BusSummary[]>([]);
  const [activeBusId, setActiveBusId] = useState<string>(selectedBusId || '');
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHolding, setIsHolding] = useState(false);

  // 1. Fetch all buses
  const loadBuses = useCallback(async () => {
    try {
      const res = await fetch('/api/buses');
      if (res.ok) {
        const data = await res.json();
        setBuses(data.buses || []);

        // Default to first bus with available seats or Bus 01
        if (!activeBusId && data.buses?.length > 0) {
          const firstAvailable = data.buses.find((b: BusSummary) => !b.stats.isFull) || data.buses[0];
          setActiveBusId(firstAvailable.id);
        }
      }
    } catch (err) {
      console.error('Error loading buses:', err);
    }
  }, [activeBusId]);

  // 2. Fetch seats for active bus
  const loadSeats = useCallback(async (busId: string) => {
    if (!busId) return;
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/buses/${busId}/seats?bookingSessionId=${encodeURIComponent(bookingSessionId)}`);
      if (res.ok) {
        const data = await res.json();
        setSeats(data.seats || []);

        // Find my active held seats and start timer
        const myHeld = (data.seats || []).filter((s: SeatData) => s.isMyHold && s.heldSecondsRemaining > 0);
        if (myHeld.length > 0) {
          const maxRemaining = Math.max(...myHeld.map((s: SeatData) => s.heldSecondsRemaining));
          setHoldTimerSeconds(maxRemaining);
        } else if (selectedSeats.length === 0) {
          setHoldTimerSeconds(0);
        }
      }
    } catch (err) {
      console.error('Error loading seats:', err);
      setErrorMessage('Failed to refresh seat map.');
    } finally {
      setLoading(false);
    }
  }, [bookingSessionId, selectedSeats.length]);

  useEffect(() => {
    loadBuses();
  }, [loadBuses]);

  useEffect(() => {
    if (activeBusId) {
      loadSeats(activeBusId);
    }
  }, [activeBusId, loadSeats]);

  // 3. Countdown timer for seat hold
  useEffect(() => {
    if (holdTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setHoldTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // When hold expires, refresh seats!
          if (activeBusId) loadSeats(activeBusId);
          onSeatSelect(activeBusId, []);
          setErrorMessage('Your 10-minute seat hold has expired. Please select your seats again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [holdTimerSeconds, activeBusId, loadSeats, onSeatSelect]);

  // Handle seat click
  const handleSeatClick = async (seat: SeatData) => {
    if (readOnly) return;

    if (isAdmin && onAdminSeatClick) {
      onAdminSeatClick(seat, activeBusId);
      return;
    }

    if (!seat.isBookable) return;
    if (seat.status === 'BOOKED' || seat.status === 'UNAVAILABLE') return;
    if (seat.status === 'HELD' && !seat.isMyHold) return;

    setErrorMessage(null);

    const isCurrentlySelected = selectedSeats.includes(seat.seatNumber);
    let newSelected: string[] = [];

    if (isCurrentlySelected) {
      // Deselect
      newSelected = selectedSeats.filter((s) => s !== seat.seatNumber);
    } else {
      // Add selection
      if (selectedSeats.length >= requiredSeatsCount) {
        // Replace or limit
        if (requiredSeatsCount === 1) {
          newSelected = [seat.seatNumber];
        } else {
          setErrorMessage(`You have already selected ${requiredSeatsCount} seat(s) for this package.`);
          return;
        }
      } else {
        newSelected = [...selectedSeats, seat.seatNumber];
      }
    }

    // Call server to hold the seats if any selected
    if (newSelected.length > 0) {
      try {
        setIsHolding(true);
        const res = await fetch('/api/seats/hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            busId: activeBusId,
            seatNumbers: newSelected,
            bookingSessionId,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || 'This seat was just held by another traveller.');
          loadSeats(activeBusId);
          return;
        }

        setHoldTimerSeconds(data.heldSecondsRemaining || 600);
        onSeatSelect(activeBusId, newSelected);
        await loadSeats(activeBusId);
      } catch {
        setErrorMessage('Failed to connect to seat server. Please try again.');
      } finally {
        setIsHolding(false);
      }
    } else {
      // Release
      try {
        await fetch('/api/seats/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            busId: activeBusId,
            seatNumbers: [seat.seatNumber],
            bookingSessionId,
          }),
        });
        onSeatSelect(activeBusId, []);
        setHoldTimerSeconds(0);
        await loadSeats(activeBusId);
      } catch {
        // Fallback
      }
    }
  };

  // Organize exact layout from seats array
  const leftSideSeats = seats.filter((s) => s.side === 'LEFT');
  const rightSideSeats = seats.filter((s) => s.side === 'RIGHT');
  const rearSeats = seats.filter((s) => s.side === 'REAR');
  const driverSeat = seats.find((s) => s.seatType === 'DRIVER');
  const conductorSeat = seats.find((s) => s.seatType === 'CONDUCTOR');

  // Pairings:
  // Left side: [L1, L2], [L3, L4], [L5, L6], [L7, L8], [L9]
  const leftPairs: Array<SeatData[]> = [
    leftSideSeats.filter((s) => ['L1', 'L2'].includes(s.seatNumber)),
    leftSideSeats.filter((s) => ['L3', 'L4'].includes(s.seatNumber)),
    leftSideSeats.filter((s) => ['L5', 'L6'].includes(s.seatNumber)),
    leftSideSeats.filter((s) => ['L7', 'L8'].includes(s.seatNumber)),
    leftSideSeats.filter((s) => s.seatNumber === 'L9'),
  ];

  // Right side: [R1, R2], [R3, R4], [R5, R6], [R7, R8], [R9]
  const rightPairs: Array<SeatData[]> = [
    rightSideSeats.filter((s) => ['R1', 'R2'].includes(s.seatNumber)),
    rightSideSeats.filter((s) => ['R3', 'R4'].includes(s.seatNumber)),
    rightSideSeats.filter((s) => ['R5', 'R6'].includes(s.seatNumber)),
    rightSideSeats.filter((s) => ['R7', 'R8'].includes(s.seatNumber)),
    rightSideSeats.filter((s) => s.seatNumber === 'R9'),
  ];

  // Rear 5 seats: B1, B2, B3, B4, B5
  const rearSorted = ['B1', 'B2', 'B3', 'B4', 'B5']
    .map((num) => rearSeats.find((s) => s.seatNumber === num))
    .filter(Boolean) as SeatData[];

  const renderSeatButton = (seat: SeatData) => {
    const isSelected = selectedSeats.includes(seat.seatNumber);
    const isRecommended = preference !== 'NO_PREFERENCE' && isSeatRecommended(seat, preference);

    let bgColor = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-800/40 hover:border-emerald-400';
    let label = seat.seatNumber;
    let isDisabled = false;

    if (!seat.isBookable) {
      bgColor = 'bg-zinc-800/60 border-zinc-700 text-zinc-400 cursor-not-allowed';
      isDisabled = true;
    } else if (seat.status === 'BOOKED') {
      bgColor = 'bg-rose-950/50 border-rose-800/60 text-rose-400/80 cursor-not-allowed line-through';
      isDisabled = !isAdmin;
    } else if (seat.status === 'UNAVAILABLE') {
      bgColor = 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed';
      isDisabled = !isAdmin;
    } else if (seat.status === 'HELD' && !seat.isMyHold) {
      bgColor = 'bg-amber-950/60 border-amber-600 text-amber-400 cursor-not-allowed animate-pulse';
      isDisabled = !isAdmin;
    } else if (isSelected || seat.isMyHold) {
      bgColor = 'bg-sky-500 border-sky-300 text-white font-bold shadow-lg shadow-sky-950/60 glow-blue scale-105';
    }

    return (
      <button
        key={seat.id || seat.seatNumber}
        id={`seat-${seat.seatNumber}`}
        data-seat={seat.seatNumber}
        type="button"
        disabled={isDisabled && !isAdmin}
        onClick={() => handleSeatClick(seat)}
        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${bgColor} ${
          isRecommended && !isSelected && seat.status === 'AVAILABLE' ? 'ring-2 ring-amber-400/80 ring-offset-2 ring-offset-zinc-950' : ''
        }`}
        title={`${seat.seatNumber} (${seat.position} • Row ${seat.rowNumber}) - ${seat.status}`}
      >
        {/* Recommended Sparkle indicator */}
        {isRecommended && seat.status === 'AVAILABLE' && !isSelected && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[9px] text-zinc-950 font-black">
            ★
          </span>
        )}

        {/* Selected Checkmark */}
        {isSelected ? (
          <Check className="w-5 h-5 text-white stroke-[3]" />
        ) : (
          <span className="text-xs font-bold">{label}</span>
        )}

        <span className="text-[9px] uppercase tracking-tighter opacity-70">
          {seat.position === 'WINDOW' ? 'WIN' : seat.position === 'AISLE' ? 'AISLE' : 'REAR'}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Bus Selector Tabs */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Select Coach:
          </span>
          <button
            onClick={() => {
              loadBuses();
              if (activeBusId) loadSeats(activeBusId);
            }}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Availability</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {buses.map((bus) => {
            const isActive = bus.id === activeBusId;
            return (
              <button
                key={bus.id}
                type="button"
                onClick={() => {
                  setActiveBusId(bus.id);
                  if (activeBusId !== bus.id) {
                    onSeatSelect(bus.id, []);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-emerald-950/80 border-emerald-500 shadow-md shadow-emerald-950 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm">{bus.busNumber}</span>
                  {bus.stats.isFull ? (
                    <span className="text-[10px] font-bold text-rose-400 uppercase">FULL</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-400">
                      {bus.stats.availableCount} free
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {bus.stats.bookedCount}/{bus.stats.totalSeats} booked
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seat Hold Live Countdown Alert */}
      {holdTimerSeconds > 0 && (
        <div className="w-full max-w-xl mb-4 p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/50 flex items-center justify-between shadow-lg glow-orange animate-pulse">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-amber-300">
                Seat(s) held for payment confirmation
              </p>
              <p className="text-[11px] text-amber-200/80">
                Complete ₹1,000 reservation before hold expires:
              </p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-lg bg-zinc-950 font-mono text-base font-black text-amber-400 border border-amber-500/50">
            {formatHoldCountdown(holdTimerSeconds)}
          </div>
        </div>
      )}

      {/* Error / Alert Message */}
      {errorMessage && (
        <div className="w-full max-w-xl mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 flex items-center gap-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preference recommendation indicator */}
      {preference !== 'NO_PREFERENCE' && (
        <div className="w-full max-w-xl mb-4 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Highlighting recommended <strong className="text-amber-400">{preference.toLowerCase()}</strong> seats with ★ badge. You can pick any available seat.
          </span>
        </div>
      )}

      {/* Bus Visual Chassis Container (Realistic BookMyShow Style) */}
      <div className="w-full max-w-md bg-zinc-950/90 rounded-3xl p-5 sm:p-7 border-2 border-zinc-700/80 shadow-2xl relative">
        {/* Front Bus Cabin / Windshield */}
        <div className="mb-6 pt-1 pb-4 border-b-2 border-dashed border-zinc-700/60 text-center">
          <div className="w-full h-8 rounded-t-2xl bg-gradient-to-b from-sky-950/40 to-transparent border-t-2 border-sky-600/40 flex items-center justify-center mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5" /> FRONT OF BUS (WINDSHIELD)
            </span>
          </div>

          {/* Reserved Cabin Positions: Driver & Conductor */}
          <div className="grid grid-cols-2 gap-4 px-4">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700/70 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400">DRIVER</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase">
                RESERVED
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700/70 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400">CONDUCTOR</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 uppercase">
                RESERVED
              </span>
            </div>
          </div>
        </div>

        {/* Passenger Seating Layout: LEFT SIDE | AISLE | RIGHT SIDE */}
        <div className="space-y-3.5">
          {/* Header indicator */}
          <div className="flex items-center justify-between px-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            <span>LEFT WINDOW / AISLE</span>
            <span className="tracking-widest">WALKWAY</span>
            <span>RIGHT AISLE / WINDOW</span>
          </div>

          {/* Rows 1 through 4 (2 seats left + aisle + 2 seats right) */}
          {[0, 1, 2, 3].map((rowIdx) => {
            const leftPair = leftPairs[rowIdx] || [];
            const rightPair = rightPairs[rowIdx] || [];

            return (
              <div key={rowIdx} className="flex items-center justify-between">
                {/* Left Pair */}
                <div className="flex items-center gap-2">
                  {leftPair[0] && renderSeatButton(leftPair[0])}
                  {leftPair[1] && renderSeatButton(leftPair[1])}
                </div>

                {/* Central Aisle */}
                <div className="flex-1 flex justify-center items-center">
                  <div className="w-8 h-px bg-zinc-800" />
                </div>

                {/* Right Pair */}
                <div className="flex items-center gap-2">
                  {rightPair[0] && renderSeatButton(rightPair[0])}
                  {rightPair[1] && renderSeatButton(rightPair[1])}
                </div>
              </div>
            );
          })}

          {/* Row 5: L9 (Single Left) | Aisle | R9 (Single Right) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {leftPairs[4]?.[0] && renderSeatButton(leftPairs[4][0])}
              <div className="w-11 h-11 sm:w-12 sm:h-12" /> {/* Empty spacer */}
            </div>

            <div className="flex-1 flex justify-center items-center">
              <span className="text-[10px] text-zinc-600 font-mono">AISLE</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12" /> {/* Empty spacer */}
              {rightPairs[4]?.[0] && renderSeatButton(rightPairs[4][0])}
            </div>
          </div>

          {/* Rear Row: B1, B2, B3, B4, B5 (5 continuous seats) */}
          <div className="pt-3 border-t-2 border-dashed border-zinc-800">
            <div className="text-center mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                REAR 5-SEAT ROW
              </span>
            </div>
            <div className="flex items-center justify-between gap-1.5">
              {rearSorted.map((seat) => renderSeatButton(seat))}
            </div>
          </div>
        </div>

        {/* Back of bus bumper */}
        <div className="mt-6 pt-3 text-center border-t border-zinc-800">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-600">
            BACK OF BUS
          </span>
        </div>
      </div>

      {/* Legend & Seat Status Guide */}
      <div className="w-full max-w-xl mt-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500 shrink-0" />
            <span className="text-zinc-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-sky-500 border border-sky-300 shrink-0" />
            <span className="text-zinc-300 font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500 shrink-0 animate-pulse" />
            <span className="text-zinc-300">Held (10m)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-rose-950 border border-rose-800 shrink-0" />
            <span className="text-zinc-300">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-zinc-900 border border-zinc-800 shrink-0" />
            <span className="text-zinc-500">Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
