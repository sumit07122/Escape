'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Search, Download, RefreshCw, CheckCircle2, Clock, Phone,
  Mail, Edit3, ArrowLeftRight, Trash2, X, AlertCircle, Loader2,
  DollarSign, Check, Ban
} from 'lucide-react';

interface TravellerManifestItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  rollNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  assignedBusNumber: string;
  assignedSeatNumber: string;
  busId?: string | null;
  seatId?: string | null;
  checkInStatus: string; // 'PENDING' | 'CHECKED_IN' | 'CANCELLED'
  checkedInAt?: string | null;
  bookingId: string;
  bookingDbId: string;
  bookingStatus: string;
  paymentStatus: string;
  totalAmount: number;
  reservationAmount: number;
  remainingBalance: number;
  ticketToken?: string | null;
}

export default function PassengerManifestTab() {
  const [travellers, setTravellers] = useState<TravellerManifestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busFilter, setBusFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Passenger Modal State
  const [editingTraveller, setEditingTraveller] = useState<TravellerManifestItem | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRollNumber, setEditRollNumber] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTravellers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/travellers');
      if (res.ok) {
        const data = await res.json();
        setTravellers(data.travellers || []);
      }
    } catch (err) {
      console.error('Error fetching manifest:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravellers();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Check-In status
  const handleToggleCheckin = async (travellerId: string) => {
    try {
      const res = await fetch('/api/admin/travellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_CHECKIN',
          travellerId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to toggle check-in');
      } else {
        showToast('success', data.message);
        setTravellers((prev) =>
          prev.map((t) => (t.id === travellerId ? { ...t, checkInStatus: data.checkInStatus } : t))
        );
      }
    } catch {
      showToast('error', 'Network error updating check-in');
    }
  };

  // Collect balance and check in
  const handleCollectBalance = async (traveller: TravellerManifestItem) => {
    if (!confirm(`Confirm collecting ₹${traveller.remainingBalance.toLocaleString('en-IN')} cash/UPI at gate for ${traveller.fullName}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/travellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'COLLECT_BALANCE_AND_CHECKIN',
          travellerId: traveller.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to record balance collection');
      } else {
        showToast('success', data.message);
        setTravellers((prev) =>
          prev.map((t) =>
            t.id === traveller.id
              ? { ...t, checkInStatus: 'CHECKED_IN', remainingBalance: 0, paymentStatus: 'PAID' }
              : t
          )
        );
      }
    } catch {
      showToast('error', 'Network error collecting balance');
    }
  };

  // Cancel booking
  const handleCancelBooking = async (traveller: TravellerManifestItem) => {
    if (!confirm(`Are you sure you want to cancel the booking for ${traveller.fullName}? This will release their seat.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/travellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CANCEL_BOOKING',
          travellerId: traveller.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to cancel booking');
      } else {
        showToast('success', data.message);
        fetchTravellers();
      }
    } catch {
      showToast('error', 'Network error cancelling booking');
    }
  };

  // Open Edit Modal
  const openEditModal = (t: TravellerManifestItem) => {
    setEditingTraveller(t);
    setEditFullName(t.fullName || '');
    setEditPhone(t.phone || '');
    setEditEmail(t.email || '');
    setEditRollNumber(t.rollNumber || '');
    setEditEmergencyPhone(t.emergencyContactPhone || '');
  };

  // Save Passenger Details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraveller) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/travellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_DETAILS',
          travellerId: editingTraveller.id,
          data: {
            fullName: editFullName,
            phone: editPhone,
            email: editEmail,
            rollNumber: editRollNumber,
            emergencyContactPhone: editEmergencyPhone,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to update details');
      } else {
        showToast('success', data.message);
        setEditingTraveller(null);
        fetchTravellers();
      }
    } catch {
      showToast('error', 'Network error saving details');
    } finally {
      setActionLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (travellers.length === 0) {
      alert('No passenger data to export.');
      return;
    }

    const headers = [
      'Student Name',
      'Roll Number',
      'Mobile Number',
      'Email',
      'Coach',
      'Seat',
      'Booking Reference',
      'Gate Check-In Status',
      'Advance Paid (INR)',
      'Balance Due (INR)',
      'Total Amount (INR)',
      'Emergency Contact',
    ];

    const rows = filteredTravellers.map((t) => [
      `"${(t.fullName || '').replace(/"/g, '""')}"`,
      `"${(t.rollNumber || '').replace(/"/g, '""')}"`,
      `"${(t.phone || '').replace(/"/g, '""')}"`,
      `"${(t.email || '').replace(/"/g, '""')}"`,
      `"${(t.assignedBusNumber || '').replace(/"/g, '""')}"`,
      `"${(t.assignedSeatNumber || '').replace(/"/g, '""')}"`,
      `"${(t.bookingId || '').replace(/"/g, '""')}"`,
      `"${t.checkInStatus === 'CHECKED_IN' ? 'CHECKED IN' : 'NOT CHECKED IN'}"`,
      t.reservationAmount || 1000,
      t.remainingBalance || 0,
      t.totalAmount || 6200,
      `"${(t.emergencyContactPhone || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Himalayan_Escape_Manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filteredTravellers = travellers.filter((t) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.fullName?.toLowerCase().includes(q) ||
      t.rollNumber?.toLowerCase().includes(q) ||
      t.phone?.includes(q) ||
      t.bookingId?.toLowerCase().includes(q) ||
      t.assignedSeatNumber?.toLowerCase().includes(q);

    const matchesBus =
      busFilter === 'ALL' ||
      t.assignedBusNumber?.toLowerCase().includes(busFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CHECKED_IN' && t.checkInStatus === 'CHECKED_IN') ||
      (statusFilter === 'NOT_CHECKED_IN' && t.checkInStatus !== 'CHECKED_IN') ||
      (statusFilter === 'CANCELLED' && t.bookingStatus === 'CANCELLED');

    return matchesSearch && matchesBus && matchesStatus;
  });

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

      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif">
            Passenger Manifest & Gate Boarding Desk
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {travellers.length} registered students across all coach cabins. Live check-in verification, balance collection, and printout exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTravellers}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 hover:border-amber-400/40 text-xs font-bold text-stone-200 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-lg transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-950" />
            <span>Export Manifest (CSV)</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="backdrop-blur-md bg-stone-900/75 p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 shadow-md">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student name, roll no, mobile, booking ID, seat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-xs text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Bus Filter */}
        <div className="sm:col-span-3">
          <select
            value={busFilter}
            onChange={(e) => setBusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-xs text-white focus:border-amber-400 focus:outline-none"
          >
            <option value="ALL">All Buses (01 to 04)</option>
            <option value="Bus 01">Bus 01</option>
            <option value="Bus 02">Bus 02</option>
            <option value="Bus 03">Bus 03</option>
            <option value="Bus 04">Bus 04</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-xs text-white focus:border-amber-400 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CHECKED_IN">Gate Checked-In Only</option>
            <option value="NOT_CHECKED_IN">Not Checked-In Yet</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="backdrop-blur-md bg-stone-900/75 rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 border-b border-white/10 text-stone-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Passenger & Roll No</th>
                <th className="p-4">Mobile & WhatsApp</th>
                <th className="p-4">Coach & Seat</th>
                <th className="p-4">Payment & Balance</th>
                <th className="p-4">Gate Boarding</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTravellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-500">
                    No passengers match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTravellers.map((t) => {
                  const isCheckedIn = t.checkInStatus === 'CHECKED_IN';
                  const cleanPhone = t.phone?.replace(/[^0-9]/g, '') || '';
                  const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Passenger Name & Roll */}
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">
                          {t.fullName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono mt-0.5">
                          <span>{t.rollNumber || 'No Roll No'}</span>
                          <span className="text-amber-400 font-bold">• {t.bookingId}</span>
                        </div>
                      </td>

                      {/* Phone & WhatsApp Links */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${t.phone}`}
                            className="font-mono font-bold text-stone-200 hover:text-white"
                          >
                            {t.phone}
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 hover:bg-emerald-900"
                              title="Chat on WhatsApp"
                            >
                              WA
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate max-w-[160px]">
                          {t.email}
                        </div>
                      </td>

                      {/* Coach & Seat */}
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">
                          {t.assignedBusNumber}
                        </div>
                        <div className="inline-block mt-0.5 px-2 py-0.5 rounded-lg bg-stone-800 text-amber-300 font-mono text-[11px] font-bold border border-white/10">
                          Seat {t.assignedSeatNumber}
                        </div>
                      </td>

                      {/* Payment Status & Balance Due */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            ₹{(t.reservationAmount || 1000).toLocaleString('en-IN')} Paid
                          </span>
                        </div>
                        {t.remainingBalance > 0 ? (
                          <div className="mt-1">
                            <span className="text-[11px] text-amber-400 font-bold font-mono">
                              ₹{t.remainingBalance.toLocaleString('en-IN')} Due
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-500 block mt-1">
                            Paid in Full
                          </span>
                        )}
                      </td>

                      {/* Gate Check-in Status Toggle & Quick Collect */}
                      <td className="p-4 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleCheckin(t.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isCheckedIn
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                              : 'bg-stone-800 text-stone-400 hover:text-white border border-white/10 hover:bg-stone-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'
                            }`}
                          />
                          <span>{isCheckedIn ? 'CHECKED IN' : 'NOT CHECKED IN'}</span>
                        </button>

                        {/* Quick Collect Button if Balance is Outstanding and not yet checked in */}
                        {t.remainingBalance > 0 && !isCheckedIn && (
                          <button
                            type="button"
                            onClick={() => handleCollectBalance(t)}
                            className="block text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                          >
                            Collect ₹{t.remainingBalance} & Board
                          </button>
                        )}
                      </td>

                      {/* Actions: Edit, Reassign, Cancel */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(t)}
                            className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
                            title="Edit Student Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancelBooking(t)}
                            className="p-2 rounded-lg bg-stone-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950 transition-colors cursor-pointer"
                            title="Cancel Booking & Vacate Seat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT STUDENT INFO MODAL */}
      {editingTraveller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-stone-900 border border-white/20 p-6 sm:p-8 space-y-5 text-left relative shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setEditingTraveller(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                PASSENGER PROFILE EDITOR
              </span>
              <h3 className="text-xl font-black text-white font-serif mt-1">
                Edit {editingTraveller.fullName}
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Booking: {editingTraveller.bookingId} • Seat: {editingTraveller.assignedSeatNumber}
              </p>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300">Roll / College ID</label>
                  <input
                    type="text"
                    value={editRollNumber}
                    onChange={(e) => setEditRollNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">Emergency Contact Mobile</label>
                <input
                  type="tel"
                  value={editEmergencyPhone}
                  onChange={(e) => setEditEmergencyPhone(e.target.value)}
                  placeholder="Parent / Guardian mobile"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTraveller(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
