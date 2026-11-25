'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Download,
  Filter,
  Bus,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  Save,
} from 'lucide-react';

export default function AdminTravellersPage() {
  const [travellers, setTravellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busFilter, setBusFilter] = useState('ALL');
  const [checkInFilter, setCheckInFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Modals & action states
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingTraveller, setEditingTraveller] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    rollNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    assignedBusNumber: '',
    assignedSeatNumber: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchTravellers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setTravellers(data.travellers || []);
      }
    } catch (err) {
      console.error('Error fetching travellers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTravellers();
  }, [fetchTravellers]);

  // Unique buses from travellers list
  const availableBuses = Array.from(
    new Set(travellers.map((t) => t.booking?.bus?.busNumber || t.assignedBusNumber || 'Bus 01'))
  ).sort();

  // Multi-criteria filtering
  const filtered = travellers.filter((t) => {
    const coach = t.booking?.bus?.busNumber || t.assignedBusNumber || 'Bus 01';
    if (busFilter !== 'ALL' && coach !== busFilter) return false;

    if (checkInFilter === 'CHECKED_IN' && t.checkInStatus !== 'CHECKED_IN') return false;
    if (checkInFilter === 'PENDING' && t.checkInStatus === 'CHECKED_IN') return false;

    const pStatus = t.booking?.paymentStatus || 'PENDING';
    if (paymentFilter !== 'ALL' && pStatus !== paymentFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = t.fullName?.toLowerCase().includes(q);
      const matchPhone = t.phone?.includes(q);
      const matchEmail = t.email?.toLowerCase().includes(q);
      const matchSeat = t.assignedSeatNumber?.toLowerCase().includes(q);
      const matchRoll = t.rollNumber?.toLowerCase().includes(q);
      const matchBooking = t.booking?.bookingId?.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchSeat || matchRoll || matchBooking;
    }

    return true;
  });

  const openEditModal = (traveller: any) => {
    setEditingTraveller(traveller);
    setEditForm({
      fullName: traveller.fullName || '',
      phone: traveller.phone || '',
      email: traveller.email || '',
      rollNumber: traveller.rollNumber || '',
      emergencyContactName: traveller.emergencyContactName || '',
      emergencyContactPhone: traveller.emergencyContactPhone || '',
      assignedBusNumber: traveller.booking?.bus?.busNumber || traveller.assignedBusNumber || 'Bus 01',
      assignedSeatNumber: traveller.assignedSeatNumber || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraveller) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/travellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT_DETAILS',
          travellerId: editingTraveller.id,
          data: editForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to update passenger');
      } else {
        showToast('success', data.message || 'Passenger details updated successfully');
        setTravellers((prev) =>
          prev.map((t) =>
            t.id === editingTraveller.id
              ? {
                  ...t,
                  fullName: editForm.fullName,
                  phone: editForm.phone,
                  email: editForm.email,
                  rollNumber: editForm.rollNumber,
                  emergencyContactName: editForm.emergencyContactName,
                  emergencyContactPhone: editForm.emergencyContactPhone,
                  assignedBusNumber: editForm.assignedBusNumber,
                  assignedSeatNumber: editForm.assignedSeatNumber,
                }
              : t
          )
        );
        setEditingTraveller(null);
      }
    } catch {
      showToast('error', 'Network error updating passenger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCheckIn = async (traveller: any) => {
    try {
      const res = await fetch('/api/admin/travellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_CHECKIN',
          travellerId: traveller.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to update check-in status');
      } else {
        showToast('success', data.message);
        setTravellers((prev) =>
          prev.map((t) =>
            t.id === traveller.id
              ? {
                  ...t,
                  checkInStatus: data.checkInStatus,
                  checkedInAt: data.checkInStatus === 'CHECKED_IN' ? new Date().toISOString() : null,
                }
              : t
          )
        );
      }
    } catch {
      showToast('error', 'Network error updating check-in');
    }
  };

  const handleCancelBooking = async (traveller: any) => {
    if (
      !confirm(
        `Are you sure you want to cancel the booking for ${traveller.fullName}? This will vacate their reserved seat and mark the booking as CANCELLED.`
      )
    ) {
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
        showToast('error', data.error || 'Failed to cancel passenger');
      } else {
        showToast('success', data.message || 'Passenger booking cancelled and seat vacated');
        setTravellers((prev) => prev.filter((t) => t.id !== traveller.id));
      }
    } catch {
      showToast('error', 'Network error cancelling booking');
    }
  };

  // Safe CSV export
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('No passenger records found matching the current filters to export.');
      return;
    }

    const headers = [
      'Student Name',
      'Roll Number',
      'Mobile Phone',
      'Email Address',
      'Coach',
      'Assigned Seat',
      'Booking Reference ID',
      'Payment Status',
      'Advance Deposit (INR)',
      'Remaining Balance (INR)',
      'Gate Check-In Status',
      'Emergency Contact Name',
      'Emergency Contact Phone',
    ];

    const rows = filtered.map((t) => [
      `"${(t.fullName || '').replace(/"/g, '""')}"`,
      `"${(t.rollNumber || '').replace(/"/g, '""')}"`,
      `"${(t.phone || '').replace(/"/g, '""')}"`,
      `"${(t.email || '').replace(/"/g, '""')}"`,
      `"${(t.booking?.bus?.busNumber || t.assignedBusNumber || 'Bus 01').replace(/"/g, '""')}"`,
      `"${(t.assignedSeatNumber || 'Unassigned').replace(/"/g, '""')}"`,
      `"${(t.booking?.bookingId || '').replace(/"/g, '""')}"`,
      `"${(t.booking?.paymentStatus || 'PENDING').replace(/"/g, '""')}"`,
      t.booking?.reservationAmount ?? 1000,
      t.booking?.remainingBalance ?? 5200,
      `"${t.checkInStatus === 'CHECKED_IN' ? 'CHECKED IN' : 'NOT BOARDED'}"`,
      `"${(t.emergencyContactName || '').replace(/"/g, '""')}"`,
      `"${(t.emergencyContactPhone || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Himalayan_Escape_Manifest_${busFilter === 'ALL' ? 'All_Coaches' : busFilter}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const checkedInCount = travellers.filter((t) => t.checkInStatus === 'CHECKED_IN').length;
  const remainingCount = Math.max(0, travellers.length - checkedInCount);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
            EXPEDITION PASSENGER DIRECTORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Passenger Manifest</h1>
          <p className="text-xs text-stone-400">
            Total {travellers.length} registered passengers • {checkedInCount} Checked In • {remainingCount} Awaiting Boarding
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs font-bold text-stone-200 hover:text-white hover:bg-stone-800 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchTravellers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs font-bold text-stone-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Multi-Criteria Filters */}
      <div className="rounded-2xl border border-white/10 bg-stone-900/80 p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search traveller name, phone, email, seat number, roll number or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-white/10 text-white text-xs placeholder-stone-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Coach Filter */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Filter Coach</label>
            <select
              value={busFilter}
              onChange={(e) => setBusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Coaches ({travellers.length})</option>
              {availableBuses.map((bus) => (
                <option key={bus} value={bus}>
                  {bus}
                </option>
              ))}
            </select>
          </div>

          {/* Check-In Status */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Gate Boarding</label>
            <select
              value={checkInFilter}
              onChange={(e) => setCheckInFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Boarding Statuses</option>
              <option value="CHECKED_IN">Checked In ({checkedInCount})</option>
              <option value="PENDING">Not Boarded ({remainingCount})</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">Fully Paid</option>
              <option value="PENDING">Balance Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="rounded-2xl border border-white/10 bg-stone-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 border-b border-white/10 text-stone-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Traveller Name & Roll</th>
                <th className="p-4">Mobile & Email</th>
                <th className="p-4">Coach & Seat</th>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Gate Status</th>
                <th className="p-4">Emergency Contact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-500">
                    {loading ? 'Loading manifest...' : 'No travellers found matching filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const coachName = t.booking?.bus?.busNumber || t.assignedBusNumber || 'Bus 01';
                  const isCheckedIn = t.checkInStatus === 'CHECKED_IN';
                  const pStatus = t.booking?.paymentStatus || 'PENDING';

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{t.fullName}</div>
                        <div className="text-[11px] text-stone-400">
                          {t.gender}
                          {t.rollNumber ? ` • ${t.rollNumber}` : ''}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-stone-200 font-mono">{t.phone}</div>
                        <div className="text-[11px] text-stone-400 truncate max-w-[160px]">{t.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white block">{coachName}</span>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono font-bold text-[10px]">
                          Seat {t.assignedSeatNumber || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        #{t.booking?.bookingId}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            pStatus === 'PAID'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {pStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isCheckedIn
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {isCheckedIn ? 'Checked In' : 'Not Boarded'}
                        </span>
                        {t.checkedInAt && (
                          <span className="block text-[10px] text-stone-500 mt-0.5">
                            {new Date(t.checkedInAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-stone-300">
                        <div>{t.emergencyContactName || 'Guardian'}</div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          {t.emergencyContactPhone || 'Not provided'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Gate Check-in toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleCheckIn(t)}
                            title={isCheckedIn ? 'Revert Gate Check-in' : 'Mark Gate Checked-in'}
                            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                              isCheckedIn
                                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                                : 'bg-stone-800 border-white/10 text-stone-400 hover:text-white hover:bg-stone-700'
                            }`}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => openEditModal(t)}
                            title="Edit Passenger Details"
                            className="p-1.5 rounded-lg bg-stone-800 border border-white/10 text-amber-300 hover:bg-amber-950/60 hover:border-amber-500/40 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {/* Cancel Booking */}
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(t)}
                            title="Cancel Passenger & Release Seat"
                            className="p-1.5 rounded-lg bg-stone-800 border border-white/10 text-rose-400 hover:bg-rose-950/60 hover:border-rose-500/40 transition cursor-pointer"
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

      {/* Edit Passenger Modal */}
      {editingTraveller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-stone-900 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  EDIT PASSENGER RECORD
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {editingTraveller.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTraveller(null)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800 hover:bg-stone-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">Roll / College ID</label>
                  <input
                    type="text"
                    value={editForm.rollNumber}
                    onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">Assigned Coach</label>
                  <input
                    type="text"
                    value={editForm.assignedBusNumber}
                    onChange={(e) => setEditForm({ ...editForm, assignedBusNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">Assigned Seat</label>
                  <input
                    type="text"
                    value={editForm.assignedSeatNumber}
                    onChange={(e) => setEditForm({ ...editForm, assignedSeatNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactName}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactPhone}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingTraveller(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Passenger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
