'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bus, Printer, ShieldCheck, CheckCircle2,
  Calendar, MapPin, Phone, AlertCircle, ArrowLeft, Download
} from 'lucide-react';
import { CONTACT_INFO, TRIP_METADATA } from '@/lib/constants';

interface TicketData {
  id: string;
  ticketNumber: string;
  qrToken: string;
  qrDataUrl?: string;
  status: string;
  traveller?: {
    id: string;
    fullName: string;
    gender: string;
    phone: string;
    email: string;
    collegeId?: string;
    rollNumber?: string;
    assignedSeatNumber?: string;
    assignedBusNumber?: string;
    checkInStatus: string;
  } | null;
  booking?: {
    id: string;
    bookingId: string;
    primaryTravellerName: string;
    primaryPhone: string;
    reservationAmount: number;
    remainingBalance: number;
    totalAmount: number;
    paymentStatus: string;
    bus?: {
      busNumber: string;
      vehicleName: string;
      driverName: string;
      driverPhone: string;
    } | null;
  } | null;
}

export default function DigitalTicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTicket() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/tickets/${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.ticket) {
          setTicket(data.ticket);
        } else {
          setError(data.error || 'Ticket record not found or invalid token.');
        }
      } catch {
        setError('Failed to connect to ticket server. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [token]);

  const [passUrl, setPassUrl] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPassUrl(window.location.href);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#F7F5EF] text-[#1C1C1C]">
        <div className="w-10 h-10 border-4 border-[#163C32] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#163C32]">
          Retrieving Expedition Pass...
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 rounded-3xl bg-white border border-red-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-[#1C1C1C]">INVALID TICKET TOKEN</h1>
        <p className="text-xs text-red-600 font-medium">{error}</p>
        <div className="pt-4">
          <Link
            href="/my-bookings"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#163C32] text-white text-xs font-bold hover:bg-[#0E2620]"
          >
            <ArrowLeft className="w-4 h-4" /> Go to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const traveller = ticket.traveller;
  const booking = ticket.booking;
  const busNumber = traveller?.assignedBusNumber || booking?.bus?.busNumber || 'Bus 01';
  const seatNumber = traveller?.assignedSeatNumber || 'L1';
  const isWindow = seatNumber.endsWith('1') || seatNumber.endsWith('4') || seatNumber === 'L9' || seatNumber === 'R9' || seatNumber === 'B1' || seatNumber === 'B5';
  const seatPositionText = isWindow ? 'Window' : seatNumber.startsWith('B') ? 'Rear Bench' : 'Aisle';
  const rollNumberDisplay = traveller?.rollNumber || traveller?.collegeId || 'ID Verified';

  const passengerName = traveller?.fullName || booking?.primaryTravellerName || 'Student';
  const ticketPassUrl = passUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText =
    "🏔️ Himalayan Escape 2026 - My Boarding Pass\n" +
    "Passenger: " + passengerName + "\n" +
    "Bus: " + busNumber + " | Seat: " + seatNumber + "\n" +
    "Remaining Balance Due: ₹5,200\n" +
    "Ticket Pass: " + ticketPassUrl;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen py-10 px-4 bg-[#F7F5EF] text-[#1C1C1C]">
      {/* Control Bar (No-Print) */}
      <div className="max-w-2xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#163C32] hover:text-[#0E2620]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.071.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
            </svg>
            <span>Send Pass to WhatsApp</span>
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#163C32] hover:bg-[#0E2620] text-white text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Save Pass / Print
          </button>
        </div>
      </div>

      {/* Main Boarding Pass Card */}
      <div className="max-w-2xl mx-auto rounded-3xl bg-white border border-[#D8D2C4] shadow-2xl overflow-hidden print-ticket-container">
        {/* Pass Top Branding Banner */}
        <div className="bg-[#163C32] text-white p-6 sm:p-8 relative print-banner">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D87945] flex items-center justify-center text-white font-black text-lg shadow-sm">
                HE
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#D87945] uppercase block">
                  STUDENT MOUNTAIN EXPEDITION
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  HIMALAYAN ESCAPE
                </h1>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase tracking-wider">
                ● HIMALAYAN ESCAPE — EXPEDITION PASS
              </span>
              <p className="text-[10px] text-stone-300 font-mono mt-1">
                PASS #{ticket.ticketNumber}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
            <div>
              <span className="text-[10px] text-stone-300 uppercase block font-semibold">ROUTE</span>
              <span className="font-bold text-white">MATHURA → MANALI × KASOL</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-300 uppercase block font-semibold">DURATION</span>
              <span className="font-bold text-white">6 DAYS / 5 NIGHTS</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-300 uppercase block font-semibold">PICKUP & REPORTING</span>
              <span className="font-bold text-white">Near GLA Main Gate, Mathura</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-300 uppercase block font-semibold">BOOKING REF</span>
              <span className="font-bold text-[#D87945] font-mono">{booking?.bookingId}</span>
            </div>
          </div>
        </div>

        {/* Student & Seat Allocation Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Student Info */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#646864] block">
                  TRAVELLER / STUDENT NAME
                </span>
                <span className="text-xl font-black text-[#1C1C1C]">
                  {traveller?.fullName || booking?.primaryTravellerName}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#646864] block">
                    GENDER
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#1C1C1C]">
                    {traveller?.gender || 'Student'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#646864] block">
                    ROLL NO / ID
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#1C1C1C] font-mono">
                    {rollNumberDisplay}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#646864] block">
                    PHONE
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#1C1C1C]">
                    {traveller?.phone || booking?.primaryPhone}
                  </span>
                </div>
              </div>

              {/* Financial Status & Collect Balance Notice */}
              <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#E8D0C0] space-y-2 print-balance-notice">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#B85F30] block">
                    GATE FINANCIAL CLEARANCE
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Deposit Paid: ₹1,000
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#D87945]/40 text-center">
                  <span className="text-xs sm:text-sm font-black text-[#B85F30] uppercase tracking-wide block">
                    ⚠️ Balance Due at Gate: ₹5,200 (UPI / Cash)
                  </span>
                  <span className="text-[10px] text-[#646864] block mt-0.5">
                    Remaining cash or UPI balance to be settled at gate verification desk before boarding.
                  </span>
                </div>
              </div>
            </div>

            {/* Bus & Seat Assignment Badge */}
            <div className="p-6 rounded-2xl bg-[#163C32] text-white flex flex-col justify-between space-y-4 print-bus-box">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D87945] block mb-1">
                  RESERVED BUS & SEAT ASSIGNMENT
                </span>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {busNumber} — Seat {seatNumber}
                </div>
                <span className="inline-block px-2.5 py-0.5 mt-2 rounded bg-white/20 text-xs font-bold text-stone-200">
                  {seatPositionText} Seat Position
                </span>
              </div>

              <div className="border-t border-white/20 pt-3 text-xs text-stone-300 space-y-1">
                <p className="flex items-center gap-1.5 font-medium">
                  <Bus className="w-3.5 h-3.5 text-[#D87945]" />
                  <span>Coach: {booking?.bus?.vehicleName || 'Himalayan Luxury 2x2 AC Tourist Coach'}</span>
                </p>
                <p className="text-[11px] text-stone-300">
                  Driver: {booking?.bus?.driverName || 'Rajesh Sharma'} ({booking?.bus?.driverPhone || '7017936338'})
                </p>
              </div>
            </div>
          </div>

          {/* Realistic Ticket Perforation Cutout Line */}
          <div className="ticket-perforation" />

          {/* QR Scannable Gate Token Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-[#F7F5EF] border border-[#D8D2C4]">
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> GATE SCANNABLE VERIFICATION TOKEN
              </div>
              <div>
                <span className="text-xs font-bold text-[#646864] block">TOKEN REFERENCE:</span>
                <span className="font-mono text-sm sm:text-base font-black text-[#163C32] tracking-wider select-all">
                  {ticket.qrToken}
                </span>
              </div>
              <p className="text-xs text-[#646864] max-w-sm">
                Present this high-contrast QR pass at the departure gate desk for contactless scanner check-in.
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="shrink-0 p-3 bg-white rounded-2xl border-2 border-[#163C32] shadow-md flex flex-col items-center print-qr-frame">
              {ticket.qrDataUrl ? (
                <img
                  src={ticket.qrDataUrl}
                  alt={`QR code for ticket ${ticket.ticketNumber}`}
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <div className="w-36 h-36 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400 font-mono">
                  QR GENERATING...
                </div>
              )}
              <span className="text-[9px] font-mono text-[#646864] mt-1 font-bold">
                TOKEN: {ticket.qrToken.slice(-8)}
              </span>
            </div>
          </div>

          {/* Departure Reporting Instructions & Helplines */}
          <div className="p-5 rounded-2xl bg-white border border-[#D8D2C4] space-y-3 text-xs">
            <h3 className="font-black text-sm text-[#163C32] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D87945]" /> DEPARTURE REPORTING INSTRUCTIONS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#1C1C1C]/80">
              <p>
                <strong>Reporting Spot:</strong> Near GLA Main Gate (Pickup Bay area), NH-2, Mathura.
              </p>
              <p>
                <strong>Reporting Time:</strong> 04:30 PM. Coach gate verification desk opens 1 hour prior to departure.
              </p>
              <p>
                <strong>Mandatory Documents:</strong> Student ID / College ID + Government ID (Aadhaar/DL).
              </p>
              <p>
                <strong>Luggage Limit:</strong> 1 Main Stowed Bag (up to 15 kg) + 1 Small Cabin Daypack.
              </p>
            </div>
            
            {/* Offline Emergency Helplines for Student Trip Leads */}
            <div className="pt-3 border-t border-[#EFECE4] space-y-1.5 text-xs text-[#646864]">
              <div className="text-[10px] font-black tracking-wider uppercase text-[#163C32]">
                OFFLINE EMERGENCY CONTACTS (STUDENT TRIP LEADS)
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>Lead Coordinator: <a href={`tel:${CONTACT_INFO.coordinatorPhone1}`} className="text-[#163C32] font-bold hover:underline">{CONTACT_INFO.coordinatorPhone1}</a> (Aryan)</span>
                <span>Trip Coordinator: <a href={`tel:${CONTACT_INFO.coordinatorPhone2}`} className="text-[#163C32] font-bold hover:underline">{CONTACT_INFO.coordinatorPhone2}</a> (Rohan)</span>
                <span>Emergency Support: <a href={`tel:${CONTACT_INFO.emergencyCoordinator}`} className="text-[#163C32] font-bold hover:underline">{CONTACT_INFO.emergencyCoordinator}</a></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Footer Disclaimer */}
      <p className="text-[11px] text-center text-[#646864] pt-4 print-disclaimer">
        Independent student-organized expedition. Not an officially sponsored university event.
      </p>
    </div>
  );
}
