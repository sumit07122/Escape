'use client';

import React, { useState } from 'react';
import {
  QrCode, CheckCircle2, XCircle, ShieldCheck, UserCheck,
  AlertCircle, Loader2, RefreshCw, Bus, Ticket, MapPin
} from 'lucide-react';

export default function AdminScannerPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);

  const handleScan = async (rawCode?: string) => {
    const code = rawCode || tokenInput;
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setCheckInSuccess(null);
    setScannedResult(null);

    try {
      const res = await fetch('/api/admin/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'INVALID / UNKNOWN TICKET: Verification failed.');
      } else {
        setScannedResult(data.ticket);
      }
    } catch {
      setError('Network communication failed with ticket verification server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scannedResult) return;
    setCheckInLoading(true);
    try {
      const res = await fetch('/api/admin/tickets/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: scannedResult.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setCheckInSuccess(`Successfully checked in! Timestamp: ${new Date(data.checkInTime).toLocaleTimeString()}`);
        setScannedResult((prev: any) => ({
          ...prev,
          status: 'CHECKED_IN',
          isCheckedIn: true,
          checkInTime: data.checkInTime,
        }));
      } else {
        alert(data.error || 'Check-in failed');
      }
    } catch {
      alert('Error recording check-in');
    } finally {
      setCheckInLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> GLA BOARDING GATE DISPATCH
        </span>
        <h1 className="text-3xl font-black text-white">QR Ticket Scanner</h1>
        <p className="text-xs text-zinc-400">
          Scan QR tokens or enter Booking IDs to verify boarding credentials and check-in travellers.
        </p>
      </div>

      {/* Manual Input / Scanner Form */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="space-y-3"
        >
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Scan / Enter Verification Token or Booking ID:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Paste QR URL, GHE-VERIFY-XXXX or Booking ID (e.g. GHE-101010)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 glow-emerald"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify</span>}
            </button>
          </div>
        </form>

        <div className="text-[11px] text-zinc-500">
          * Hardware USB barcode/QR scanner guns automatically trigger Enter on scan.
        </div>
      </div>

      {/* Verification Error */}
      {error && (
        <div className="p-6 rounded-3xl bg-rose-950/70 border border-rose-600/50 text-center space-y-3">
          <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-black text-white">INVALID / UNKNOWN TICKET</h2>
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      )}

      {/* Verification Success Result */}
      {scannedResult && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center glow-emerald">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  VALID DIGITAL TICKET
                </span>
                <h2 className="text-2xl font-black text-white">
                  {scannedResult.traveller?.fullName || 'Traveller'}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase block">Booking ID</span>
              <span className="font-mono text-base font-black text-white">
                #{scannedResult.booking?.bookingId}
              </span>
            </div>
          </div>

          {/* Ticket Credentials Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div>
              <span className="text-zinc-500 block">Assigned Coach</span>
              <span className="font-bold text-white text-sm">{scannedResult.booking?.busNumber}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Assigned Seat</span>
              <span className="font-black text-sky-400 text-base">
                {scannedResult.traveller?.assignedSeatNumber}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Payment</span>
              <span className="font-bold text-emerald-400 uppercase">
                {scannedResult.booking?.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Booking</span>
              <span className="font-bold text-emerald-400 uppercase">
                {scannedResult.booking?.bookingStatus}
              </span>
            </div>
          </div>

          {/* Check-in Status Banner */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className={`w-6 h-6 ${scannedResult.isCheckedIn ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <div>
                <div className="font-bold text-white text-xs">
                  {scannedResult.isCheckedIn ? 'TRAVELLER CHECKED IN' : 'READY FOR BOARDING'}
                </div>
                {scannedResult.checkInTime && (
                  <p className="text-[11px] text-zinc-400">
                    Checked in at: {new Date(scannedResult.checkInTime).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {!scannedResult.isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={checkInLoading}
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg glow-orange flex items-center gap-2"
              >
                {checkInLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>CHECK IN TRAVELLER</span>}
              </button>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600/40 text-xs font-bold">
                ✓ Checked In
              </span>
            )}
          </div>

          {checkInSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs font-semibold text-center">
              {checkInSuccess}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
