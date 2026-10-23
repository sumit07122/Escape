'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck, QrCode, LogOut, RefreshCw, LayoutDashboard,
  Mountain, Lock, User, ArrowLeft
} from 'lucide-react';

interface AdminStats {
  capacity: number;
  confirmedTravellers: number;
  reservationRevenue: number;
  remainingBalances: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/admin/dashboard/stats');
      if (res.ok) {
        const json = await res.json();
        if (json?.stats) {
          setStats({
            capacity: json.stats.capacity || 75,
            confirmedTravellers: json.stats.confirmedTravellers || 0,
            reservationRevenue: json.stats.reservationRevenue || 0,
            remainingBalances: json.stats.remainingBalances || 0,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data.admin || { name: 'Lead Coordinator', role: 'SUPER_ADMIN' });
        fetchStats();
      } else {
        setAdminUser(null);
      }
    } catch {
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Periodic stats refresh every 60 seconds
  useEffect(() => {
    if (!adminUser) return;
    const interval = setInterval(() => {
      fetchStats();
    }, 60000);
    return () => clearInterval(interval);
  }, [adminUser, fetchStats]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Invalid coordinator credentials');
      } else {
        setAdminUser(data.admin || { name: 'Lead Coordinator', role: 'SUPER_ADMIN' });
        fetchStats();
      }
    } catch {
      setLoginError('Failed to connect to authentication server');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/me', { method: 'POST' });
    } catch {
      // Fallback
    }
    setAdminUser(null);
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 text-stone-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-stone-500 font-mono font-bold">
            Verifying Operations Session...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated Alpine Login Portal
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Subtle Alpine Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-amber-900/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md backdrop-blur-md bg-stone-900/80 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center mx-auto shadow-lg p-2.5">
              <img
                src="/logo.png"
                alt="Himalayan Escape"
                className="w-full h-full object-contain drop-shadow"
                onError={(e) => {
                  // Fallback icon if image path fails
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 font-mono block">
              Alpine Operations Console
            </span>
            <h1 className="text-2xl font-serif font-black text-stone-100 tracking-tight">
              Coordinator Portal
            </h1>
            <p className="text-xs text-stone-400">
              Restricted Expedition Command • Mathura to Manali & Kasol
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Coordinator Username
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Coordinator ID (e.g. PAPAG)"
                className="w-full px-4 py-3 rounded-xl bg-stone-950/80 border border-white/10 text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Access Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Access Password (e.g. BETAG)"
                className="w-full px-4 py-3 rounded-xl bg-stone-950/80 border border-white/10 text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {loginSubmitting ? 'Verifying Credentials...' : 'Enter Operations Desk →'}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
            <Link
              href="/"
              className="hover:text-stone-200 transition-colors flex items-center gap-1"
            >
              ← Public Site
            </Link>
            <span className="text-[10px] text-stone-500 font-mono">
              Lead Student Access Only
            </span>
          </div>
        </div>
      </div>
    );
  }

  const isScannerPage = pathname === '/admin/scanner';
  const totalCap = stats?.capacity || 75;
  const activeCap = stats?.confirmedTravellers || 0;
  const revCollected = stats?.reservationRevenue || 0;
  const gatePending = stats?.remainingBalances || 0;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* ======================================================== */}
      {/* SECTION 2: STICKY TOP BAR (ALPINE MOUNTAIN AESTHETIC)   */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-950/85 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Left: Himalayan Escape Logo Badge + Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/15 p-1.5 flex items-center justify-center shadow-inner group-hover:border-amber-400/50 transition-colors">
                <img
                  src="/logo.png"
                  alt="Himalayan Escape"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-sm sm:text-base text-stone-100 tracking-tight">
                    Operations Command Desk
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400 uppercase">
                    Live
                  </span>
                </div>
                <span className="text-[10px] text-amber-400 font-mono">
                  Himalayan Escape 2026 • Real-Time Dispatch
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Live Stats Pill (Tabular Figures) */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md bg-stone-900/80 border border-white/10 text-xs shadow-inner">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">Active Capacity:</span>
              <span className="font-mono tabular-nums font-bold text-emerald-400">
                {activeCap}/{totalCap}
              </span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">Revenue Collected:</span>
              <span className="font-mono tabular-nums font-bold text-amber-400">
                ₹{revCollected.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">Gate Balance Pending:</span>
              <span className="font-mono tabular-nums font-bold text-stone-300">
                ₹{gatePending.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={fetchStats}
              title="Refresh live figures"
              className="text-stone-500 hover:text-stone-300 transition-colors ml-1 p-0.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

          {/* Right: Direct Actions (QR Scanner & Sign Out) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isScannerPage ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-amber-400/40 text-stone-200 text-xs font-bold transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Command Desk</span>
              </Link>
            ) : (
              <Link
                href="/admin/scanner"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-200" />
                <span className="hidden sm:inline">Open Gate QR Scanner</span>
                <span className="sm:hidden">Scanner</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900/80 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 text-stone-400 hover:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
              title="Sign out of Operations Desk"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Live Stats Banner */}
        <div className="lg:hidden border-t border-white/5 bg-stone-950/90 px-4 py-2 flex items-center justify-between text-[11px] overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-stone-400">Capacity: </span>
              <strong className="font-mono text-emerald-400 font-bold">{activeCap}/{totalCap}</strong>
            </div>
            <div>
              <span className="text-stone-400">Collected: </span>
              <strong className="font-mono text-amber-400 font-bold">₹{revCollected.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-stone-400">Gate Due: </span>
              <strong className="font-mono text-stone-300 font-bold">₹{gatePending.toLocaleString('en-IN')}</strong>
            </div>
          </div>
          <button
            onClick={fetchStats}
            className="text-stone-500 hover:text-amber-400 ml-2"
          >
            <RefreshCw className={`w-3 h-3 ${statsLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
