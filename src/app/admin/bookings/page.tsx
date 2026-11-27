'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  DollarSign,
  UserCheck,
  X,
  Ticket,
  Bus,
  Calendar,
  Phone,
  Mail,
  ShieldAlert,
  ArrowUpDown,
  CreditCard,
  QrCode,
  ExternalLink,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [busFilter, setBusFilter] = useState('ALL');
  const [checkInFilter, setCheckInFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/admin/bookings';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (paymentStatusFilter !== 'ALL') params.append('paymentStatus', paymentStatusFilter);
      if (busFilter !== 'ALL') params.append('busId', busFilter);
      if (checkInFilter !== 'ALL') params.append('checkInStatus', checkInFilter);
      params.append('sort', sortOrder);

      url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        if (data.buses) setBuses(data.buses);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, paymentStatusFilter, busFilter, checkInFilter, sortOrder]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateBooking = async (bookingId: string, updates: any) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, ...updates }),
      });

      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Booking updated successfully');
        await fetchBookings();
        if (data.booking) {
          setSelectedBooking(data.booking);
        }
      } else {
        showFeedback('error', data.error || 'Failed to update booking');
      }
    } catch (err) {
      console.error('Failed to update booking:', err);
      showFeedback('error', 'Network error updating booking');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
            REGISTRATION REGISTRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Bookings Management</h1>
          <p className="text-xs text-stone-400">
            Search, filter, inspect, and update student reservations, payments, and seat allocations.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs font-bold text-stone-300 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {feedbackMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Multi-Criteria Filters & Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-stone-900/80 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Booking ID, traveller name, mobile or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-white/10 text-white text-xs placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchBookings}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shrink-0"
          >
            Apply Filters
          </button>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {/* Booking Status */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Booking Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Fully Paid</option>
              <option value="PENDING">Pending Deposit / Balance</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Bus Filter */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Coach Filter</label>
            <select
              value={busFilter}
              onChange={(e) => setBusFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Coaches</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.busNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Gate Check-in Status */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Gate Check-In</label>
            <select
              value={checkInFilter}
              onChange={(e) => setCheckInFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
            >
              <option value="ALL">All Travellers</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="PENDING">Awaiting Boarding</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Sort By Date</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-2.5 py-2 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-white/10 bg-stone-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 border-b border-white/10 text-stone-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Lead Traveller</th>
                <th className="p-4">Package & Group</th>
                <th className="p-4">Coach & Seats</th>
                <th className="p-4">Paid / Balance</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Booking</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-500">
                    {loading ? 'Loading bookings...' : 'No bookings found matching selected filters.'}
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{b.bookingId}</span>
                      </div>
                      <span className="block text-[10px] text-stone-500 font-normal mt-0.5">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-200">{b.primaryTravellerName}</div>
                      <div className="text-[11px] text-stone-400">{b.primaryPhone}</div>
                      <div className="text-[10px] text-stone-500 truncate max-w-[150px]">{b.primaryEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-stone-300">{b.package?.name || 'Standard'}</span>
                      <span className="block text-[11px] text-stone-400">{b.travellersCount || b.travellers?.length || 1} pax</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white">{b.bus?.busNumber || 'Bus 01'}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {b.travellers
                          ?.map((t: any) => t.assignedSeatNumber)
                          .filter(Boolean)
                          .map((s: string) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-sans font-black text-[10px] tracking-wider"
                            >
                              {s}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-emerald-400">
                        ₹{(b.reservationAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-amber-400">
                        Bal: ₹{(b.remainingBalance || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          b.paymentStatus === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : b.paymentStatus === 'FAILED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                      {b.payments?.[0]?.razorpayOrderId?.startsWith('UPI-') && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-cyan-400">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                            UPI {b.payments[0].razorpayPaymentId ? `UTR: ${b.payments[0].razorpayPaymentId.slice(-6)}` : 'QR Pending'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          b.bookingStatus === 'CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : b.bookingStatus === 'CANCELLED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal (Section 2 full spec) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-stone-950 rounded-3xl border border-stone-800 max-w-2xl w-full p-5 sm:p-7 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                  Detailed Booking Record
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  #{selectedBooking.bookingId}
                  <span
                    className={`text-[10px] font-sans font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase ${
                      selectedBooking.bookingStatus === 'CONFIRMED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : selectedBooking.bookingStatus === 'CANCELLED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {selectedBooking.bookingStatus}
                  </span>
                </h2>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Registered: {new Date(selectedBooking.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lead Traveller & Emergency Contacts */}
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                  Primary Contact
                </span>
                <div className="font-bold text-white text-sm">{selectedBooking.primaryTravellerName}</div>
                <div className="flex items-center gap-1.5 text-stone-300 mt-1">
                  <Phone className="w-3 h-3 text-stone-500" />
                  <span>{selectedBooking.primaryPhone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-300 mt-0.5">
                  <Mail className="w-3 h-3 text-stone-500" />
                  <span>{selectedBooking.primaryEmail}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                  Emergency Contact
                </span>
                <div className="font-bold text-stone-200">
                  {selectedBooking.emergencyContactName || 'Not specified'}
                </div>
                <div className="flex items-center gap-1.5 text-stone-300 mt-1">
                  <Phone className="w-3 h-3 text-stone-500" />
                  <span>{selectedBooking.emergencyContactPhone || 'Not specified'}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  Coach: <strong className="text-white">{selectedBooking.bus?.busNumber || 'Bus 01'}</strong>
                </div>
              </div>
            </div>

            {/* Passenger Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Passenger Roster ({selectedBooking.travellers?.length || 0} Travellers)
                </h3>
              </div>

              <div className="space-y-2">
                {selectedBooking.travellers?.map((t: any) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-stone-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{t.fullName}</div>
                      <div className="text-[11px] text-stone-400">
                        {t.phone} • {t.gender}
                        {t.rollNumber ? ` • Roll: ${t.rollNumber}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-sans font-bold text-xs tracking-wide">
                        Seat {t.assignedSeatNumber || 'Pending'}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          t.checkInStatus === 'CHECKED_IN'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {t.checkInStatus === 'CHECKED_IN' ? 'Checked In' : 'Not Boarded'}
                      </span>

                      {t.ticket?.qrToken && (
                        <Link
                          href={`/tickets/${t.ticket.qrToken}`}
                          target="_blank"
                          className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white"
                          title="View Digital Ticket"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Overview & Manual Balance Collection */}
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-white/10 space-y-3 text-xs">
              <h3 className="font-bold text-stone-200 uppercase tracking-wider text-xs">
                Financial Summary & Settlement
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-950/60 border border-white/5">
                  <span className="text-[10px] font-bold uppercase text-stone-500 block">Total Amount</span>
                  <span className="font-bold text-white text-sm">
                    ₹{(selectedBooking.finalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">Deposit Paid</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    ₹{(selectedBooking.reservationAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">Remaining Balance</span>
                  <span className="font-bold text-amber-400 text-sm">
                    ₹{(selectedBooking.remainingBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950/60 border border-white/5">
                  <span className="text-[10px] font-bold uppercase text-stone-500 block">Payment State</span>
                  <span className="font-bold text-stone-200 text-xs block mt-0.5">
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Settle Remaining Balance */}
              {selectedBooking.remainingBalance > 0 && selectedBooking.bookingStatus !== 'CANCELLED' && (
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-stone-300 font-semibold text-xs">
                    Settle Remaining Balance at Desk:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={`Max ₹${selectedBooking.remainingBalance}`}
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-stone-950 border border-white/10 text-white text-xs w-36 focus:outline-none"
                    />
                    <button
                      disabled={actionLoading}
                      onClick={() => {
                        const amt = Number(balanceAmount);
                        if (!amt || amt <= 0 || amt > selectedBooking.remainingBalance) {
                          alert(`Please enter a valid amount between ₹1 and ₹${selectedBooking.remainingBalance}`);
                          return;
                        }
                        handleUpdateBooking(selectedBooking.bookingId, {
                          remainingBalancePaid: amt,
                        });
                        setBalanceAmount('');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50"
                    >
                      Record Settle
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Transactions Roster */}
            {selectedBooking.payments && selectedBooking.payments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Payment Transactions Ledger
                </h3>
                <div className="space-y-1.5">
                  {selectedBooking.payments.map((p: any) => {
                    const isUpi = p.razorpayOrderId?.startsWith('UPI-') || p.razorpaySignature?.includes('UPI');
                    return (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-stone-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-200">
                              {p.razorpayPaymentId || 'Pending Gateway ID'}
                            </span>
                            {isUpi && (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-bold uppercase tracking-wider">
                                Direct UPI
                              </span>
                            )}
                            {p.razorpaySignature && (
                              <span className="text-[9px] text-emerald-400 font-mono">
                                ({p.razorpaySignature})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                            Order: {p.razorpayOrderId} • {p.paymentType}
                          </div>
                        </div>
                        <div className="text-right flex items-center sm:flex-col sm:items-end justify-between">
                          <span className="font-bold text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</span>
                          <span className="block text-[10px] text-stone-400">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Booking Status Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
              <span className="text-xs text-stone-400">Booking Administrative Actions:</span>
              <div className="flex gap-2">
                {selectedBooking.bookingStatus !== 'CONFIRMED' && (
                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      handleUpdateBooking(selectedBooking.bookingId, {
                        bookingStatus: 'CONFIRMED',
                        paymentStatus: 'PAID',
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    Confirm Booking
                  </button>
                )}
                {selectedBooking.bookingStatus !== 'CANCELLED' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to cancel this booking? This will immediately release all reserved seats and cancel digital tickets.'
                        )
                      ) {
                        handleUpdateBooking(selectedBooking.bookingId, { bookingStatus: 'CANCELLED' });
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
