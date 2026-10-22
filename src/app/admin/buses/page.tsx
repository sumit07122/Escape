'use client';

import React, { useState, useEffect } from 'react';
import {
  Bus as BusIcon, Plus, Edit, UserCheck, ShieldAlert,
  ArrowRight, X, RefreshCw, AlertCircle, CheckCircle2, History
} from 'lucide-react';
import BusSeatMap from '@/components/BusSeatMap';

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [activeBusId, setActiveBusId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [newBusModalOpen, setNewBusModalOpen] = useState(false);
  const [targetSeatNumber, setTargetSeatNumber] = useState('');
  const [targetBusId, setTargetBusId] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // New Bus form state
  const [newBusNumber, setNewBusNumber] = useState('Bus 05');
  const [newVehicleNumber, setNewVehicleNumber] = useState('UP-85-GLA-005');
  const [newDriverName, setNewDriverName] = useState('');
  const [newPassengerCapacity, setNewPassengerCapacity] = useState('23');

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/buses');
      if (res.ok) {
        const data = await res.json();
        setBuses(data.buses || []);
        if (!activeBusId && data.buses?.length > 0) {
          setActiveBusId(data.buses[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching admin buses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleAdminSeatClick = (seat: any, busId: string) => {
    setSelectedSeat(seat);
    setTargetBusId(busId);
    setTargetSeatNumber('');
    setOverrideReason('');
    setOverrideModalOpen(true);
  };

  const handleSeatOverride = async (action: string) => {
    if (!selectedSeat || !activeBusId) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/seats/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          busId: activeBusId,
          seatNumber: selectedSeat.seatNumber,
          targetBusId: targetBusId || activeBusId,
          targetSeatNumber: targetSeatNumber || undefined,
          reason: overrideReason || `Admin manual ${action.toLowerCase()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Seat override failed');
      } else {
        alert(data.message || 'Seat updated successfully');
        setOverrideModalOpen(false);
        await fetchBuses();
      }
    } catch {
      alert('Network request failed');
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
        await fetchBuses();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create bus');
      }
    } catch {
      alert('Error creating bus');
    }
  };

  const currentBus = buses.find((b) => b.id === activeBusId);

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
            Interactive visual seat map with real-time seat overrides, transfers, and reservations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewBusModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bus</span>
          </button>

          <button
            onClick={fetchBuses}
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
          const booked = bus.seats?.filter((s: any) => s.status === 'BOOKED' && s.isBookable).length || 0;
          const available = bus.seats?.filter((s: any) => s.status === 'AVAILABLE' && s.isBookable).length || 0;
          const isActive = bus.id === activeBusId;

          return (
            <div
              key={bus.id}
              onClick={() => setActiveBusId(bus.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isActive
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-xl shadow-emerald-950'
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
                <span className="text-zinc-500">Booked: <strong className="text-white">{booked}/{bus.passengerCapacity}</strong></span>
                <span className="text-emerald-400 font-bold">{available} free</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Admin Seat Map */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase">Active Coach</span>
            <h2 className="text-xl font-black text-white">
              {currentBus?.busNumber}: {currentBus?.vehicleName} ({currentBus?.vehicleNumber})
            </h2>
            <p className="text-xs text-zinc-400">
              Chauffeur: {currentBus?.driverName || 'Rajesh Sharma'} ({currentBus?.driverPhone || '7017936338'}) • Conductor: {currentBus?.conductorName || 'Amit Verma'}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600/30">
            Click any seat for Admin Overrides
          </span>
        </div>

        {activeBusId && (
          <BusSeatMap
            requiredSeatsCount={1}
            selectedSeats={[]}
            selectedBusId={activeBusId}
            onSeatSelect={() => {}}
            bookingSessionId="admin-console"
            isAdmin={true}
            onAdminSeatClick={handleAdminSeatClick}
          />
        )}
      </div>

      {/* Seat Override / Action Modal */}
      {overrideModalOpen && selectedSeat && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-3xl border border-zinc-700 max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase">Seat Override Control</span>
                <h2 className="text-2xl font-black text-white">Seat {selectedSeat.seatNumber}</h2>
              </div>
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Seat Status Info */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Current Status:</span>
                <span className="font-bold text-white uppercase">{selectedSeat.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Position & Row:</span>
                <span className="font-semibold text-zinc-300">{selectedSeat.position} • Row {selectedSeat.rowNumber} ({selectedSeat.side})</span>
              </div>
              {selectedSeat.bookedDetails && (
                <>
                  <div className="flex justify-between pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500">Booked By:</span>
                    <span className="font-bold text-emerald-400">{selectedSeat.bookedDetails.travellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Booking ID:</span>
                    <span className="font-mono text-zinc-300 font-bold">#{selectedSeat.bookedDetails.bookingId}</span>
                  </div>
                </>
              )}
            </div>

            {/* Change Seat / Move Bus inputs */}
            {selectedSeat.status === 'BOOKED' && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Move Traveller to Another Seat
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-zinc-400 mb-1 block">Target Coach</label>
                    <select
                      value={targetBusId}
                      onChange={(e) => setTargetBusId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    >
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>{b.busNumber}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-400 mb-1 block">Target Seat Number</label>
                    <input
                      type="text"
                      placeholder="e.g. R4, L2"
                      value={targetSeatNumber}
                      onChange={(e) => setTargetSeatNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white uppercase font-bold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!targetSeatNumber || actionLoading}
                  onClick={() => handleSeatOverride('CHANGE_SEAT')}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                >
                  Confirm Seat Transfer
                </button>
              </div>
            )}

            {/* Admin Override Action Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-xs text-zinc-400 font-semibold block">Administrative Actions:</span>
              <div className="grid grid-cols-2 gap-2">
                {selectedSeat.status !== 'BOOKED' && (
                  <button
                    onClick={() => handleSeatOverride('RESERVE')}
                    disabled={actionLoading}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Reserve for Offline/VIP
                  </button>
                )}

                {selectedSeat.status !== 'AVAILABLE' && (
                  <button
                    onClick={() => handleSeatOverride('RELEASE')}
                    disabled={actionLoading}
                    className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    Release to Available
                  </button>
                )}

                {selectedSeat.status !== 'UNAVAILABLE' ? (
                  <button
                    onClick={() => handleSeatOverride('MARK_UNAVAILABLE')}
                    disabled={actionLoading}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold text-xs border border-zinc-700"
                  >
                    Mark Maintenance
                  </button>
                ) : (
                  <button
                    onClick={() => handleSeatOverride('MARK_AVAILABLE')}
                    disabled={actionLoading}
                    className="py-2.5 px-3 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                  >
                    Mark Available
                  </button>
                )}
              </div>
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
              <button onClick={() => setNewBusModalOpen(false)} className="p-2 text-zinc-400">
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
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg mt-4"
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
