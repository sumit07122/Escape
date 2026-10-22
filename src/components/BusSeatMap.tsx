'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bus, Clock, Check, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { SittingPreference, SeatStatus } from '@/types';
import { isSeatRecommended, formatHoldCountdown } from '@/lib/bus-seating';

export interface SeatData {
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

export interface BusSummary {
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
  requiredSeatsCount: number;
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

// Canonical Coach Titles
const COACH_NAMES: Record<string, string> = {
  'Bus 01': 'Himalayan Eagle',
  'Bus 02': 'Parvati Cruiser',
  'Bus 03': 'Solang Glider',
  'Bus 04': 'Rohtang Explorer',
};

export default function BusSeatMap({
  requiredSeatsCount,
  selectedSeats,
  selectedBusId,
  onSeatSelect,
  bookingSessionId,
  preference = 'NO_PREFERENCE',
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

  // 1. Fetch all buses
  const loadBuses = useCallback(async () => {
    try {
      const res = await fetch('/api/buses');
      if (res.ok) {
        const data = await res.json();
        setBuses(data.buses || []);

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
      newSelected = selectedSeats.filter((s) => s !== seat.seatNumber);
    } else {
      if (selectedSeats.length >= requiredSeatsCount) {
        if (requiredSeatsCount === 1) {
          newSelected = [seat.seatNumber];
        } else {
          setErrorMessage(`You have already selected all ${requiredSeatsCount} seats.`);
          return;
        }
      } else {
        newSelected = [...selectedSeats, seat.seatNumber];
      }
    }

    if (newSelected.length > 0) {
      try {
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
          setErrorMessage(data.error || 'Seat currently held by another student');
          loadSeats(activeBusId);
          return;
        }

        setHoldTimerSeconds(data.heldSecondsRemaining || 600);
        onSeatSelect(activeBusId, newSelected);
        await loadSeats(activeBusId);
      } catch {
        setErrorMessage('Failed to connect to seat server. Please try again.');
      }
    } else {
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

  const leftSideSeats = seats.filter((s) => s.side === 'LEFT');
  const rightSideSeats = seats.filter((s) => s.side === 'RIGHT');
  const rearSeats = seats.filter((s) => s.side === 'REAR');

  const leftPairs: Array<SeatData[]> = [
    leftSideSeats.filter((s) => ['L1', 'L2'].includes(s.seatNumber)),
    leftSideSeats.filter((s) => ['L3', 'L4'].includes(s.seatNumber)),
    leftSideSeats.filter((s) => ['L5', 'L6'].includes(s.seatNumber)),
    leftSideSeats.filter((s) => ['L7', 'L8'].includes(s.seatNumber)),
    leftSideSeats.filter((s) => s.seatNumber === 'L9'),
  ];

  const rightPairs: Array<SeatData[]> = [
    rightSideSeats.filter((s) => ['R1', 'R2'].includes(s.seatNumber)),
    rightSideSeats.filter((s) => ['R3', 'R4'].includes(s.seatNumber)),
    rightSideSeats.filter((s) => ['R5', 'R6'].includes(s.seatNumber)),
    rightSideSeats.filter((s) => ['R7', 'R8'].includes(s.seatNumber)),
    rightSideSeats.filter((s) => s.seatNumber === 'R9'),
  ];

  const rearSorted = ['B1', 'B2', 'B3', 'B4', 'B5']
    .map((num) => rearSeats.find((s) => s.seatNumber === num))
    .filter(Boolean) as SeatData[];

  const renderSeatButton = (seat: SeatData) => {
    const isSelected = selectedSeats.includes(seat.seatNumber);
    const isRecommended = preference !== 'NO_PREFERENCE' && isSeatRecommended(seat, preference);

    let bgColor = 'bg-white border-[#D8D2C4] text-[#1C1C1C] hover:border-[#163C32] hover:bg-[#F7F5EF]';
    let label = seat.seatNumber;
    let isDisabled = false;

    if (!seat.isBookable) {
      bgColor = 'bg-[#E7E2D8] text-[#9A9589] border-[#D8D2C4] cursor-not-allowed';
      isDisabled = true;
    } else if (seat.status === 'BOOKED') {
      bgColor = 'bg-[#EFECE4] text-[#8FA69F] border-[#D8D2C4] line-through cursor-not-allowed opacity-60';
      isDisabled = true;
    } else if (seat.status === 'UNAVAILABLE') {
      bgColor = 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed';
      isDisabled = true;
    } else if (seat.status === 'HELD') {
      if (seat.isMyHold || isSelected) {
        bgColor = 'bg-[#163C32] text-white border-[#163C32] font-black shadow-md';
      } else {
        bgColor = 'bg-[#FDF4E7] border-[#D87945] text-[#D87945] cursor-not-allowed';
        isDisabled = true;
      }
    } else if (isSelected) {
      bgColor = 'bg-[#163C32] text-white border-[#163C32] font-black shadow-md';
    }

    // Preference Highlight Ring
    const isPreferenceMatch =
      preference !== 'NO_PREFERENCE' &&
      ((preference === 'WINDOW' && seat.position === 'WINDOW') ||
        (preference === 'AISLE' && seat.position === 'AISLE') ||
        (preference === 'BACK' && (seat.side === 'REAR' || seat.rowNumber >= 4)) ||
        (preference === 'FRONT' && seat.rowNumber <= 2));

    const ringClasses = isSelected
      ? 'ring-2 ring-[#D87945] ring-offset-2'
      : isPreferenceMatch && seat.status === 'AVAILABLE'
      ? 'ring-2 ring-[#D87945]/70 ring-offset-1'
      : '';

    return (
      <button
        key={seat.id || seat.seatNumber}
        id={`seat-${seat.seatNumber}`}
        data-seat={seat.seatNumber}
        type="button"
        disabled={isDisabled && !isAdmin}
        onClick={() => handleSeatClick(seat)}
        aria-label={`Seat ${seat.seatNumber}, ${seat.position}, status: ${seat.status}`}
        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex flex-col items-center justify-center transition-all seat-shadow ${bgColor} ${ringClasses}`}
        title={`${seat.seatNumber} (${seat.position} • Row ${seat.rowNumber}) - ${seat.status}`}
      >
        {isRecommended && seat.status === 'AVAILABLE' && !isSelected && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#D87945] flex items-center justify-center text-[9px] text-white font-black shadow-xs">
            ★
          </span>
        )}

        {isSelected ? (
          <Check className="w-5 h-5 text-white stroke-[3]" />
        ) : (
          <span className="text-xs font-bold">{label}</span>
        )}

        <span className="text-[8px] uppercase tracking-tighter opacity-70">
          {seat.position === 'WINDOW' ? 'WIN' : seat.position === 'AISLE' ? 'AISLE' : 'REAR'}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col items-center text-[#1C1C1C]">
      {/* Bus Selector Tabs: Bus 01 through Bus 04 with Full Names */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#646864] uppercase tracking-wider">
            Select Coach:
          </span>
          <button
            onClick={() => {
              loadBuses();
              if (activeBusId) loadSeats(activeBusId);
            }}
            className="flex items-center gap-1.5 text-xs text-[#163C32] hover:text-[#0E2620] font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Availability</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {buses.map((bus) => {
            const isActive = bus.id === activeBusId;
            const coachName = COACH_NAMES[bus.busNumber] || bus.vehicleName.split('(')[0].trim() || 'Himalayan Express';

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
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'bg-[#163C32] border-[#163C32] text-white shadow-md'
                    : 'bg-white border-[#D8D2C4] text-[#1C1C1C] hover:border-[#163C32]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm">{bus.busNumber}</span>
                  {bus.stats.isFull ? (
                    <span className="text-[9px] font-bold text-red-500 uppercase">FULL</span>
                  ) : (
                    <span className={`text-[10px] font-bold ${isActive ? 'text-[#D87945]' : 'text-[#163C32]'}`}>
                      {bus.stats.availableCount} free
                    </span>
                  )}
                </div>
                <div className={`text-[11px] font-medium truncate mt-0.5 ${isActive ? 'text-amber-200' : 'text-[#646864]'}`}>
                  {coachName}
                </div>
                <p className={`text-[10px] mt-0.5 ${isActive ? 'text-stone-300' : 'text-[#8FA69F]'}`}>
                  {bus.stats.bookedCount}/{bus.stats.totalSeats} seats
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error / Alert Message */}
      {errorMessage && (
        <div className="w-full max-w-xl mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preference recommendation indicator */}
      {preference !== 'NO_PREFERENCE' && (
        <div className="w-full max-w-xl mb-4 p-2.5 rounded-xl bg-white border border-[#D8D2C4] flex items-center gap-2 text-xs text-[#1C1C1C]">
          <Sparkles className="w-4 h-4 text-[#D87945] shrink-0" />
          <span>
            Highlighting recommended <strong className="text-[#D87945]">{preference.toLowerCase()}</strong> seats with amber rings. You may pick any seat.
          </span>
        </div>
      )}

      {/* Bus Visual Chassis Container with Topographic Grid */}
      <div className="w-full max-w-md bg-white coach-grid rounded-3xl p-5 sm:p-7 border border-[#D8D2C4] shadow-sm relative">
        {/* Front Bus Cabin / Windshield */}
        <div className="mb-6 pt-1 pb-4 border-b-2 border-dashed border-[#D8D2C4] text-center">
          <div className="w-full h-8 rounded-t-2xl bg-[#F7F5EF] border-t-2 border-[#163C32] flex items-center justify-center mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#163C32] flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5" /> FRONT OF COACH
            </span>
          </div>

          {/* Reserved Cabin Positions: Driver & Conductor */}
          <div className="grid grid-cols-2 gap-4 px-4">
            <div className="p-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] flex items-center justify-between">
              <span className="text-xs font-bold text-[#646864]">DRIVER</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-[#646864] border border-[#D8D2C4] uppercase">
                NON-BOOKABLE
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] flex items-center justify-between">
              <span className="text-xs font-bold text-[#646864]">CONDUCTOR</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-[#646864] border border-[#D8D2C4] uppercase">
                NON-BOOKABLE
              </span>
            </div>
          </div>
        </div>

        {/* Passenger Seating Layout (2x2 Geometry) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-2 text-[10px] font-bold text-[#646864] uppercase tracking-wider">
            <span>LEFT (WINDOW / AISLE)</span>
            <span className="tracking-widest text-[#8FA69F]">AISLE</span>
            <span>RIGHT (AISLE / WINDOW)</span>
          </div>

          {/* Rows 1 through 4 (2+2) */}
          {[0, 1, 2, 3].map((rowIdx) => {
            const leftPair = leftPairs[rowIdx] || [];
            const rightPair = rightPairs[rowIdx] || [];

            return (
              <div key={rowIdx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {leftPair[0] && renderSeatButton(leftPair[0])}
                  {leftPair[1] && renderSeatButton(leftPair[1])}
                </div>

                <div className="flex-1 flex justify-center items-center">
                  <div className="w-6 h-px bg-[#EFECE4]" />
                </div>

                <div className="flex items-center gap-2">
                  {rightPair[0] && renderSeatButton(rightPair[0])}
                  {rightPair[1] && renderSeatButton(rightPair[1])}
                </div>
              </div>
            );
          })}

          {/* Row 5: L9 & R9 single seats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {leftPairs[4]?.[0] && renderSeatButton(leftPairs[4][0])}
              <div className="w-11 h-11 sm:w-12 sm:h-12" />
            </div>

            <div className="flex-1 flex justify-center items-center">
              <span className="text-[9px] text-[#8FA69F] font-mono uppercase">AISLE WALKWAY</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12" />
              {rightPairs[4]?.[0] && renderSeatButton(rightPairs[4][0])}
            </div>
          </div>

          {/* Rear 5-Seat Bench: B1, B2, B3, B4, B5 */}
          <div className="pt-3 border-t-2 border-dashed border-[#D8D2C4]">
            <div className="text-center mb-2">
              <span className="text-[10px] font-bold text-[#646864] uppercase tracking-widest">
                REAR 5-SEAT BENCH (B1 - B5)
              </span>
            </div>
            <div className="flex items-center justify-between gap-1.5">
              {rearSorted.map((seat) => renderSeatButton(seat))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 text-center border-t border-[#D8D2C4]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8FA69F]">
            REAR OF COACH
          </span>
        </div>
      </div>

      {/* Live 10-Minute Hold Countdown Timer at Bottom of Seat Selector */}
      {holdTimerSeconds > 0 && (
        <div className="w-full max-w-xl mt-4 p-4 rounded-2xl bg-[#FDF4E7] border-2 border-[#D87945] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D87945]/20 flex items-center justify-center text-[#D87945]">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-[#1C1C1C] uppercase tracking-wide">
                Atomic Seat Lease Active ({selectedSeats.join(', ')})
              </p>
              <p className="text-[11px] text-[#646864]">
                Complete ₹1,000 reservation payment before timer expires:
              </p>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white font-mono text-lg font-black text-[#D87945] border border-[#D87945] shadow-xs">
            {formatHoldCountdown(holdTimerSeconds)}
          </div>
        </div>
      )}

      {/* Legend & Seat Status Guide */}
      <div className="w-full max-w-xl mt-6 p-4 rounded-2xl bg-white border border-[#D8D2C4] shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-white border border-[#D8D2C4] seat-shadow shrink-0" />
            <span className="text-[#646864]">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#163C32] shrink-0" />
            <span className="text-[#1C1C1C] font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#FDF4E7] border border-[#D87945] shrink-0" />
            <span className="text-[#D87945] font-semibold">Held (10m)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#EFECE4] text-[#8FA69F] line-through flex items-center justify-center text-[10px] shrink-0">
              ✕
            </span>
            <span className="text-[#646864]">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#E7E2D8] shrink-0" />
            <span className="text-[#8FA69F]">Cabin Crew</span>
          </div>
        </div>
      </div>
    </div>
  );
}
