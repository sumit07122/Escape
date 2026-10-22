'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode, CheckCircle2, XCircle, ShieldCheck, Camera,
  AlertCircle, Loader2, RefreshCw, Bus, Ticket, DollarSign, CameraOff
} from 'lucide-react';

interface ScannedTicket {
  id: string;
  ticketNumber: string;
  qrToken: string;
  status: string;
  isCheckedIn: boolean;
  checkInTime?: string | null;
  traveller?: {
    id: string;
    fullName: string;
    gender: string;
    phone: string;
    assignedSeatNumber?: string;
    assignedBusNumber?: string;
  };
  booking?: {
    id: string;
    bookingId: string;
    primaryTravellerName: string;
    primaryPhone: string;
    remainingBalance: number;
    bus?: {
      busNumber: string;
      vehicleName: string;
    };
  };
  lastCheckIn?: {
    adminName?: string;
    checkInTime: string;
  } | null;
}

export default function AdminScannerPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [scannedResult, setScannedResult] = useState<ScannedTicket | null>(null);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'VALID' | 'ALREADY_CHECKED_IN' | 'INVALID'>('IDLE');
  const [loading, setLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setErrorMessage(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Camera access is not supported by your browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // Start BarcodeDetector if supported in browser
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const detectFrame = async () => {
          if (!videoRef.current || !cameraActive) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) {
                stopCamera();
                handleScan(code);
                return;
              }
            }
          } catch {
            // Frame scan fallback
          }
          if (mediaStreamRef.current?.active) {
            requestAnimationFrame(detectFrame);
          }
        };
        requestAnimationFrame(detectFrame);
      }
    } catch (err: unknown) {
      console.error('Camera error:', err);
      setErrorMessage('Could not access camera. Please check camera permissions or use manual entry.');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleScan = async (rawCode?: string) => {
    const code = rawCode || tokenInput;
    if (!code.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setScannedResult(null);
    setScanStatus('IDLE');

    try {
      const res = await fetch('/api/admin/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.ticket) {
        setScanStatus('INVALID');
        setErrorMessage('INVALID TOKEN — No matching student record found');
      } else {
        const ticketData: ScannedTicket = data.ticket;
        setScannedResult(ticketData);

        if (ticketData.isCheckedIn || ticketData.status === 'CHECKED_IN') {
          setScanStatus('ALREADY_CHECKED_IN');
        } else {
          setScanStatus('VALID');
        }
      }
    } catch {
      setScanStatus('INVALID');
      setErrorMessage('Network error communicating with gate verification server.');
    } finally {
      setLoading(false);
    }
  };

  // Confirm Check-In & Balance Collected
  const handleConfirmCheckIn = async () => {
    if (!scannedResult) return;
    setCheckInLoading(true);
    try {
      const res = await fetch('/api/admin/tickets/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: scannedResult.id,
          notes: '₹5,200 balance collected and verified at GLA departure desk.',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Check-in recorded! Boarding authorized at ${new Date(data.checkInTime || Date.now()).toLocaleTimeString()}.`);
        setScannedResult((prev) =>
          prev
            ? {
                ...prev,
                status: 'CHECKED_IN',
                isCheckedIn: true,
                checkInTime: data.checkInTime || new Date().toISOString(),
              }
            : null
        );
        setScanStatus('ALREADY_CHECKED_IN');
      } else {
        alert(data.error || 'Check-in failed to record.');
      }
    } catch {
      alert('Network failure recording check-in.');
    } finally {
      setCheckInLoading(false);
    }
  };

  const travellerName = scannedResult?.traveller?.fullName || scannedResult?.booking?.primaryTravellerName || 'Student';
  const busNumber = scannedResult?.traveller?.assignedBusNumber || scannedResult?.booking?.bus?.busNumber || 'Bus 01';
  const seatNumber = scannedResult?.traveller?.assignedSeatNumber || 'L1';
  const checkedInTimeFormatted = scannedResult?.checkInTime
    ? new Date(scannedResult.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : scannedResult?.lastCheckIn?.checkInTime
    ? new Date(scannedResult.lastCheckIn.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Earlier today';
  const checkedInAdminName = scannedResult?.lastCheckIn?.adminName || 'Gate Officer';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> GLA UNIVERSITY DEPARTURE GATE CHECK-IN
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Departure QR Gate Scanner
        </h1>
        <p className="text-xs text-zinc-400">
          Scan digital boarding pass QR codes with device camera or USB scanner gun to authorize student boarding.
        </p>
      </div>

      {/* Camera Live Scanner Box */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" /> HTML5 Camera Scanner
          </span>
          <button
            type="button"
            onClick={cameraActive ? stopCamera : startCamera}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {cameraActive ? (
              <>
                <CameraOff className="w-4 h-4" /> Stop Camera
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" /> Open Camera Feed
              </>
            )}
          </button>
        </div>

        {cameraActive && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 shadow-xl flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Overlay Targeting Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-2xl">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400/40 animate-pulse" />
              </div>
            </div>
            <span className="absolute bottom-3 px-3 py-1 rounded-full bg-black/60 text-[10px] font-mono text-emerald-300">
              Align QR code inside reticle
            </span>
          </div>
        )}

        {/* Manual Input Fallback */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="space-y-3 pt-2 border-t border-zinc-800"
        >
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Or Enter Token / Booking Reference:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Paste token (e.g. GHE-VERIFY-XXXX) or Booking ID (e.g. GHE-101010)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Scan</span>}
            </button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 3 SPECIFIED INSTANT VISUAL SCAN RESPONSE BANNERS          */}
      {/* ======================================================== */}

      {/* 1. GREEN BANNER: VALID PASS */}
      {scanStatus === 'VALID' && scannedResult && (
        <div className="p-6 rounded-3xl bg-emerald-950/80 border-2 border-emerald-400 text-white space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black tracking-widest text-emerald-300 uppercase block">
                GATE VERIFICATION CLEARED
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                VALID PASS — {travellerName} — {busNumber}, Seat {seatNumber} — Collect ₹5,200 Balance
              </h2>
              <p className="text-xs text-emerald-200">
                Ticket #{scannedResult.ticketNumber} • Booking #{scannedResult.booking?.bookingId}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase block font-semibold">CASHIER INSTRUCTION</span>
              <span className="text-sm font-black text-amber-300">Collect ₹5,200 Pending Balance</span>
            </div>
            {/* One-Click Action Button */}
            <button
              type="button"
              onClick={handleConfirmCheckIn}
              disabled={checkInLoading}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wide"
            >
              {checkInLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Confirm Check-In & Balance Collected</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. RED ALERT: ALREADY CHECKED IN (ANTI-PASSBACK PROTECTION) */}
      {scanStatus === 'ALREADY_CHECKED_IN' && (
        <div className="p-6 rounded-3xl bg-rose-950/90 border-2 border-rose-500 text-white space-y-3 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <XCircle className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black tracking-widest text-rose-300 uppercase block">
                DUPLICATE PASS ENTRY DENIED
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-rose-100">
                ALREADY CHECKED IN at {checkedInTimeFormatted} by {checkedInAdminName}
              </h2>
              <p className="text-xs text-rose-200">
                Anti-passback protection engaged. Traveller {travellerName} was already processed for {busNumber}, Seat {seatNumber}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. YELLOW ALERT: INVALID TOKEN */}
      {scanStatus === 'INVALID' && (
        <div className="p-6 rounded-3xl bg-amber-950/80 border-2 border-amber-400 text-white space-y-3 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center shrink-0">
              <AlertCircle className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black tracking-widest text-amber-300 uppercase block">
                UNRECOGNIZED BOARDING CODE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-100">
                INVALID TOKEN — No matching student record found
              </h2>
              <p className="text-xs text-amber-200">
                {errorMessage || 'This QR token does not exist on the expedition manifest. Please re-check or verify booking ID.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold text-center">
          {successMessage}
        </div>
      )}
    </div>
  );
}
