'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, TrendingUp, TrendingDown,
  DollarSign, RefreshCw, Printer
} from 'lucide-react';

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const summary = data?.summary;
  const isProfitable = (summary?.netProfitOrLoss || 0) >= 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            FINANCIAL INTELLIGENCE
          </span>
          <h1 className="text-3xl font-black text-white">Reports & Profit / Loss</h1>
          <p className="text-xs text-zinc-400">
            Consolidated expedition ledger, occupancy breakdowns and net operational margins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* P&L Master Summary Card */}
      <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          Executive Profit & Loss Statement
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-semibold">Total Expedition Revenue</span>
            <div className="text-2xl font-black text-white">
              ₹{(summary?.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-zinc-500">From {summary?.confirmedBookingsCount || 0} confirmed bookings</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-semibold">Collected Deposits</span>
            <div className="text-2xl font-black text-emerald-400">
              ₹{(summary?.reservationCollected || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-zinc-500">₹1,000 reservations verified</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-semibold">Total Expenses Incurred</span>
            <div className="text-2xl font-black text-rose-400">
              ₹{(summary?.totalExpenses || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-zinc-500">Transport, hotels, meals & staff</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-500 font-semibold">Estimated Net Operating Margin</span>
            <div className={`text-2xl font-black flex items-center gap-1.5 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfitable ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>₹{(summary?.netProfitOrLoss || 0).toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-zinc-500">{isProfitable ? 'Net Surplus' : 'Deficit / Pre-collection'}</p>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receivables & Discounts */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-800 space-y-4 text-xs">
          <h3 className="font-bold text-white uppercase tracking-wider text-sm border-b border-zinc-800 pb-2">
            Receivables & Discounts Summary
          </h3>
          <div className="flex justify-between py-2 border-b border-zinc-900">
            <span className="text-zinc-400">Outstanding Traveller Balances:</span>
            <span className="font-bold text-amber-400">₹{(summary?.remainingReceivable || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-900">
            <span className="text-zinc-400">Total Referral & Group Discounts Awarded:</span>
            <span className="font-bold text-emerald-400">₹{(summary?.totalDiscounts || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-zinc-400">Total Registered Travellers:</span>
            <span className="font-bold text-white">{summary?.totalTravellers || 0} Travellers</span>
          </div>
        </div>

        {/* Boarding Gate Status */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-800 space-y-4 text-xs">
          <h3 className="font-bold text-white uppercase tracking-wider text-sm border-b border-zinc-800 pb-2">
            Boarding Check-In Status
          </h3>
          <div className="flex justify-between py-2 border-b border-zinc-900">
            <span className="text-zinc-400">Checked In at GLA Gate:</span>
            <span className="font-bold text-emerald-400">{summary?.checkedInTravellers || 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-900">
            <span className="text-zinc-400">Awaiting Arrival:</span>
            <span className="font-bold text-zinc-300">
              {Math.max(0, (summary?.totalTravellers || 0) - (summary?.checkedInTravellers || 0))}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-zinc-400">Trip Departure Status:</span>
            <span className="font-bold text-orange-400 uppercase">On Schedule</span>
          </div>
        </div>
      </div>
    </div>
  );
}
