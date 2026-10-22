'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Ticket, Bus, Calendar, CheckCircle2, Download,
  Phone, MessageSquare, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

function BookingTrackerContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('id') || '';

  const [bookingIdInput, setBookingIdInput] = useState(initialId);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(id.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No booking found with this ID.');
        setBooking(null);
      } else {
        setBooking(data.booking);
      }
    } catch {
      setError('Failed to fetch booking. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchBooking(initialId);
    }
  }, [initialId]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
          TRAVELLER PORTAL
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Track My Booking & Ticket
        </h1>
        <p className="text-sm text-zinc-400">
          Enter your Booking ID (e.g. GHE-XXXXXX) to view reserved seats, payment receipts, and digital QR passes.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBooking(bookingIdInput);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Enter Booking ID (e.g. GHE-ABC123)"
              value={bookingIdInput}
              onChange={(e) => setBookingIdInput(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm tracking-wider uppercase focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-rose-950/70 border border-rose-600/50 flex items-center gap-2.5 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Details Display */}
      {booking && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                GLA HIMALAYAN ESCAPE
              </span>
              <h2 className="text-2xl font-black text-white">Booking #{booking.bookingId}</h2>
              <p className="text-xs text-zinc-400">Created: {new Date(booking.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                booking.bookingStatus === 'CONFIRMED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {booking.bookingStatus}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                booking.paymentStatus === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {booking.paymentStatus === 'PAID' ? 'RESERVATION PAID' : 'PAYMENT PENDING'}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-500">Coach Assignment</span>
              <p className="font-extrabold text-white text-base mt-0.5">{booking.bus?.busNumber || 'Bus 01'}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-500">Seats Reserved</span>
              <p className="font-extrabold text-sky-400 text-base mt-0.5">
                {booking.travellers?.map((t: any) => t.assignedSeatNumber).filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-500">Reservation Paid</span>
              <p className="font-extrabold text-emerald-400 text-base mt-0.5">₹{booking.reservationAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-500">Remaining Balance</span>
              <p className="font-extrabold text-zinc-300 text-base mt-0.5">₹{booking.remainingBalance.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Travellers & Tickets */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Travellers & Digital Passes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {booking.travellers?.map((t: any, idx: number) => (
                <div
                  key={t.id || idx}
                  className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.fullName}</h4>
                      <p className="text-[11px] text-zinc-400">{t.phone} • {t.gender}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500 text-white font-black text-xs">
                      Seat: {t.assignedSeatNumber}
                    </span>
                  </div>

                  {/* QR Pass */}
                  {t.ticket?.qrDataUrl ? (
                    <div className="flex items-center gap-4 pt-1">
                      <img
                        src={t.ticket.qrDataUrl}
                        alt="QR Code"
                        className="w-24 h-24 rounded-lg bg-white p-1"
                      />
                      <div className="space-y-1 text-xs">
                        <span className="text-zinc-500 text-[10px] block">QR VERIFICATION TOKEN</span>
                        <p className="font-mono text-zinc-300 font-bold break-all text-[11px]">
                          {t.ticket.qrToken}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.checkInStatus === 'CHECKED_IN' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {t.checkInStatus === 'CHECKED_IN' ? 'CHECKED IN' : 'READY TO BOARD'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">QR pass generated upon payment confirmation.</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-800">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700"
            >
              <Download className="w-4 h-4" />
              <span>Print Boarding Pass</span>
            </button>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp1}?text=Hi%2C%20regarding%20booking%20${booking.bookingId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-950 hover:bg-green-900 border border-green-600/50 text-green-300 font-bold text-xs"
            >
              <MessageSquare className="w-4 h-4 text-green-400" />
              <span>WhatsApp Coordinator</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          <p className="text-sm font-semibold">Loading booking tracker...</p>
        </div>
      }
    >
      <BookingTrackerContent />
    </Suspense>
  );
}
