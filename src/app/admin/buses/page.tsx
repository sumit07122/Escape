'use client';

import React, { useState, useEffect } from 'react';
import {
  Bus as BusIcon, Plus, UserCheck, ShieldAlert,
  ArrowRight, X, RefreshCw, AlertCircle, CheckCircle2, Lock, Unlock,
  User, Phone, Hash, ArrowLeftRight, UserMinus, ShieldCheck
} from 'lucide-react';

interface Occupant {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  rollNumber?: string | null;
  collegeId?: string | null;
  bookingId: string;
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
  status: string;
  seatBooking?: {
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
  } | null;
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

interface AvailableSeatOption {
  id: string;
  seatNumber: string;
  busId: string;
  busNumber: string;
  vehicleName: string;
  position: string;
  label: string;
}

interface UnassignedTravellerOption {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  collegeId?: string | null;
  rollNumber?: string | null;
  bookingId: string;
}

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [activeBusId, setActiveBusId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Available seats & unassigned travellers across all buses
  const [availableSeats, setAvailableSeats] = useState<AvailableSeatOption[]>([]);
  const [unassignedTravellers, setUnassignedTravellers] = useState<UnassignedTravellerOption[]>([]);

  // Selected seat for Drawer
  const [selectedSeat, setSelectedSeat] = useState<BusSeatData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [targetSeatId, setTargetSeatId] = useState('');
  const [selectedTravellerId, setSelectedTravellerId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Bus modal
  const [newBusModalOpen, setNewBusModalOpen] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('Bus 05');
  const [newVehicleNumber, setNewVehicleNumber] = useState('UP-85-GLA-005');
  const [newDriverName, setNewDriverName] = useState('');
  const [newPassengerCapacity, setNewPassengerCapacity] = useState('23');

  const fetchFleetData = async () => {
    try {
      setLoading(true);
      const [busesRes, seatsRes] = await Promise.all([
        fetch('/api/admin/buses'),
        fetch('/api/admin/seats'),
      ]);

      if (busesRes.ok) {
        const data = await busesRes.json();
        setBuses(data.buses || []);
        if (!activeBusId && data.buses?.length > 0) {
          setActiveBusId(data.buses[0].id);
        }
      }

      if (seatsRes.ok) {
        const seatMeta = await seatsRes.json();
        setAvailableSeats(seatMeta.availableSeats || []);
        setUnassignedTravellers(seatMeta.unassignedTravellers || []);
      }
    } catch (err) {
      console.error('Error fetching admin buses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  const currentBus = buses.find((b) => b.id === activeBusId);

  // When seat is clicked, open slide-over drawer
  const handleSeatClick = (seat: BusSeatData) => {
    setSelectedSeat(seat);
    setTargetSeatId('');
    setSelectedTravellerId(unassignedTravellers[0]?.id || '');
    setActionFeedback(null);
    setDrawerOpen(true);
  };

  // Execute admin seat actions via PATCH /api/admin/seats
  const handleSeatAction = async (action: 'LOCK' | 'UNLOCK' | 'CLEAR' | 'REASSIGN' | 'ASSIGN') => {
    if (!selectedSeat) return;
    setActionLoading(true);
    setActionFeedback(null);

    try {
      const payload: any = {
        seatId: selectedSeat.id,
        action,
      };

      if (action === 'REASSIGN') {
        if (!targetSeatId) {
          setActionFeedback({ type: 'error', message: 'Please select a destination seat.' });
          setActionLoading(false);
          return;
        }
        payload.targetSeatId = targetSeatId;
        payload.travellerId = selectedSeat.seatBooking?.traveller?.id;
      }

      if (action === 'ASSIGN') {
        if (!selectedTravellerId) {
          setActionFeedback({ type: 'error', message: 'Please select a student to assign.' });
          setActionLoading(false);
          return;
        }
        payload.travellerId = selectedTravellerId;
      }

      const res = await fetch('/api/admin/seats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({ type: 'error', message: data.error || 'Action failed.' });
      } else {
        setActionFeedback({ type: 'success', message: data.message || 'Updated successfully.' });
        // Refresh fleet data
        await fetchFleetData();

        // Update selected seat snapshot if still viewing
        setTimeout(() => {
          if (action === 'CLEAR' || action === 'LOCK' || action === 'UNLOCK') {
            setDrawerOpen(false);
          }
        }, 1500);
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Network request error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busNumber: newBusNumber,
          vehicleNumber: newVehicleNumber,
          driverName: newDriverName || 'Chauffeur',
          passengerCapacity: Number(newPassengerCapacity) || 23,
        }),
      });

      if (res.ok) {
        setNewBusModalOpen(false);
        await fetchFleetData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create bus');
      }
    } catch {
      alert('Error creating bus');
    }
  };

  // Derive status badge for selected seat
  const getSeatStatus = (seat: BusSeatData) => {
    if (!seat.isBookable || seat.status === 'UNAVAILABLE') {
      return { label: 'Organizer Locked', color: 'bg-rose-950/80 text-rose-300 border-rose-600/40' };
    }
    if (seat.seatBooking || seat.status === 'BOOKED') {
      return { label: 'Booked', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40' };
    }
    return { label: 'Available', color: 'bg-sky-950/80 text-sky-300 border-sky-600/40' };
  };

  // Separate seats by pairs for standard 25-seater layout (L1-L9, R1-R9, B1-B5)
  const leftSeats = currentBus?.seats?.filter((s) => s.side === 'LEFT' && s.seatType === 'PASSENGER') || [];
  const rightSeats = currentBus?.seats?.filter((s) => s.side === 'RIGHT' && s.seatType === 'PASSENGER') || [];
  const rearSeats = currentBus?.seats?.filter((s) => s.side === 'REAR' && s.seatType === 'PASSENGER') || [];
  const cabinSeats = currentBus?.seats?.filter((s) => s.seatType !== 'PASSENGER') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            COACH FLEET & SEAT ALLOCATION
          </span>
          <h1 className="text-3xl font-black text-white">Buses & Seat Management</h1>
          <p className="text-xs text-zinc-400">
            Interactive visual seat map with real-time seat reassignment, organizer locking, and manual passenger assignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewBusModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bus</span>
          </button>

          <button
            onClick={fetchFleetData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buses.map((bus) => {
          const booked = bus.seats?.filter((s) => s.seatBooking || s.status === 'BOOKED').length || 0;
          const available = bus.seats?.filter((s) => s.isBookable && s.status === 'AVAILABLE' && !s.seatBooking).length || 0;
          const locked = bus.seats?.filter((s) => !s.isBookable || s.status === 'UNAVAILABLE').length || 0;
          const isActive = bus.id === activeBusId;

          return (
            <div
              key={bus.id}
              onClick={() => setActiveBusId(bus.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isActive
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-xl shadow-emerald-950/40'
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-base">{bus.busNumber}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {bus.vehicleNumber}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-1">{bus.vehicleName}</p>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between text-xs">
                <span className="text-zinc-500">
                  Booked: <strong className="text-white">{booked}/{bus.passengerCapacity}</strong>
                </span>
                <span className="text-emerald-400 font-bold">{available} free</span>
                {locked > 0 && <span className="text-rose-400 font-semibold">{locked} locked</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Coach Visual Map & Management */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Active Coach Seating Grid</span>
            <h2 className="text-2xl font-black text-white">
              {currentBus?.busNumber}: {currentBus?.vehicleName} ({currentBus?.vehicleNumber})
            </h2>
            <p className="text-xs text-zinc-400">
              Chauffeur: {currentBus?.driverName || 'Rajesh Sharma'} ({currentBus?.driverPhone || '7017936338'}) • Conductor: {currentBus?.conductorName || 'Amit Verma'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-3 h-3 rounded bg-emerald-700"></span> Booked
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-3 h-3 rounded bg-zinc-800 border border-zinc-600"></span> Available
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-3 h-3 rounded bg-rose-900 border border-rose-600"></span> Locked
            </span>
          </div>
        </div>

        {/* 25-Seater Coach Layout Container */}
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6">
          {/* Driver & Conductor Cabin */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            {cabinSeats.map((cs) => (
              <div
                key={cs.id}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-500 uppercase flex items-center gap-2"
              >
                <span>{cs.seatType === 'DRIVER' ? '🚗 Driver' : '📋 Conductor'}</span>
              </div>
            ))}
          </div>

          {/* Passenger Cabin: Left & Right Rows (L1-L9, R1-R9) */}
          <div className="grid grid-cols-2 gap-8 sm:gap-14">
            {/* Left Rows (Pairs: L1/L2, L3/L4, L5/L6, L7/L8, L9) */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block text-center">
                Left Side (Window / Aisle)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {leftSeats.map((seat) => {
                  const isBooked = !!seat.seatBooking || seat.status === 'BOOKED';
                  const isLocked = !seat.isBookable || seat.status === 'UNAVAILABLE';
                  const occupant = seat.seatBooking?.traveller;

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => handleSeatClick(seat)}
                      className={`p-3 rounded-xl border text-center transition-all relative group cursor-pointer ${
                        isBooked
                          ? 'bg-emerald-950 border-emerald-600/70 text-emerald-200 hover:bg-emerald-900'
                          : isLocked
                          ? 'bg-rose-950/70 border-rose-700/60 text-rose-300 hover:bg-rose-900'
                          : 'bg-zinc-900 border-zinc-700/60 text-zinc-300 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-black">{seat.seatNumber}</span>
                        {isLocked ? (
                          <Lock className="w-3 h-3 text-rose-400" />
                        ) : isBooked ? (
                          <User className="w-3 h-3 text-emerald-400" />
                        ) : null}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate mt-1 text-left">
                        {isBooked ? occupant?.fullName || 'Booked' : isLocked ? 'Locked' : seat.position}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Rows (Pairs: R1/R2, R3/R4, R5/R6, R7/R8, R9) */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block text-center">
                Right Side (Aisle / Window)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {rightSeats.map((seat) => {
                  const isBooked = !!seat.seatBooking || seat.status === 'BOOKED';
                  const isLocked = !seat.isBookable || seat.status === 'UNAVAILABLE';
                  const occupant = seat.seatBooking?.traveller;

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => handleSeatClick(seat)}
                      className={`p-3 rounded-xl border text-center transition-all relative group cursor-pointer ${
                        isBooked
                          ? 'bg-emerald-950 border-emerald-600/70 text-emerald-200 hover:bg-emerald-900'
                          : isLocked
                          ? 'bg-rose-950/70 border-rose-700/60 text-rose-300 hover:bg-rose-900'
                          : 'bg-zinc-900 border-zinc-700/60 text-zinc-300 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-black">{seat.seatNumber}</span>
                        {isLocked ? (
                          <Lock className="w-3 h-3 text-rose-400" />
                        ) : isBooked ? (
                          <User className="w-3 h-3 text-emerald-400" />
                        ) : null}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate mt-1 text-left">
                        {isBooked ? occupant?.fullName || 'Booked' : isLocked ? 'Locked' : seat.position}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Rear Bench Row (B1 - B5) */}
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block text-center">
              Rear Row (B1 - B5)
            </span>
            <div className="grid grid-cols-5 gap-2">
              {rearSeats.map((seat) => {
                const isBooked = !!seat.seatBooking || seat.status === 'BOOKED';
                const isLocked = !seat.isBookable || seat.status === 'UNAVAILABLE';
                const occupant = seat.seatBooking?.traveller;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleSeatClick(seat)}
                    className={`p-3 rounded-xl border text-center transition-all relative cursor-pointer ${
                      isBooked
                        ? 'bg-emerald-950 border-emerald-600/70 text-emerald-200 hover:bg-emerald-900'
                        : isLocked
                        ? 'bg-rose-950/70 border-rose-700/60 text-rose-300 hover:bg-rose-900'
                        : 'bg-zinc-900 border-zinc-700/60 text-zinc-300 hover:border-zinc-500 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black">{seat.seatNumber}</span>
                      {isLocked ? (
                        <Lock className="w-2.5 h-2.5 text-rose-400" />
                      ) : isBooked ? (
                        <User className="w-2.5 h-2.5 text-emerald-400" />
                      ) : null}
                    </div>
                    <p className="text-[9px] text-zinc-400 truncate mt-1">
                      {isBooked ? occupant?.fullName?.split(' ')[0] || 'Booked' : isLocked ? 'Lock' : 'Rear'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SLIDE-OVER DRAWER FOR SEAT DETAILS & ADMIN ACTIONS       */}
      {/* ======================================================== */}
      {drawerOpen && selectedSeat && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 p-6 sm:p-8 space-y-6">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">
                    SEAT MANAGEMENT DRAWER
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    {currentBus?.busNumber} — Seat {selectedSeat.seatNumber}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {selectedSeat.position} • Row {selectedSeat.rowNumber} • {selectedSeat.side} Side
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              {(() => {
                const status = getSeatStatus(selectedSeat);
                return (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
                    <span className="text-zinc-400 font-bold">Status Badge:</span>
                    <span className={`px-3 py-1 rounded-full font-black text-xs border ${status.color}`}>
                      ● {status.label}
                    </span>
                  </div>
                );
              })()}

              {/* Action Feedback Banner */}
              {actionFeedback && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold animate-in fade-in ${
                    actionFeedback.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                  }`}
                >
                  {actionFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{actionFeedback.message}</span>
                </div>
              )}

              {/* Current Occupant Details Card */}
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Current Occupant
                </span>

                {selectedSeat.seatBooking ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-white font-black text-sm">
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>{selectedSeat.seatBooking.traveller?.fullName || 'Confirmed Student'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-300">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{selectedSeat.seatBooking.traveller?.phone || 'No phone'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-300">
                      <Hash className="w-3.5 h-3.5 text-zinc-500" />
                      <span>
                        Student ID: {selectedSeat.seatBooking.traveller?.collegeId || selectedSeat.seatBooking.traveller?.rollNumber || 'Not specified'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-zinc-400">
                      <span>Booking Reference:</span>
                      <span className="font-mono font-bold text-orange-400">
                        #{selectedSeat.seatBooking.booking.bookingId}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-xs font-bold text-zinc-500 italic">
                    Currently Empty (No student assigned)
                  </div>
                )}
              </div>

              {/* Admin Actions Section */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Available Actions
                </span>

                {/* IF OCCUPIED: Reassign Seat & Vacate Seat */}
                {selectedSeat.seatBooking ? (
                  <div className="space-y-4">
                    {/* Reassign Seat */}
                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                        <ArrowLeftRight className="w-4 h-4" />
                        <span>Reassign Seat</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Move student to any available seat across Bus 01–04.
                      </p>

                      <div className="space-y-2">
                        <select
                          value={targetSeatId}
                          onChange={(e) => setTargetSeatId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-bold"
                        >
                          <option value="">-- Select Destination Seat --</option>
                          {availableSeats
                            .filter((s) => s.id !== selectedSeat.id)
                            .map((seat) => (
                              <option key={seat.id} value={seat.id}>
                                {seat.label}
                              </option>
                            ))}
                        </select>

                        <button
                          type="button"
                          disabled={!targetSeatId || actionLoading}
                          onClick={() => handleSeatAction('REASSIGN')}
                          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs disabled:opacity-40 transition-all"
                        >
                          {actionLoading ? 'Processing Reassignment...' : 'Confirm Seat Transfer'}
                        </button>
                      </div>
                    </div>

                    {/* Vacate Seat */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        if (confirm(`Vacate seat ${selectedSeat.seatNumber}? This unlinks the student from this seat.`)) {
                          handleSeatAction('CLEAR');
                        }
                      }}
                      className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-600/50 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <UserMinus className="w-4 h-4 text-rose-400" />
                      <span>Vacate Seat (Unlink Student)</span>
                    </button>
                  </div>
                ) : (
                  /* IF EMPTY: Toggle Lock & Manual Assign */
                  <div className="space-y-4">
                    {/* Toggle Lock / Reserve for Organizer */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSeatAction(selectedSeat.isBookable ? 'LOCK' : 'UNLOCK')}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedSeat.isBookable
                          ? 'bg-rose-950/70 hover:bg-rose-900 border border-rose-600/50 text-rose-300'
                          : 'bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300'
                      }`}
                    >
                      {selectedSeat.isBookable ? (
                        <>
                          <Lock className="w-4 h-4 text-rose-400" />
                          <span>Lock / Reserve for Organizer</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 text-emerald-400" />
                          <span>Unlock Seat for Public Booking</span>
                        </>
                      )}
                    </button>

                    {/* Manual Assign to Confirmed Student */}
                    {selectedSeat.isBookable && (
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <UserCheck className="w-4 h-4" />
                          <span>Manual Assign</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Select an unassigned traveller from confirmed bookings to occupy this seat.
                        </p>

                        {unassignedTravellers.length > 0 ? (
                          <div className="space-y-2">
                            <select
                              value={selectedTravellerId}
                              onChange={(e) => setSelectedTravellerId(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-bold"
                            >
                              <option value="">-- Choose Confirmed Student --</option>
                              {unassignedTravellers.map((traveller) => (
                                <option key={traveller.id} value={traveller.id}>
                                  {traveller.fullName} ({traveller.phone}) • #{traveller.bookingId}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              disabled={!selectedTravellerId || actionLoading}
                              onClick={() => handleSeatAction('ASSIGN')}
                              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
                            >
                              {actionLoading ? 'Assigning...' : 'Assign Student to Seat'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic">
                            All confirmed travellers currently have seat assignments.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Bus Modal */}
      {newBusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-3xl border border-zinc-700 max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-xl font-black text-white">Add Luxury Tourist Bus</h2>
              <button onClick={() => setNewBusModalOpen(false)} className="p-2 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBus} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 mb-1 block font-bold">Bus Label</label>
                <input
                  type="text"
                  required
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  placeholder="e.g. Bus 05"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 mb-1 block font-bold">Registration / Vehicle Number</label>
                <input
                  type="text"
                  required
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value)}
                  placeholder="e.g. UP-85-GLA-005"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 mb-1 block font-bold">Driver Name</label>
                <input
                  type="text"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="Chauffeur Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 mb-1 block font-bold">Passenger Capacity</label>
                <input
                  type="number"
                  value={newPassengerCapacity}
                  onChange={(e) => setNewPassengerCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  * Auto-generates Driver (1), Conductor (1), and 23 bookable seats.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg mt-4 cursor-pointer"
              >
                Create Bus & Generate Seat Map
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
