'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Ticket, Bus, Calendar, CheckCircle2, Download,
  Phone, MessageSquare, AlertCircle, Loader2, ArrowRight, User
} from 'lucide-react';
import { CONTACT_INFO, TRIP_METADATA } from '@/lib/constants';

function BookingTrackerContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('id') || searchParams?.get('bookingId') || '';

  const [bookingIdInput, setBookingIdInput] = useState(initialId);
  const [verifyPhoneInput, setVerifyPhoneInput] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<any>(null);

  // Check customer session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUserSession(data.user);
          }
        }
      } catch {
        // Fallback
      }
    }
    checkAuth();
  }, []);

  const fetchBooking = async (id: string, phoneVerification?: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const cleanId = id.trim().toUpperCase();
      let url = `/api/bookings/${encodeURIComponent(cleanId)}`;
      if (phoneVerification) {
        url += `?phone=${encodeURIComponent(phoneVerification)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setError('Security Notice: Please enter the primary phone number associated with this booking to verify ownership.');
        } else {
          setError(data.error || 'No booking found with this ID.');
        }
        setBooking(null);
      } else {
        setBooking(data.booking);
      }
    } catch {
      setError('Failed to fetch booking. Please check connection.');
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
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8 text-xs sm:text-sm">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          TRAVELLER DASHBOARD
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          My Booking & Boarding Pass
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          View your confirmed bus seats, download digital QR tickets, and check trip itinerary.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="max-w-xl mx-auto glass-card rounded-2xl p-5 border border-white/10 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBooking(bookingIdInput, verifyPhoneInput);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
              Booking Reference (e.g. GHE-XXXXXX)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="GHE-XXXXXX"
                value={bookingIdInput}
                onChange={(e) => setBookingIdInput(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm tracking-wider uppercase focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
              Primary Phone Number (For Ownership Verification)
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210 (10 Digits)"
              value={verifyPhoneInput}
              onChange={(e) => setVerifyPhoneInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Retrieve My Booking</span>}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-rose-950/70 border border-rose-600/50 flex items-center gap-2.5 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Details Display (Section 25 Minimal Design) */}
      {booking && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6 animate-in fade-in duration-300">
          {/* Top Status */}
          <div className="border-b border-zinc-800 pb-5 space-y-1">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
              BOOKING CONFIRMED
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Booking #{booking.bookingId}
              </h2>
              <span className="text-xs font-mono text-zinc-400">
                Created: {new Date(booking.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Traveller</span>
              <p className="font-bold text-white text-sm mt-0.5">{booking.primaryTravellerName}</p>
              <p className="text-[11px] text-zinc-400">{booking.travellersCount} Person(s)</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Coach</span>
              <p className="font-bold text-white text-sm mt-0.5">{booking.bus?.busNumber || 'Bus 01'}</p>
              <p className="text-[11px] text-zinc-400">Luxury 2x2 AC</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Reserved Seats</span>
              <p className="font-black text-emerald-400 text-base mt-0.5">
                {booking.travellers?.map((t: any) => t.assignedSeatNumber).filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Remaining Balance</span>
              <p className="font-black text-amber-400 text-base mt-0.5">
                ₹{booking.remainingBalance?.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-zinc-500">Paid: ₹{booking.reservationAmount?.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* QR Ticket Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Digital QR Boarding Passes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {booking.travellers?.map((t: any, idx: number) => (
                <div
                  key={t.id || idx}
                  className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.fullName}</h4>
                      <p className="text-[11px] text-zinc-400">Seat: <strong className="text-emerald-400">{t.assignedSeatNumber}</strong> • {t.gender}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.checkInStatus === 'CHECKED_IN' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {t.checkInStatus === 'CHECKED_IN' ? 'CHECKED IN' : 'VALID PASS'}
                    </span>
                  </div>

                  {t.ticket?.qrDataUrl && (
                    <div className="flex items-center gap-4 pt-1">
                      <img
                        src={t.ticket.qrDataUrl}
                        alt="Boarding QR Code"
                        className="w-24 h-24 rounded-xl bg-white p-1 shrink-0"
                      />
                      <div className="space-y-1 text-xs">
                        <span className="text-zinc-500 text-[10px] block">SECURITY TOKEN</span>
                        <p className="font-mono text-zinc-300 font-bold break-all text-[10px]">
                          {t.ticket.qrToken}
                        </p>
                        <p className="text-[10px] text-zinc-500">Show at GLA Mathura campus gate</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information & Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 space-y-0.5">
              <p>Coordinator Hotline: <strong className="text-emerald-400">{CONTACT_INFO.coordinatorPhone1}</strong></p>
              <p>Reporting Gate: <strong className="text-white">GLA University Main Gate</strong></p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD TICKET</span>
              </button>
            </div>
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
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-xs font-semibold">Loading booking dashboard...</p>
        </div>
      }
    >
      <BookingTrackerContent />
    </Suspense>
  );
}
