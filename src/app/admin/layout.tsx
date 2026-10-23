'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck, QrCode, LogOut, RefreshCw, LayoutDashboard,
  Mountain, Lock, User, ArrowLeft, PanelsTopLeft, CalendarDays,
  Building2, Ticket, Users, CreditCard, Bus, BarChart3, Receipt,
  Settings, ScrollText, Truck, Tag, ExternalLink, Images
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
      const res = await fetch(`/api/admin/dashboard/stats?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (res.ok) {
        const json = await res.json();

        if (json?.stats) {
          setStats({
            capacity: json.stats.capacity ?? 75,
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
  const totalCap = stats?.capacity ?? 75;
  const activeCap = stats?.confirmedTravellers || 0;
  const revCollected = stats?.reservationRevenue || 0;
  const gatePending = stats?.remainingBalances || 0;
  const navGroups = [
    { label: 'Workspace', items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Site editor', href: '/admin/site-editor', icon: PanelsTopLeft },
      { label: 'Photo gallery', href: '/admin/gallery', icon: Images },
      { label: 'Itinerary', href: '/admin/itinerary', icon: CalendarDays },
      { label: 'Hotels & stays', href: '/admin/hotels', icon: Building2 },
    ] },
    { label: 'Bookings', items: [
      { label: 'Reservations', href: '/admin/bookings', icon: Ticket },
      { label: 'Travellers', href: '/admin/travellers', icon: Users },
      { label: 'Groups', href: '/admin/groups', icon: Users },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    ] },
    { label: 'Operations', items: [
      { label: 'Fleet & seats', href: '/admin/buses', icon: Bus },
      { label: 'Gate scanner', href: '/admin/scanner', icon: QrCode },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
      { label: 'Expenses', href: '/admin/expenses', icon: Receipt },
      { label: 'Referrals', href: '/admin/referrals', icon: Tag },
      { label: 'Transport', href: '/admin/transport', icon: Truck },
    ] },
    { label: 'System', items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Activity log', href: '/admin/audit-logs', icon: ScrollText },
    ] },
  ];
  const currentPage = navGroups.flatMap((group) => group.items).find((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(item.href + '/')
  );
  const mobilePrimaryNav = [
    { label: 'Home', href: '/admin', icon: LayoutDashboard },
    { label: 'Website', href: '/admin/site-editor', icon: PanelsTopLeft },
    { label: 'Fleet', href: '/admin/buses', icon: Bus },
    { label: 'Bookings', href: '/admin/bookings', icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-[#101916] text-stone-100 selection:bg-emerald-500/30 selection:text-emerald-100 lg:flex">
      <aside className="hidden w-[252px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0b1512] lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Link href="/admin" className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8b58e] text-lg font-black text-[#18352b] shadow-lg">H</span>
          <span><strong className="block text-sm font-bold text-white">Escape Admin</strong><span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-stone-500">Site management</span></span>
        </Link>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <section key={group.label} className="mb-6">
              <h2 className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-stone-600">{group.label}</h2>
              <nav className="space-y-1" aria-label={group.label}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(item.href + '/');
                  return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${active ? 'bg-[#1d382e] text-[#f4c49b] shadow-inner' : 'text-stone-400 hover:bg-white/[0.05] hover:text-stone-100'}`}>
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#f0b78c]' : 'text-stone-500 group-hover:text-stone-300'}`} />
                    <span>{item.label}</span>
                    {item.label === 'Gate scanner' && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  </Link>;
                })}
              </nav>
            </section>
          ))}
        </div>
        <div className="border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f3c31] text-xs font-bold text-emerald-100">{(adminUser?.name || 'A').slice(0, 1).toUpperCase()}</span>
            <span><strong className="block text-[11px] text-stone-200">{adminUser?.name || 'Administrator'}</strong><span className="mt-0.5 block text-[9px] uppercase tracking-wider text-stone-500">Site administrator</span></span>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
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
                    {currentPage?.label || 'Site manager'}
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
          <div className="flex min-w-0 items-center gap-4">
            <div>
              <span className="text-stone-400">Capacity: </span>
              <strong className="font-mono text-emerald-400 font-bold">{activeCap}/{totalCap}</strong>
            </div>
            <div className="hidden min-[520px]:block">
              <span className="text-stone-400">Collected: </span>
              <strong className="font-mono text-amber-400 font-bold">₹{revCollected.toLocaleString('en-IN')}</strong>
            </div>
            <div className="hidden min-[760px]:block">
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

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b1512]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:hidden" aria-label="Admin navigation">
        <div className="mx-auto grid max-w-2xl grid-cols-5 items-stretch px-2 pt-1.5">
          {mobilePrimaryNav.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(item.href + '/');
            return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-semibold ${active ? 'text-[#f1c39e]' : 'text-stone-400'}`}><Icon className={`h-4 w-4 ${active ? 'text-[#f1c39e]' : 'text-stone-500'}`} />{item.label}</Link>;
          })}
          <details className="group relative flex min-h-14 flex-col items-center justify-center">
            <summary className="flex min-h-14 w-full cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl px-1 text-[9px] font-semibold text-stone-400 [&::-webkit-details-marker]:hidden"><Settings className="h-4 w-4 text-stone-500" />More</summary>
            <div className="absolute bottom-full right-0 mb-2 max-h-[65dvh] w-[min(92vw,360px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#101916] p-3 shadow-2xl">
              {navGroups.map((group) => <section key={group.label} className="mb-3 last:mb-0"><h2 className="mb-1 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-600">{group.label}</h2><div className="grid grid-cols-2 gap-1">{group.items.filter((item) => !mobilePrimaryNav.some((primary) => primary.href === item.href)).map((item) => { const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(item.href + '/'); return <Link key={item.href} href={item.href} onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')} aria-current={active ? 'page' : undefined} className={`flex min-h-10 items-center gap-2 rounded-xl px-2.5 text-[10px] font-medium ${active ? 'bg-[#1d382e] text-[#f4c49b]' : 'text-stone-300 hover:bg-white/[0.05]'}`}><Icon className="h-3.5 w-3.5 shrink-0" />{item.label}</Link>; })}</div></section>)}
            </div>
          </details>
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto min-h-[calc(100vh-73px)] w-full max-w-[1600px] flex-1 overflow-x-hidden px-4 pb-24 pt-6 sm:px-6 sm:py-8 sm:pb-24 xl:px-9 lg:pb-8">
        {children}
      </main>
    </div>
    </div>
  );
}
