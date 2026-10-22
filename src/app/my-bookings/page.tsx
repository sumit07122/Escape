'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bus, User, Ticket, Calendar, MapPin, CheckCircle2,
  Clock, AlertCircle, ArrowRight, Loader2, Sparkles,
  Phone, Printer, ExternalLink, Mountain
} from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

interface Traveller {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  rollNumber?: string | null;
  collegeId?: string | null;
  assignedSeatNumber?: string | null;
  assignedBusNumber?: string | null;
  checkInStatus: string;
  ticket?: {
    id: string;
    ticketNumber: string;
    qrToken: string;
    status: string;
  } | null;
}

interface Booking {
  id: string;
  bookingId: string;
  primaryTravellerName: string;
  primaryEmail: string;
  primaryPhone: string;
  travellersCount: number;
  totalAmount: number;
  reservationAmount: number;
  remainingBalance: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
  bus?: {
    id: string;
    busNumber: string;
    vehicleName: string;
    vehicleNumber: string;
  } | null;
  travellers: Traveller[];
}

export default function MyBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; image?: string | null } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Check user auth session
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();

        if (!authRes.ok || !authData.authenticated || !authData.user) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        setAuthenticated(true);
        setCurrentUser(authData.user);

        // 2. Fetch user's bookings
        const bookingsRes = await fetch('/api/bookings/my');
        const bookingsData = await bookingsRes.json();

        if (bookingsRes.ok && Array.isArray(bookingsData.bookings)) {
          setBookings(bookingsData.bookings);
        } else {
          setError(bookingsData.error || 'Unable to retrieve your bookings');
        }
      } catch (err) {
        console.error('Error loading my bookings:', err);
        setError('Network connection error. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-[#F7F5EF] text-[#171918]">
        <div className="w-10 h-10 border-4 border-[#163C32] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#163C32]">
          Loading Your Expeditions...
        </p>
      </div>
    );
  }

  // Unauthenticated State: Clean prompt to login
  if (!authenticated) {
    return (
      <div className="w-full min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#F7F5EF] text-[#171918]">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#D8D2C4] space-y-6 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#163C32]/10 text-[#163C32] flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#D87945]">
              TRAVELLER DASHBOARD
            </span>
            <h1 className="text-2xl font-black text-[#171918]">Access Your Bookings</h1>
            <p className="text-xs text-[#646864] leading-relaxed">
              Sign in with your verified Google account to view active reservations, coach allocations, and digital boarding passes.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href="/api/auth/google?returnUrl=/my-bookings"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[#D8D2C4] bg-white hover:bg-[#F7F5EF] text-[#171918] font-bold text-xs shadow-sm transition-all hover:border-[#B4AA96]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </a>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#D8D2C4]" />
              <span className="flex-shrink mx-3 text-[10px] text-[#646864] uppercase font-bold tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-[#D8D2C4]" />
            </div>

            <Link
              href="/my-booking"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F7F5EF] hover:bg-[#E7E2D8] border border-[#D8D2C4] text-[#163C32] font-bold text-xs transition-colors"
            >
              <span>Lookup by Booking ID & Phone</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Profile View
  return (
    <div className="w-full min-h-screen py-10 px-4 bg-[#F7F5EF] text-[#171918]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {currentUser?.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#163C32] shadow-sm shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#163C32] text-white font-black text-xl flex items-center justify-center shrink-0">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'TR'}
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D87945] block">
                AUTHENTICATED TRAVELLER
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171918]">
                {currentUser?.name || 'Explorer'}
              </h1>
              <p className="text-xs text-[#646864] font-medium">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="px-5 py-2.5 rounded-xl bg-[#163C32] hover:bg-[#0F2A23] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <span>Book Seats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="/api/auth/logout"
              className="px-4 py-2.5 rounded-xl bg-[#F7F5EF] hover:bg-[#E7E2D8] border border-[#D8D2C4] text-[#171918] text-xs font-bold transition-all"
            >
              Sign Out
            </a>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Section Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#171918]">My Expeditions</h2>
            <p className="text-xs text-[#646864]">Manage your confirmed reservations and access digital boarding passes.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#163C32]/10 text-[#163C32] text-xs font-bold">
            {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
          </span>
        </div>

        {/* Empty State Illustration */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-16 border border-[#D8D2C4] text-center space-y-5 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-[#F7F5EF] border border-[#D8D2C4] flex items-center justify-center mx-auto text-[#163C32]">
              <Mountain className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-black text-[#171918]">No Active Expeditions Found</h3>
              <p className="text-xs text-[#646864] leading-relaxed">
                You haven&apos;t reserved your seat for the Himalayan Escape yet. Secure your spot on our luxury 2×2 coach with a ₹1,000 reservation deposit!
              </p>
            </div>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white text-xs font-black shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Book Your Seat Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Active Booking Cards List */
          <div className="space-y-6">
            {bookings.map((booking) => {
              const isConfirmed = booking.bookingStatus === 'CONFIRMED';
              const assignedSeats = booking.travellers
                .map((t) => t.assignedSeatNumber)
                .filter(Boolean)
                .join(', ');
              const busName = booking.bus?.busNumber || 'Bus 01';

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] shadow-sm space-y-6 animate-in fade-in duration-200"
                >
                  {/* Top Bar: Booking ID & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E2D8] pb-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#D87945]">
                        EXPEDITION RESERVATION
                      </span>
                      <h3 className="text-xl font-black text-[#171918] font-mono">
                        #{booking.bookingId}
                      </h3>
                      <p className="text-[11px] text-[#646864]">
                        Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : booking.bookingStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>
                  </div>

                  {/* Core Booking Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4]">
                      <span className="text-[#646864] block font-semibold">Coach & Assignment</span>
                      <p className="font-bold text-[#171918] text-sm mt-1">{busName}</p>
                      <p className="text-[11px] text-[#646864]">Luxury 2×2 AC Coach</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4]">
                      <span className="text-[#646864] block font-semibold">Reserved Seat(s)</span>
                      <p className="font-black text-[#163C32] text-base mt-1">
                        {assignedSeats ? `Seat ${assignedSeats}` : 'Seat Pending'}
                      </p>
                      <p className="text-[11px] text-[#646864]">{booking.travellersCount} Passenger(s)</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4]">
                      <span className="text-[#646864] block font-semibold">Deposit Paid</span>
                      <p className="font-bold text-emerald-700 text-base mt-1">
                        ₹{booking.reservationAmount?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-[#646864]">Online Confirmation</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#E8D0C0]">
                      <span className="text-[#B85F30] block font-semibold">Balance Due at Gate</span>
                      <p className="font-black text-[#D87945] text-base mt-1">
                        ₹{booking.remainingBalance?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-[#646864]">Payable Cash / UPI</p>
                    </div>
                  </div>

                  {/* Digital Boarding Passes per Traveller */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#171918] uppercase tracking-wider">
                      Passenger Boarding Passes
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {booking.travellers.map((traveller, idx) => {
                        const ticketToken = traveller.ticket?.qrToken;
                        return (
                          <div
                            key={traveller.id || idx}
                            className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4] flex items-center justify-between gap-4"
                          >
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-[#D87945] uppercase">
                                Seat {traveller.assignedSeatNumber || 'Assigned'}
                              </span>
                              <h5 className="font-black text-sm text-[#171918]">{traveller.fullName}</h5>
                              <p className="text-[11px] text-[#646864]">
                                Roll No: {traveller.rollNumber || traveller.collegeId || 'ID Verified'}
                              </p>
                            </div>

                            {ticketToken ? (
                              <Link
                                href={`/ticket/${ticketToken}`}
                                className="px-3.5 py-2 rounded-xl bg-[#163C32] hover:bg-[#0F2A23] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 transition-colors"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>View Pass</span>
                              </Link>
                            ) : (
                              <span className="text-[11px] font-bold text-[#646864]">Pass Processing</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reporting Details & Gate Assistance */}
                  <div className="pt-4 border-t border-[#E7E2D8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#646864]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#163C32]" />
                      <span>Pickup: Near GLA Main Gate, Mathura (04:30 PM)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#163C32]" />
                      <span>Gate Help: {CONTACT_INFO.coordinatorPhone1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
