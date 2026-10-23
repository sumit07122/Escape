'use client';

import React, { useState, useEffect } from 'react';
import {
  Bus as BusIcon, RefreshCw, Lock, Unlock, ArrowLeftRight,
  User, Phone, Hash, AlertCircle, CheckCircle2, X, Loader2,
  ShieldAlert, ShieldCheck, Ticket
} from 'lucide-react';

interface SeatBookingData {
  id: string;
  traveller?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    rollNumber?: string | null;
    collegeId?: string | null;
  } | null;
  booking: {
    id: string;
    bookingId: string;
    primaryTravellerName: string;
  };
}

interface BusSeatData {
  id: string;
  busId: string;
  seatNumber: string;
  seatType: string;
  rowNumber: number;
  side: string;
  position: string;
  isBookable: boolean;
  isAvailable: boolean;
  status: string; // 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED' | 'UNAVAILABLE'
  seatBooking?: SeatBookingData | null;
  seatHold?: any;
}

interface BusData {
  id: string;
  busNumber: string;
  vehicleName: string;
  vehicleNumber: string;
  passengerCapacity: number;
  driverName?: string | null;
  driverPhone?: string | null;
  conductorName?: string | null;
  conductorPhone?: string | null;
  seats: BusSeatData[];
}

interface AvailableOption {
  id: string;
  busNumber: string;
  seatNumber: string;
  position: string;
  label: string;
}

export default function FleetSeatMatrixTab() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<BusSeatData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [targetSeatId, setTargetSeatId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/buses?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (res.ok) {
        const data = await res.json();

        setBuses(data.buses || []);
        if (data.buses?.length > 0 && !selectedBusId) {
          setSelectedBusId(data.buses[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching buses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const activeBus = buses.find((b) => b.id === selectedBusId) || buses[0];

  // Calculate available open seats across all buses for reassignment
  const allAvailableSeats: AvailableOption[] = [];
  buses.forEach((b) => {
    b.seats.forEach((s) => {
      if (
        s.seatType === 'PASSENGER' &&
        (s.status === 'AVAILABLE' || (s.isAvailable && !s.seatBooking && s.status !== 'BLOCKED'))
      ) {
        allAvailableSeats.push({
          id: s.id,
          busNumber: b.busNumber,
          seatNumber: s.seatNumber,
          position: s.position,
          label: `${b.busNumber} • Seat ${s.seatNumber} (${s.position})`,
        });
      }
    });
  });

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Block or Unblock Seat
  const handleToggleBlock = async () => {
    if (!selectedSeat) return;
    setActionLoading(true);

    const isCurrentlyBlocked = selectedSeat.status === 'BLOCKED' || selectedSeat.status === 'UNAVAILABLE';
    const newStatus = isCurrentlyBlocked ? 'AVAILABLE' : 'BLOCKED';

    try {
      const res = await fetch('/api/admin/seats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatId: selectedSeat.id,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to update seat status');
      } else {
        showToast('success', data.message || `Seat ${selectedSeat.seatNumber} marked as ${newStatus}`);
        if (data.buses) {
          setBuses(data.buses);
        } else {
          await fetchBuses();
        }
        setDrawerOpen(false);
        setSelectedSeat(null);
      }
    } catch {
      showToast('error', 'Network error modifying seat status');
    } finally {
      setActionLoading(false);
    }
  };

  // Reassign Seat
  const handleReassign = async () => {
    if (!selectedSeat || !targetSeatId) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/seats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatId: selectedSeat.id,
          targetSeatId,
          action: 'REASSIGN',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to reassign seat');
      } else {
        showToast('success', data.message || 'Passenger reassigned successfully');
        if (data.buses) {
          setBuses(data.buses);
        } else {
          await fetchBuses();
        }
        setDrawerOpen(false);
        setSelectedSeat(null);
        setTargetSeatId('');
      }
    } catch {
      showToast('error', 'Network error reassigning seat');
    } finally {
      setActionLoading(false);
    }
  };

  // Clear Seat Booking
  const handleClearSeat = async () => {
    if (!selectedSeat) return;
    if (!confirm(`Are you sure you want to vacate Seat ${selectedSeat.seatNumber}? This unlinks the passenger booking from this seat.`)) {
      return;
    }
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/seats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatId: selectedSeat.id,
          action: 'CLEAR',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to vacate seat');
      } else {
        showToast('success', data.message || `Seat ${selectedSeat.seatNumber} vacated`);
        if (data.buses) {
          setBuses(data.buses);
        } else {
          await fetchBuses();
        }
        setDrawerOpen(false);
        setSelectedSeat(null);
      }
    } catch {
      showToast('error', 'Network error vacating seat');
    } finally {
      setActionLoading(false);
    }
  };

  const getSeatVisuals = (seat: BusSeatData) => {
    const isOccupied = !!seat.seatBooking;
    const isBlocked = seat.status === 'BLOCKED' || (!seat.isBookable && !isOccupied);
    const isHeld = !isOccupied && (seat.status === 'HELD' || !!seat.seatHold);

    if (isBlocked) {
      return {
        bg: 'bg-rose-950/40 text-rose-300 border-rose-500/60 [background-image:repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(239,68,68,0.18)_6px,rgba(239,68,68,0.18)_12px)]',
        label: 'BLOCKED',
        tag: 'Blocked by Admin',
      };
    }
    if (isOccupied) {
      return {
        bg: 'bg-sky-500/25 text-sky-200 border-sky-400/50 hover:bg-sky-500/40 shadow-sm',
        label: 'BOOKED',
        tag: seat.seatBooking?.traveller?.fullName || 'Booked',
      };
    }
    if (isHeld) {
      return {
        bg: 'bg-amber-500/25 text-amber-200 border-amber-400/50 hover:bg-amber-500/35 animate-pulse',
        label: 'HELD',
        tag: 'Held (10m checkout)',
      };
    }
    return {
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/35 hover:scale-105',
      label: 'AVAILABLE',
      tag: 'Available',
    };
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Fleet Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif">
            Coach Fleet & Seat Allocation Matrix
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time interactive pushback seat map. Click any seat to inspect passenger details, lock for luggage/staff, or reassign instantly.
          </p>
        </div>

        <button
          onClick={fetchBuses}
          disabled={loading}
          className="self-start lg:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-amber-400/40 text-xs font-bold text-stone-200 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* 4-Bus Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {buses.map((bus) => {
          const bookedCount = bus.seats.filter(
            (s) => s.seatType === 'PASSENGER' && (s.seatBooking || s.status === 'BOOKED')
          ).length;
          const blockedCount = bus.seats.filter(
            (s) => s.status === 'BLOCKED' || (!s.isBookable && !s.seatBooking)
          ).length;
          const isSelected = bus.id === (activeBus?.id || selectedBusId);

          return (
            <button
              key={bus.id}
              type="button"
              onClick={() => setSelectedBusId(bus.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-500/10'
                  : 'bg-stone-900/60 border-white/10 hover:border-white/20 hover:bg-stone-900/90'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-bl-lg" />
              )}
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-white tracking-tight">
                  {bus.busNumber}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {bookedCount}/{bus.passengerCapacity} Booked
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate mt-1">
                {bus.vehicleName}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-2 font-mono">
                <span>Driver: {bus.driverName?.split(' ')[0] || 'Rajesh'}</span>
                {blockedCount > 0 && (
                  <span className="text-rose-400 font-bold">• {blockedCount} Blocked</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Bus Layout & Legend */}
      {activeBus && (
        <div className="backdrop-blur-md bg-stone-900/75 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Active Bus Overview Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                ACTIVE VEHICLE INSPECTOR
              </span>
              <h3 className="text-xl font-black text-white">
                {activeBus.busNumber} • {activeBus.vehicleName}
              </h3>
              <p className="text-xs text-stone-400">
                Plate: <span className="font-mono text-stone-200">{activeBus.vehicleNumber}</span> • Driver: {activeBus.driverName} ({activeBus.driverPhone})
              </p>
            </div>

            {/* Visual Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border border-emerald-500/50" />
                <span className="text-emerald-300">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-sky-500/25 border border-sky-400/60" />
                <span className="text-sky-300">Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-500/25 border border-amber-400/60" />
                <span className="text-amber-300">Held (10m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-950/50 border border-rose-500/60 [background-image:repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(239,68,68,0.3)_3px,rgba(239,68,68,0.3)_6px)]" />
                <span className="text-rose-300">Blocked by Admin</span>
              </div>
            </div>
          </div>

          {/* Bus Shell Container */}
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-stone-950/80 border border-white/10 relative shadow-2xl">
            {/* Front Cabin Windshield Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10 text-xs font-bold text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>FRONT CABIN • MAIN DOOR (LEFT)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 font-mono text-[10px]">
                  DRIVER CABIN
                </span>
              </div>
            </div>

            {/* Pushback 2x2 Seat Layout Grid */}
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, rowIndex) => {
                const row = rowIndex + 1;
                const leftWindow = activeBus.seats.find((s) => s.rowNumber === row && s.side === 'LEFT' && s.position === 'WINDOW');
                const leftAisle = activeBus.seats.find((s) => s.rowNumber === row && s.side === 'LEFT' && s.position === 'AISLE');
                const rightAisle = activeBus.seats.find((s) => s.rowNumber === row && s.side === 'RIGHT' && s.position === 'AISLE');
                const rightWindow = activeBus.seats.find((s) => s.rowNumber === row && s.side === 'RIGHT' && s.position === 'WINDOW');

                return (
                  <div key={row} className="flex items-center justify-between gap-2 sm:gap-4">
                    {/* Left Pair (Window & Aisle) */}
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      {leftWindow && renderSeatButton(leftWindow)}
                      {leftAisle && renderSeatButton(leftAisle)}
                    </div>

                    {/* Central Aisle */}
                    <div className="w-8 sm:w-12 text-center text-[10px] font-mono text-stone-600 select-none">
                      R{row}
                    </div>

                    {/* Right Pair (Aisle & Window) */}
                    <div className="flex items-center gap-2 flex-1 justify-start">
                      {rightAisle && renderSeatButton(rightAisle)}
                      {rightWindow && renderSeatButton(rightWindow)}
                    </div>
                  </div>
                );
              })}

              {/* Rear Bench Row (B1 to B5 if present or row 7) */}
              {activeBus.seats.some((s) => s.side === 'REAR' || s.rowNumber >= 7) && (
                <div className="pt-4 border-t border-white/10">
                  <span className="block text-center text-[10px] font-bold uppercase text-stone-500 mb-2">
                    REAR COMFORT BENCH
                  </span>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {activeBus.seats
                      .filter((s) => s.side === 'REAR' || s.rowNumber >= 7)
                      .map((seat) => renderSeatButton(seat))}
                  </div>
                </div>
              )}
            </div>

            {/* Rear Footnote */}
            <div className="text-center pt-6 text-[10px] text-stone-500 uppercase tracking-widest font-mono">
              ENGINE & REAR LUGGAGE COMPARTMENT
            </div>
          </div>
        </div>
      )}

      {/* QUICK ACTION DRAWER / MODAL FOR SELECTED SEAT */}
      {drawerOpen && selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-stone-900 border border-white/20 p-6 sm:p-8 space-y-6 shadow-2xl text-left relative animate-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={() => {
                setDrawerOpen(false);
                setSelectedSeat(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400">
                <BusIcon className="w-4 h-4" />
                <span>{activeBus?.busNumber}</span>
              </div>
              <h3 className="text-2xl font-black text-white font-serif mt-1">
                Seat {selectedSeat.seatNumber} ({selectedSeat.position})
              </h3>
              <p className="text-xs text-stone-400">
                Current Status: <span className="font-bold text-white uppercase">{selectedSeat.status}</span>
              </p>
            </div>

            {/* Passenger Details (If Booked) */}
            {selectedSeat.seatBooking?.traveller ? (
              <div className="p-4 rounded-2xl bg-stone-950 border border-white/10 space-y-2.5">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                  CONFIRMED PASSENGER DETAILS
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Student Full Name</span>
                    <span className="font-bold text-white block truncate">
                      {selectedSeat.seatBooking.traveller.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Mobile Number</span>
                    <a
                      href={`tel:${selectedSeat.seatBooking.traveller.phone}`}
                      className="font-bold text-emerald-400 hover:underline block font-mono"
                    >
                      {selectedSeat.seatBooking.traveller.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Roll / College ID</span>
                    <span className="font-mono text-stone-200">
                      {selectedSeat.seatBooking.traveller.rollNumber || selectedSeat.seatBooking.traveller.collegeId || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">Booking Reference</span>
                    <span className="font-mono font-bold text-amber-400">
                      {selectedSeat.seatBooking.booking.bookingId}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-950/60 border border-white/10 text-xs text-stone-400 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-stone-500 shrink-0" />
                <span>This seat does not have a confirmed passenger booking.</span>
              </div>
            )}

            {/* Action 1: Toggle Block / Unblock */}
            <div className="p-4 rounded-2xl bg-stone-800/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Coordinator Seat Lock</h4>
                  <p className="text-[11px] text-stone-400">
                    {selectedSeat.status === 'BLOCKED'
                      ? 'Seat is currently reserved for staff/luggage and blocked from student bookings.'
                      : 'Lock this seat to reserve it for coordinators, drivers, or medical supplies.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBlock}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    selectedSeat.status === 'BLOCKED'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {selectedSeat.status === 'BLOCKED' ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unblock Seat</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Block Seat</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action 2: Reassign Passenger to another Seat (if occupied) */}
            {selectedSeat.seatBooking && (
              <div className="p-4 rounded-2xl bg-stone-800/40 border border-white/10 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reassign Student to Different Seat</span>
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Instantly move this passenger to any available seat across all 4 coaches.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={targetSeatId}
                    onChange={(e) => setTargetSeatId(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Select destination seat...</option>
                    {allAvailableSeats.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleReassign}
                    disabled={!targetSeatId || actionLoading}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Move
                  </button>
                </div>
              </div>
            )}

            {/* Action 3: Vacate / Clear (if occupied) */}
            {selectedSeat.seatBooking && (
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleClearSeat}
                  disabled={actionLoading}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold underline"
                >
                  Vacate Seat (Clear Booking)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setSelectedSeat(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 text-white font-bold text-xs hover:bg-stone-700"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function renderSeatButton(seat: BusSeatData) {
    const visual = getSeatVisuals(seat);
    const occupant = seat.seatBooking?.traveller;
    const initials = occupant?.fullName
      ? occupant.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : null;

    return (
      <button
        key={seat.id}
        type="button"
        onClick={() => {
          setSelectedSeat(seat);
          setDrawerOpen(true);
        }}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative group ${visual.bg}`}
        title={`Seat ${seat.seatNumber} — ${visual.tag}`}
      >
        <span className="text-[11px] sm:text-xs font-black tracking-tight leading-none font-mono">
          {seat.seatNumber}
        </span>
        {initials ? (
          <span className="text-[9px] font-bold text-white uppercase tracking-widest mt-0.5 truncate max-w-[38px]">
            {initials}
          </span>
        ) : (
          <span className="text-[8px] opacity-75 uppercase tracking-tighter mt-0.5">
            {seat.position.slice(0, 3)}
          </span>
        )}
      </button>
    );
  }
}
