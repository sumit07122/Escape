'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, ShieldCheck, Bus, MapPin, Ticket, AlertCircle } from 'lucide-react';

export default function VerifyTicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/tickets/${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok) {
          setTicketData(data.ticket);
        } else {
          setError(data.error || 'Invalid or unrecognized QR token.');
        }
      } catch {
        setError('Verification request failed. Please check network connectivity.');
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-16 space-y-6">
      {loading ? (
        <div className="p-12 text-center text-zinc-400">Verifying Boarding Pass with Expedition Server...</div>
      ) : error ? (
        <div className="glass-card rounded-3xl p-8 border border-rose-600/50 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white">INVALID TICKET</h1>
          <p className="text-xs text-rose-300">{error}</p>
          <p className="text-[11px] text-zinc-500">
            Token: <span className="font-mono">{token}</span>
          </p>
          <div className="pt-4">
            <Link href="/" className="text-xs font-bold text-emerald-400 underline">
              Return to Himalayan Escape
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-8 border border-emerald-500/40 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto glow-emerald">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600/30">
              VERIFIED EXPEDITION PASS
            </span>
            <h1 className="text-2xl font-black text-white mt-2">
              {ticketData.traveller?.fullName || 'Confirmed Traveller'}
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Booking #{ticketData.booking?.bookingId} • Ticket #{ticketData.ticketNumber}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left text-xs bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div>
              <span className="text-zinc-500 block">Assigned Coach</span>
              <span className="font-bold text-white text-sm">{ticketData.booking?.bus?.busNumber || 'Bus 01'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Assigned Seat</span>
              <span className="font-black text-sky-400 text-sm">
                Seat {ticketData.traveller?.assignedSeatNumber}
              </span>
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-zinc-500 block">Payment Status</span>
              <span className="font-bold text-emerald-400">
                {ticketData.booking?.paymentStatus === 'PAID' ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <span className="text-zinc-500 block">Boarding Status</span>
              <span className={`font-bold ${ticketData.status === 'CHECKED_IN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {ticketData.status === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In'}
              </span>
            </div>
          </div>

          <div className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Boarding Location: Mathura NH-2 Departure Bay</span>
          </div>
        </div>
      )}
    </div>
  );
}
