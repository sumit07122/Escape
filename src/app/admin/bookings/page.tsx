'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Filter, CheckCircle2, AlertCircle, Eye,
  RefreshCw, DollarSign, UserCheck, X, Ticket
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/bookings';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleUpdateBooking = async (bookingId: string, updates: any) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, ...updates }),
      });

      if (res.ok) {
        await fetchBookings();
        if (selectedBooking && selectedBooking.bookingId === bookingId) {
          const updated = await fetch(`/api/bookings/${bookingId}`).then((r) => r.json());
          setSelectedBooking(updated.booking);
        }
      }
    } catch (err) {
      console.error('Failed to update booking:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            REGISTRATION REGISTRY
          </span>
          <h1 className="text-3xl font-black text-white">Bookings Management</h1>
          <p className="text-xs text-zinc-400">
            View, audit, and manage confirmed and pending traveller bookings.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Booking ID, traveller name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button
          onClick={fetchBookings}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
        >
          Apply Search
        </button>
      </div>

      {/* Bookings Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Traveller</th>
                <th className="p-4">Package</th>
                <th className="p-4">Coach & Seats</th>
                <th className="p-4">Paid / Balance</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Booking</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    No bookings found matching filters.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-white">
                      {b.bookingId}
                      {b.isGroupOffer && (
                        <span className="block text-[9px] text-amber-400 font-bold">5+1 Group</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-zinc-200">{b.primaryTravellerName}</div>
                      <div className="text-[11px] text-zinc-400">{b.primaryPhone}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-zinc-300">{b.package?.name}</span>
                      <span className="block text-[11px] text-zinc-500">{b.travellersCount} pax</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white">{b.bus?.busNumber || 'Bus 01'}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {b.travellers?.map((t: any) => t.assignedSeatNumber).filter(Boolean).map((s: string) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-black text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-emerald-400">₹{b.reservationAmount}</div>
                      <div className="text-[11px] text-zinc-400">Bal: ₹{b.remainingBalance}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        b.paymentStatus === 'PAID' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        b.bookingStatus === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-3xl border border-zinc-700 max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase">Booking Inspection</span>
                <h2 className="text-xl font-black text-white">#{selectedBooking.bookingId}</h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Travellers Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Travellers in this booking ({selectedBooking.travellers?.length})
              </h3>
              <div className="space-y-2">
                {selectedBooking.travellers?.map((t: any) => (
                  <div key={t.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{t.fullName}</div>
                      <div className="text-[11px] text-zinc-400">{t.phone} • {t.email} • {t.gender}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-black text-xs">
                        Seat {t.assignedSeatNumber || 'Unassigned'}
                      </span>
                      <span className="block text-[10px] text-zinc-500 mt-1">
                        {t.checkInStatus === 'CHECKED_IN' ? '✓ Checked In' : 'Not Checked In'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Overview & Record Settlement */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Financial Overview</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block">Total Amount:</span>
                  <span className="font-bold text-white">₹{selectedBooking.finalAmount}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Reservation Paid:</span>
                  <span className="font-bold text-emerald-400">₹{selectedBooking.reservationAmount}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Discount Applied:</span>
                  <span className="font-bold text-zinc-300">₹{selectedBooking.discountAmount}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Remaining Balance:</span>
                  <span className="font-bold text-amber-400">₹{selectedBooking.remainingBalance}</span>
                </div>
              </div>

              {/* Record Remaining Balance Payment */}
              {selectedBooking.remainingBalance > 0 && (
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <span className="text-zinc-300 font-semibold block">Settle Remaining Balance:</span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={`Max ₹${selectedBooking.remainingBalance}`}
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs w-36 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (!balanceAmount || Number(balanceAmount) <= 0) return;
                        handleUpdateBooking(selectedBooking.bookingId, {
                          remainingBalancePaid: Number(balanceAmount),
                        });
                        setBalanceAmount('');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Change Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-xs text-zinc-400">Booking Controls:</span>
              <div className="flex gap-2">
                {selectedBooking.bookingStatus !== 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateBooking(selectedBooking.bookingId, { bookingStatus: 'CONFIRMED', paymentStatus: 'PAID' })}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Confirm Booking
                  </button>
                )}
                {selectedBooking.bookingStatus !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      if (confirm('Cancel this booking? This will release reserved seats.')) {
                        handleUpdateBooking(selectedBooking.bookingId, { bookingStatus: 'CANCELLED' });
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 text-xs font-bold"
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
