'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  Bus as BusIcon,
  Phone,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Edit2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
} from 'lucide-react';

interface BusData {
  id: string;
  busNumber: string;
  vehicleName: string;
  vehicleNumber: string;
  passengerCapacity: number;
  physicalCapacity?: number;
  status: string;
  driverName?: string | null;
  driverPhone?: string | null;
  conductorName?: string | null;
  conductorPhone?: string | null;
}

export default function AdminTransportPage() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Coach Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusData | null>(null);
  const [editForm, setEditForm] = useState({
    busNumber: '',
    vehicleName: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    conductorName: '',
    conductorPhone: '',
    status: 'ACTIVE',
  });

  // Add Coach Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    busNumber: '',
    vehicleName: 'Volvo 9600 Luxury Tourist Coach',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    conductorName: '',
    conductorPhone: '',
    passengerCapacity: 23,
    rowCount: 5,
    rearSeatCount: 3,
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchTransport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/buses');
      if (res.ok) {
        const data = await res.json();
        setBuses(data.buses || []);
      } else {
        setFeedback({ type: 'error', message: 'Failed to fetch transport fleet from server.' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Network error connecting to transport service.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransport();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Open Edit Modal
  const handleOpenEditModal = (bus: BusData) => {
    setEditingBus(bus);
    setEditForm({
      busNumber: bus.busNumber,
      vehicleName: bus.vehicleName,
      vehicleNumber: bus.vehicleNumber,
      driverName: bus.driverName || '',
      driverPhone: bus.driverPhone || '',
      conductorName: bus.conductorName || '',
      conductorPhone: bus.conductorPhone || '',
      status: bus.status || 'ACTIVE',
    });
    setEditModalOpen(true);
  };

  // Save Coach & Chauffeur Changes
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBus) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/buses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busId: editingBus.id,
          ...editForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', `Coach ${editForm.busNumber} updated successfully.`);
        setEditModalOpen(false);
        await fetchTransport();
      } else {
        showFeedback('error', data.error || 'Failed to update coach.');
      }
    } catch {
      showFeedback('error', 'Network error updating coach.');
    } finally {
      setSubmitting(false);
    }
  };

  // Save New Coach
  const handleSaveNewCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', `New Coach ${addForm.busNumber} provisioned with 23 seats.`);
        setAddModalOpen(false);
        setAddForm({
          busNumber: '',
          vehicleName: 'Volvo 9600 Luxury Tourist Coach',
          vehicleNumber: '',
          driverName: '',
          driverPhone: '',
          conductorName: '',
          conductorPhone: '',
          passengerCapacity: 23,
          rowCount: 5,
          rearSeatCount: 3,
        });
        await fetchTransport();
      } else {
        showFeedback('error', data.error || 'Failed to create coach.');
      }
    } catch {
      showFeedback('error', 'Network error creating coach.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-widest">
              LOGISTICS & FLEET OPERATIONS
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Certified Tourist Fleet
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Transport Fleet Manifest
          </h1>
          <p className="text-xs text-stone-300 mt-0.5">
            Air-conditioned coaches, mountain chauffeurs, conductor contacts, and road clearances for Mathura departure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/buses"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-white/10 text-xs font-bold transition shadow-sm"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Seat Matrix Desk</span>
          </Link>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Coach</span>
          </button>
          <button
            onClick={fetchTransport}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs font-bold text-stone-300 hover:text-white transition disabled:opacity-50"
            title="Refresh transport fleet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-stone-400 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buses.length === 0 && !loading && (
          <div className="md:col-span-2 p-8 text-center rounded-2xl border border-white/10 bg-stone-900/40 text-stone-400 text-xs space-y-3">
            <Truck className="w-8 h-8 text-stone-500 mx-auto" />
            <p>No coaches registered yet. Click &quot;Add Coach&quot; to configure your expedition fleet.</p>
          </div>
        )}

        {buses.map((bus) => (
          <div
            key={bus.id}
            className="rounded-3xl p-6 sm:p-7 border border-white/10 bg-stone-900/70 shadow-xl space-y-5 flex flex-col justify-between hover:border-white/20 transition-all"
          >
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">
                      TOURIST COACH
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                        bus.status === 'ACTIVE'
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                          : bus.status === 'MAINTENANCE'
                          ? 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                          : 'bg-stone-900 text-stone-400 border-white/10'
                      }`}
                    >
                      {bus.status || 'ACTIVE'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight mt-1">{bus.busNumber}</h2>
                  <p className="text-xs text-stone-300">{bus.vehicleName}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-stone-950 border border-white/15 text-sky-400 shadow-inner">
                    {bus.vehicleNumber}
                  </span>
                  <button
                    onClick={() => handleOpenEditModal(bus)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 border border-white/10 text-xs font-bold transition shadow-sm cursor-pointer"
                    title="Edit coach, chauffeur and conductor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Crew Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-stone-950/90 border border-white/5 space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase font-bold block">Assigned Chauffeur</span>
                  <span className="font-bold text-white text-sm block">
                    {bus.driverName || 'Rajesh Sharma'}
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] block">
                    {bus.driverPhone ? (
                      <a href={`tel:${bus.driverPhone}`} className="hover:underline">
                        {bus.driverPhone}
                      </a>
                    ) : (
                      '7017936338'
                    )}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-950/90 border border-white/5 space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase font-bold block">Conductor / Assist</span>
                  <span className="font-bold text-white text-sm block">
                    {bus.conductorName || 'Amit Verma'}
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] block">
                    {bus.conductorPhone ? (
                      <a href={`tel:${bus.conductorPhone}`} className="hover:underline">
                        {bus.conductorPhone}
                      </a>
                    ) : (
                      '9368287947'
                    )}
                  </span>
                </div>
              </div>

              {/* Specs & Route info */}
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-white/5 space-y-2 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-400">Route:</span>
                  <span className="font-semibold text-white">Mathura (NH-2) → Manali → Kasol → Return</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Passenger Capacity:</span>
                  <span className="font-bold text-emerald-300 font-mono">{bus.passengerCapacity || 23} Seats (2x2 Layout)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Physical Cabin:</span>
                  <span className="font-bold text-stone-200 font-mono">{bus.physicalCapacity || (bus.passengerCapacity + 2)} Total (23 Pax + 1 Driver + 1 Staff)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Road Status:</span>
                  <span className="font-bold text-emerald-400">Certified All-India Tourist Permit & Insured</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                Reporting: <strong className="text-white">Near Main Gate (NH-2)</strong>
              </span>
              <Link
                href="/admin/buses"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
              >
                <span>View Seat Allocation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 1. EDIT COACH & CHAUFFEUR MODAL                           */}
      {/* ========================================================= */}
      {editModalOpen && editingBus && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1715] rounded-3xl border border-white/15 max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                  EDIT EXPEDITION COACH
                </span>
                <h3 className="text-lg font-bold text-white">
                  Update {editingBus.busNumber} & Crew
                </h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Coach Identifier</label>
                  <input
                    type="text"
                    required
                    value={editForm.busNumber}
                    onChange={(e) => setEditForm({ ...editForm, busNumber: e.target.value })}
                    placeholder="e.g. BUS-01 or Coach A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Registration Plate</label>
                  <input
                    type="text"
                    required
                    value={editForm.vehicleNumber}
                    onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value })}
                    placeholder="e.g. UP-85-BA-4421"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 mb-1 block font-bold">Vehicle Model & Description</label>
                <input
                  type="text"
                  required
                  value={editForm.vehicleName}
                  onChange={(e) => setEditForm({ ...editForm, vehicleName: e.target.value })}
                  placeholder="e.g. Volvo 9600 Multi-Axle Luxury Coach"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Assigned Chauffeur</label>
                  <input
                    type="text"
                    value={editForm.driverName}
                    onChange={(e) => setEditForm({ ...editForm, driverName: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Chauffeur Phone</label>
                  <input
                    type="tel"
                    value={editForm.driverPhone}
                    onChange={(e) => setEditForm({ ...editForm, driverPhone: e.target.value })}
                    placeholder="e.g. 7017936338"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Conductor / Assistant</label>
                  <input
                    type="text"
                    value={editForm.conductorName}
                    onChange={(e) => setEditForm({ ...editForm, conductorName: e.target.value })}
                    placeholder="e.g. Amit Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Conductor Phone</label>
                  <input
                    type="tel"
                    value={editForm.conductorPhone}
                    onChange={(e) => setEditForm({ ...editForm, conductorPhone: e.target.value })}
                    placeholder="e.g. 9368287947"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 mb-1 block font-bold">Operational Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-bold focus:outline-none focus:border-sky-500"
                >
                  <option value="ACTIVE">ACTIVE (Operational & Bookable)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Temporarily Unavailable)</option>
                  <option value="DISABLED">DISABLED (Standby / Off-Fleet)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-stone-300 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ADD COACH MODAL                                        */}
      {/* ========================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1715] rounded-3xl border border-white/15 max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  EXPEDITION FLEET EXPANSION
                </span>
                <h3 className="text-lg font-bold text-white">Add New Coach</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCoach} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Coach Code</label>
                  <input
                    type="text"
                    required
                    value={addForm.busNumber}
                    onChange={(e) => setAddForm({ ...addForm, busNumber: e.target.value })}
                    placeholder="e.g. BUS-03"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={addForm.vehicleNumber}
                    onChange={(e) => setAddForm({ ...addForm, vehicleNumber: e.target.value })}
                    placeholder="e.g. UP-85-BA-9901"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 mb-1 block font-bold">Vehicle Model</label>
                <input
                  type="text"
                  required
                  value={addForm.vehicleName}
                  onChange={(e) => setAddForm({ ...addForm, vehicleName: e.target.value })}
                  placeholder="e.g. Volvo 9600 Luxury Tourist Coach"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Chauffeur / Driver</label>
                  <input
                    type="text"
                    value={addForm.driverName}
                    onChange={(e) => setAddForm({ ...addForm, driverName: e.target.value })}
                    placeholder="e.g. Suresh Tomar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Chauffeur Mobile</label>
                  <input
                    type="tel"
                    value={addForm.driverPhone}
                    onChange={(e) => setAddForm({ ...addForm, driverPhone: e.target.value })}
                    placeholder="e.g. 8126854850"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Conductor / Assistant</label>
                  <input
                    type="text"
                    value={addForm.conductorName}
                    onChange={(e) => setAddForm({ ...addForm, conductorName: e.target.value })}
                    placeholder="e.g. Manoj Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-stone-300 mb-1 block font-bold">Conductor Mobile</label>
                  <input
                    type="tel"
                    value={addForm.conductorPhone}
                    onChange={(e) => setAddForm({ ...addForm, conductorPhone: e.target.value })}
                    placeholder="e.g. 6398412828"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono placeholder-stone-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-white/5 text-[11px] text-stone-400">
                <span>Layout standard: <strong>5 rows (2x2) + 3 rear seats = 23 Passenger Seats</strong> (+ Driver & Staff)</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-stone-300 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Provisioning...' : 'Provision Coach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
