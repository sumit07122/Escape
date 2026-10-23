'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Bus, CheckCircle2, Download, Phone,
  AlertCircle, Loader2, ArrowRight, User, Printer
} from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

function BookingTrackerContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams?.get('id') || searchParams?.get('bookingId') || '';

  const [bookingIdInput, setBookingIdInput] = useState(initialId);
  const [verifyPhoneInput, setVerifyPhoneInput] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setError('Please enter the primary phone number used during booking to verify ticket ownership.');
        } else {
          setError(data.error || 'No booking found with this reference.');
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
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8 text-xs sm:text-sm bg-[#F7F5EF] text-[#171918]">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest">
          TRAVELLER PORTAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#171918]">
          My Trip & Boarding Pass
        </h1>
        <p className="text-xs text-[#646864] max-w-md mx-auto">
          Access your confirmed seat reservation, view your QR boarding pass, and prepare for departure near Main Gate (NH-2), Mathura.
        </p>
        <div className="pt-2">
          <Link
            href="/my-bookings"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#163C32]/10 hover:bg-[#163C32]/15 text-[#163C32] text-xs font-bold transition-colors"
          >
            <span>Signed in with Google? View All My Bookings Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Lookup Form */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 border border-[#D8D2C4] space-y-3 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBooking(bookingIdInput, verifyPhoneInput);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-[11px] font-bold text-[#171918] uppercase mb-1">
              Booking ID (e.g. GHE-XXXXXX)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#646864] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="GHE-XXXXXX"
                value={bookingIdInput}
                onChange={(e) => setBookingIdInput(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-[#171918] font-mono text-sm tracking-wider uppercase focus:border-[#163C32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#171918] uppercase mb-1">
              Primary Phone Number (Ownership Verification)
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210 (10 Digits)"
              value={verifyPhoneInput}
              onChange={(e) => setVerifyPhoneInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-[#171918] text-xs focus:border-[#163C32] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#163C32] hover:bg-[#0F2A23] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>Retrieve My Booking</span>}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Details Display (Section 25 Minimal Design) */}
      {booking && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D8D2C4] space-y-6 shadow-sm animate-in fade-in duration-200">
          {/* Top Status */}
          <div className="border-b border-[#E7E2D8] pb-5 space-y-1">
            <span className="text-xs font-black text-[#163C32] uppercase tracking-widest block">
              STATUS: CONFIRMED
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#171918]">
                MY TRIP #{booking.bookingId}
              </h2>
              <span className="text-xs font-mono text-[#646864]">
                Booked: {new Date(booking.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4]">
              <span className="text-[#646864] block">Traveller</span>
              <p className="font-bold text-[#171918] text-sm mt-0.5">{booking.primaryTravellerName}</p>
              <p className="text-[11px] text-[#646864]">{booking.travellersCount} Person(s)</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4]">
              <span className="text-[#646864] block">Coach</span>
              <p className="font-bold text-[#171918] text-sm mt-0.5">{booking.bus?.busNumber || 'Bus 01'}</p>
              <p className="text-[11px] text-[#646864]">Luxury 2x2 AC</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4]">
              <span className="text-[#646864] block">Reserved Seats</span>
              <p className="font-black text-[#163C32] text-base mt-0.5">
                {booking.travellers?.map((t: any) => t.assignedSeatNumber).filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4]">
              <span className="text-[#646864] block">Balance Due at Gate</span>
              <p className="font-black text-[#D87945] text-base mt-0.5">
                ₹{booking.remainingBalance?.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-[#646864]">Paid Deposit: ₹{booking.reservationAmount?.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Digital Boarding Passes (Section 26) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#171918] uppercase tracking-wider">
                Digital Boarding Passes
              </h3>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F5EF] hover:bg-[#E7E2D8] border border-[#D8D2C4] text-xs font-bold text-[#171918]"
              >
                <Printer className="w-3.5 h-3.5 text-[#163C32]" />
                <span>Print Passes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {booking.travellers?.map((t: any, idx: number) => (
                <div
                  key={t.id || idx}
                  className="p-5 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#D87945] uppercase tracking-wider block">
                        HIMALAYAN ESCAPE
                      </span>
                      <h4 className="font-black text-sm text-[#171918]">{t.fullName}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#163C32] text-white font-mono font-bold text-xs">
                      Seat {t.assignedSeatNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* QR Code Container */}
                    <div className="w-24 h-24 bg-white p-1 rounded-xl border border-[#D8D2C4] flex items-center justify-center shrink-0">
                      {t.ticket?.qrCodeImage ? (
                        <img
                          src={t.ticket.qrCodeImage}
                          alt="Boarding QR Token"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-[10px] text-center text-[#646864]">QR Generated</div>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-[#646864]">
                      <p><strong>Coach:</strong> {booking.bus?.busNumber || 'Bus 01'}</p>
                      <p><strong>Reporting:</strong> Main Gate (NH-2), Mathura (04:30 PM)</p>
                      <p><strong>Deposit Paid:</strong> ₹1,000 | <strong>Balance Due:</strong> ₹5,200</p>
                      {t.ticket?.qrToken && (
                        <Link
                          href={`/ticket/${t.ticket.qrToken}`}
                          className="inline-block mt-1 font-bold text-[#163C32] hover:text-[#D87945] underline text-[11px]"
                        >
                          Open Full Boarding Pass →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-[#E7E2D8] flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F7F5EF] hover:bg-[#E7E2D8] border border-[#D8D2C4] text-xs font-bold text-[#171918]"
            >
              <span>VIEW 6-DAY ITINERARY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-2 text-xs text-[#646864]">
              <Phone className="w-3.5 h-3.5 text-[#163C32]" />
              <span>Gate Help: {CONTACT_INFO.coordinatorPhone1}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading booking portal...</div>}>
      <BookingTrackerContent />
    </Suspense>
  );
}
