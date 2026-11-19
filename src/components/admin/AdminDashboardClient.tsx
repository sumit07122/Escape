'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bus,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  PanelsTopLeft,
  Settings2,
  Sliders,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import FleetSeatMatrixTab from '@/components/admin/FleetSeatMatrixTab';
import TripPricingConfigTab from '@/components/admin/TripPricingConfigTab';
import PassengerManifestTab from '@/components/admin/PassengerManifestTab';
import { TripConfigData } from '@/lib/trip-config-shared';

type TabKey = 'overview' | 'fleet' | 'config' | 'manifest';

interface AdminDashboardClientProps {
  initialConfig?: TripConfigData;
}

interface OperationalStats {
  totalBookings: number;
  confirmedTravellers: number;
  reservedSeats: number;
  capacity: number;
  availableCapacity: number;
  confirmedBookings: number;
  pendingBookings: number;
  failedPayments: number;
  cancelledBookings: number;
  totalDepositsCollected: number;
  outstandingBalances: number;
  fullyPaidTravellers: number;
  checkInCount: number;
  remainingToCheckIn: number;
  pendingPayments: number;
  totalRevenue: number;
  reservationRevenue: number;
  remainingBalances: number;
  checkedInTravellers: number;
  heldSeats: number;
}

interface BusMetric {
  id: string;
  busNumber: string;
  vehicleName: string;
  vehicleNumber: string;
  driverName?: string;
  conductorName?: string;
  passengerCapacity: number;
  booked: number;
  held: number;
  available: number;
}

export default function AdminDashboardClient({ initialConfig }: AdminDashboardClientProps) {
  const searchParams = useSearchParams();

  const tabParam = (searchParams.get('tab') as TabKey) || 'overview';
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [tripConfig, setTripConfig] = useState<TripConfigData | undefined>(initialConfig);

  const [stats, setStats] = useState<OperationalStats | null>(null);
  const [buses, setBuses] = useState<BusMetric[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam === 'overview' || tabParam === 'fleet' || tabParam === 'config' || tabParam === 'manifest') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch live operational stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const res = await fetch(`/api/admin/dashboard/stats?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.stats) {
          setStats(data.stats);
          if (data.buses) setBuses(data.buses);
        }
      } else {
        setStatsError('Could not refresh stats');
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setStatsError('Network error connecting to stats service');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Periodic fresh config check with cache-busting
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/trip-config?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.config) setTripConfig(data.config);
        }
      } catch {
        // Fallback to initial
      }
    };

    fetchLatest();
  }, []);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: string }[] = [
    { key: 'overview', label: 'Operations Desk', icon: LayoutDashboard, badge: 'Realtime' },
    {
      key: 'fleet',
      label: 'Fleet & Seat Matrix',
      icon: Bus,
      badge: '4 Coaches',
    },
    {
      key: 'config',
      label: 'Trip & Pricing Config',
      icon: Sliders,
      badge: 'Live Parameters',
    },
    {
      key: 'manifest',
      label: 'Passenger Manifest',
      icon: Users,
      badge: 'Gate & CSV',
    },
  ];

  const totalCap = stats?.capacity ?? tripConfig?.totalCapacity ?? 75;
  const confirmedPax = stats?.confirmedTravellers ?? 0;
  const occupancyPercent = totalCap > 0 ? Math.min(100, Math.round((confirmedPax / totalCap) * 100)) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* OPERATIONS HEADER BANNER (DYNAMIC SSOT CAPACITY)        */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
              TRIP COORDINATOR CONTROL ROOM
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-semibold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-tight mt-1">
            Operational Dashboard
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Himalayan Escape • Manali × Kasol ({totalCap} Capacity • {stats?.availableCapacity ?? (totalCap - confirmedPax)} Seats Left)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loadingStats}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-white/10 text-xs font-bold text-stone-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
          <Link
            href="/admin/scanner"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24483b] hover:bg-[#2d5a49] text-white border border-[#355b4d] text-xs font-bold transition"
          >
            <QrCode className="w-3.5 h-3.5 text-[#d8e3dc]" />
            <span>Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ALPINE TABBED NAVIGATION SWITCHER                        */}
      {/* ======================================================== */}
      <div className="flex items-center p-1.5 rounded-2xl backdrop-blur-md bg-stone-900/80 border border-white/10 shadow-lg overflow-x-auto gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 min-w-[132px] sm:min-w-0 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer sm:gap-2.5 sm:px-4 sm:text-xs ${
                isActive
                  ? 'bg-[#24483b] text-white border border-[#355b4d] shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#d3e3d8]' : 'text-stone-500'
                }`}
              />
              <span className="truncate">{tab.label}</span>
              {tab.badge && (
                <span
                  className={`hidden sm:inline-block text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-white/10 text-[#e0ece4] border border-white/10'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* ACTIVE TAB RENDERER                                      */}
      {/* ======================================================== */}
      <div className="transition-all duration-200">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {statsError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{statsError}. Displaying cached parameters.</span>
                </div>
                <button onClick={fetchStats} className="underline font-bold">Retry</button>
              </div>
            )}

            {/* PRIMARY 4 HIGHLIGHT METRICS */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Capacity & Travellers */}
              <article className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#183c31]/60 to-stone-900/90 p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400">
                    Expedition Capacity
                  </span>
                  <Users className="w-4 h-4 text-emerald-400/80" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{confirmedPax}</span>
                  <span className="text-sm font-semibold text-stone-400">/ {totalCap} pax</span>
                </div>
                <div className="mt-3 w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400">
                  <span>{stats?.availableCapacity ?? (totalCap - confirmedPax)} Available</span>
                  <span className="font-semibold text-emerald-400">{occupancyPercent}% Booked</span>
                </div>
              </article>

              {/* Card 2: Deposits Collected */}
              <article className="rounded-2xl border border-white/10 bg-gradient-to-b from-stone-900/90 to-stone-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#e0a87a]">
                    Total Deposits Collected
                  </span>
                  <CreditCard className="w-4 h-4 text-[#e0a87a]/80" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-white">
                    ₹{(stats?.totalDepositsCollected ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-stone-400">
                  Total Trip Revenue Value: <strong className="text-stone-200">₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}</strong>
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold">
                  Verified Collections
                </div>
              </article>

              {/* Card 3: Outstanding Balances */}
              <article className="rounded-2xl border border-white/10 bg-gradient-to-b from-stone-900/90 to-stone-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400">
                    Outstanding Balances
                  </span>
                  <Clock className="w-4 h-4 text-amber-400/80" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-amber-400">
                    ₹{(stats?.outstandingBalances ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-stone-400">
                  Fully Paid Travellers: <strong className="text-emerald-400">{stats?.fullyPaidTravellers ?? 0} pax</strong>
                </p>
                <span className="mt-2 inline-block text-[10px] text-stone-500">
                  Payable Before Boarding
                </span>
              </article>

              {/* Card 4: Gate Check-in Count */}
              <article className="rounded-2xl border border-white/10 bg-gradient-to-b from-stone-900/90 to-stone-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-400">
                    Gate Check-In Progress
                  </span>
                  <UserCheck className="w-4 h-4 text-sky-400/80" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{stats?.checkInCount ?? 0}</span>
                  <span className="text-sm font-semibold text-stone-400">boarded</span>
                </div>
                <p className="mt-2 text-[11px] text-stone-400">
                  Remaining at Gate: <strong className="text-sky-300">{stats?.remainingToCheckIn ?? 0} travellers</strong>
                </p>
                <Link
                  href="/admin/scanner"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-bold"
                >
                  Open QR Scanner <ArrowRight className="w-3 h-3" />
                </Link>
              </article>
            </section>

            {/* DETAILED OPERATIONAL METRICS BREAKDOWN (Section 1 requirement) */}
            <section className="rounded-2xl border border-white/10 bg-stone-900/70 p-5">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-200">
                    Booking & Payment Roster Breakdown
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Real-time transaction and registration counts derived strictly from the database.
                  </p>
                </div>
                <BarChart3 className="w-4 h-4 text-stone-500" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-stone-950/60 border border-white/5">
                  <span className="text-[10px] font-bold uppercase text-stone-500 block">Total Bookings</span>
                  <span className="text-lg font-black text-white mt-1 block">{stats?.totalBookings ?? 0}</span>
                  <span className="text-[10px] text-stone-500">All registered records</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">Confirmed</span>
                  <span className="text-lg font-black text-emerald-300 mt-1 block">{stats?.confirmedBookings ?? 0}</span>
                  <span className="text-[10px] text-emerald-500/80">Active reservations</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">Pending Bookings</span>
                  <span className="text-lg font-black text-amber-300 mt-1 block">{stats?.pendingBookings ?? 0}</span>
                  <span className="text-[10px] text-amber-500/80">Awaiting payment</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
                  <span className="text-[10px] font-bold uppercase text-rose-400 block">Cancelled</span>
                  <span className="text-lg font-black text-rose-300 mt-1 block">{stats?.cancelledBookings ?? 0}</span>
                  <span className="text-[10px] text-rose-500/80">Seats released</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-950/60 border border-white/5">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">Reserved Seats</span>
                  <span className="text-lg font-black text-sky-300 mt-1 block">{stats?.reservedSeats ?? 0}</span>
                  <span className="text-[10px] text-stone-500">Seat assignments</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-950/60 border border-white/5">
                  <span className="text-[10px] font-bold uppercase text-rose-400 block">Failed Payments</span>
                  <span className="text-lg font-black text-rose-400 mt-1 block">{stats?.failedPayments ?? 0}</span>
                  <span className="text-[10px] text-stone-500">Gateway dropped</span>
                </div>
              </div>
            </section>

            {/* COACH FLEET STATUS BREAKDOWN */}
            <section className="rounded-2xl border border-white/10 bg-stone-900/70 p-5">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-200">
                    Coach Fleet Occupancy Matrix
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Live seat distribution across 4 expedition coaches.
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('fleet')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  View Full Seat Map <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {buses.length > 0 ? (
                  buses.map((bus) => {
                    const totalSeats = bus.passengerCapacity || 23;
                    const pct = Math.min(100, Math.round((bus.booked / totalSeats) * 100));
                    return (
                      <div
                        key={bus.id}
                        className="rounded-xl border border-white/10 bg-stone-950/60 p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{bus.busNumber}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-stone-300">
                            {bus.vehicleNumber || 'Coach'}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 truncate">
                          {bus.vehicleName}
                        </div>
                        <div className="flex items-baseline justify-between text-xs pt-1">
                          <span className="font-bold text-stone-200">
                            {bus.booked} / {totalSeats} Booked
                          </span>
                          <span className="text-[11px] text-emerald-400 font-semibold">{bus.available} Left</span>
                        </div>
                        <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  [1, 2, 3, 4].map((num) => (
                    <div
                      key={num}
                      className="rounded-xl border border-white/10 bg-stone-950/60 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">Bus 0{num}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-stone-300">
                          23 Seats
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">Luxury 2x2 AC Tourist Coach</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* QUICK ACTIONS & MODULE HUBS */}
            <section>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-stone-100">Quick Navigation</h2>
                  <p className="mt-1 text-xs text-stone-500">Jump straight into operational desks.</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Link
                  href="/admin/bookings"
                  className="group rounded-2xl border border-white/[0.08] bg-stone-900/65 p-5 transition hover:-translate-y-0.5 hover:border-[#648675]/50 hover:bg-stone-900"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24483b]/60 text-[#cde0d3]">
                    <Users className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 flex items-center justify-between text-sm font-semibold text-stone-100">
                    Bookings Desk
                    <ArrowRight className="h-4 w-4 text-stone-600 transition group-hover:translate-x-1 group-hover:text-[#cde0d3]" />
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-stone-500">
                    Search by ID, filter by payment or status, and inspect passenger rosters.
                  </p>
                </Link>

                <Link
                  href="/admin/payments"
                  className="group rounded-2xl border border-white/[0.08] bg-stone-900/65 p-5 transition hover:-translate-y-0.5 hover:border-[#648675]/50 hover:bg-stone-900"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24483b]/60 text-[#cde0d3]">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 flex items-center justify-between text-sm font-semibold text-stone-100">
                    Payment Ledger
                    <ArrowRight className="h-4 w-4 text-stone-600 transition group-hover:translate-x-1 group-hover:text-[#cde0d3]" />
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-stone-500">
                    Review Razorpay orders, record manual cash/UPI settlements, and audit transactions.
                  </p>
                </Link>

                <Link
                  href="/admin/scanner"
                  className="group rounded-2xl border border-white/[0.08] bg-stone-900/65 p-5 transition hover:-translate-y-0.5 hover:border-[#648675]/50 hover:bg-stone-900"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24483b]/60 text-[#cde0d3]">
                    <QrCode className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 flex items-center justify-between text-sm font-semibold text-stone-100">
                    Gate QR Scanner
                    <ArrowRight className="h-4 w-4 text-stone-600 transition group-hover:translate-x-1 group-hover:text-[#cde0d3]" />
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-stone-500">
                    Fast mobile camera barcode scanner and manual booking lookup for boarding gate.
                  </p>
                </Link>

                <Link
                  href="/admin/travellers"
                  className="group rounded-2xl border border-white/[0.08] bg-stone-900/65 p-5 transition hover:-translate-y-0.5 hover:border-[#648675]/50 hover:bg-stone-900"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24483b]/60 text-[#cde0d3]">
                    <FileSpreadsheet className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 flex items-center justify-between text-sm font-semibold text-stone-100">
                    Manifest & Export
                    <ArrowRight className="h-4 w-4 text-stone-600 transition group-hover:translate-x-1 group-hover:text-[#cde0d3]" />
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-stone-500">
                    Coach passenger lists, emergency contacts, gate boarding records, and CSV export.
                  </p>
                </Link>
              </div>
            </section>
          </div>
        )}
        {activeTab === 'fleet' && <FleetSeatMatrixTab />}
        {activeTab === 'config' && <TripPricingConfigTab />}
        {activeTab === 'manifest' && <PassengerManifestTab />}
      </div>
    </div>
  );
}
