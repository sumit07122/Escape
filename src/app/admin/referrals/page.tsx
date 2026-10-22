'use client';

import React, { useState, useEffect } from 'react';
import { Share2, RefreshCw, Sparkles, Award } from 'lucide-react';

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            VIRAL GROWTH ENGINE
          </span>
          <h1 className="text-3xl font-black text-white">Referral System Analytics</h1>
          <p className="text-xs text-zinc-400">
            5% discount per successful referral (max 10%). Only counts after referred booking pays reservation.
          </p>
        </div>

        <button
          onClick={fetchReferrals}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Referral Code</th>
                <th className="p-4">Owner Name</th>
                <th className="p-4">Mobile & Email</th>
                <th className="p-4">Successful Referrals</th>
                <th className="p-4">Discount Offered</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">No referral codes found.</td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-black text-amber-400 text-sm">
                      {r.code}
                    </td>
                    <td className="p-4 font-bold text-white">{r.ownerName}</td>
                    <td className="p-4 text-zinc-400">
                      <div>{r.ownerPhone}</div>
                      <div className="text-[11px] text-zinc-500">{r.ownerEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-black text-xs">
                        {r.successfulReferrals} Bookings
                      </span>
                    </td>
                    <td className="p-4 font-bold text-zinc-200">
                      {r.discountPercentage}% per referral (Max 10%)
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400">
                        {r.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
