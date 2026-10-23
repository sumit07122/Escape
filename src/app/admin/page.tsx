'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, CreditCard, Bus, QrCode, TrendingUp, AlertCircle,
  CheckCircle2, RefreshCw, ArrowRight, ShieldCheck, UserCheck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats;
  const buses = data?.buses || [];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            REAL-TIME OPERATIONS
          </span>
          <h1 className="text-3xl font-black text-white">Expedition Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Himalayan Escape • Manali × Kasol (75 Capacity)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>

          <Link
            href="/admin/scanner"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg glow-emerald"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Scanner Desk</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Capacity & Available */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-semibold">Total Trip Capacity</span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats?.capacity || 75} <span className="text-xs font-normal text-zinc-400">Seats</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{stats?.availableCapacity || 75} seats available</span>
          </div>
        </div>

        {/* Confirmed Travellers */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-semibold">Confirmed Travellers</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {stats?.confirmedTravellers || 0}
          </div>
          <p className="text-xs text-zinc-400 pt-1">
            Across {stats?.confirmedBookings || 0} bookings ({stats?.pendingBookings || 0} pending)
          </p>
        </div>

        {/* Reservation Collected */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-semibold">Reservation Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₹{(stats?.reservationRevenue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-orange-400 pt-1 font-semibold">
            ₹1,000 deposits received
          </p>
        </div>

        {/* Checked-In Travellers */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-semibold">Checked-In (QR Gate)</span>
          <div className="text-2xl sm:text-3xl font-black text-sky-400">
            {stats?.checkedInTravellers || 0} <span className="text-xs font-normal text-zinc-400">/ {stats?.confirmedTravellers || 0}</span>
          </div>
          <p className="text-xs text-zinc-400 pt-1">Boarded at Departure Gate</p>
        </div>
      </div>

      {/* Secondary Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Total Booking Value</span>
          <div className="text-xl font-black text-white">
            ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500">Gross contract revenue</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Outstanding Balances</span>
          <div className="text-xl font-black text-amber-400">
            ₹{(stats?.remainingBalances || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500">Collectable before departure</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Currently Held</span>
          <div className="text-xl font-black text-amber-400">
            {stats?.heldSeats || 0} Seats
          </div>
          <p className="text-[11px] text-zinc-500">10-minute active holds</p>
        </div>
      </div>

      {/* Coach Fleet Live Status */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Coach Fleet Status</h2>
            <p className="text-xs text-zinc-400">Real-time seat allocation across the 4 luxury 2x2 tourist coaches.</p>
          </div>
          <Link
            href="/admin/buses"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Manage Buses & Seats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {buses.map((bus: any) => (
            <div
              key={bus.id}
              className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-base">{bus.busNumber}</span>
                <span className="text-xs font-bold text-emerald-400">
                  {bus.booked}/{bus.passengerCapacity} Booked
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full"
                  style={{
                    width: `${Math.round((bus.booked / (bus.passengerCapacity || 23)) * 100)}%`,
                  }}
                />
              </div>

              <div className="text-[11px] text-zinc-400 space-y-0.5 pt-1">
                <p>Driver: <strong className="text-zinc-200">{bus.driverName}</strong></p>
                <p>Available: <strong className="text-emerald-400">{bus.available} seats</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/bookings"
          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-center space-y-2 transition-all block"
        >
          <Users className="w-5 h-5 text-emerald-400 mx-auto" />
          <span className="text-xs font-bold text-white block">View Bookings</span>
        </Link>
        <Link
          href="/admin/buses"
          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-center space-y-2 transition-all block"
        >
          <Bus className="w-5 h-5 text-sky-400 mx-auto" />
          <span className="text-xs font-bold text-white block">Seat Map & Overrides</span>
        </Link>
        <Link
          href="/admin/expenses"
          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-center space-y-2 transition-all block"
        >
          <CreditCard className="w-5 h-5 text-orange-400 mx-auto" />
          <span className="text-xs font-bold text-white block">Log Expenses</span>
        </Link>
        <Link
          href="/admin/reports"
          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-center space-y-2 transition-all block"
        >
          <TrendingUp className="w-5 h-5 text-amber-400 mx-auto" />
          <span className="text-xs font-bold text-white block">P&L & Reports</span>
        </Link>
      </div>
    </div>
  );
}
