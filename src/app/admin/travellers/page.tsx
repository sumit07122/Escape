'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, CheckCircle2, Clock, Phone, Mail } from 'lucide-react';

export default function AdminTravellersPage() {
  const [travellers, setTravellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTravellers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setTravellers(data.travellers || []);
      }
    } catch (err) {
      console.error('Error fetching travellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravellers();
  }, []);

  const filtered = travellers.filter((t) =>
    t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    t.phone?.includes(search) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.assignedSeatNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            PASSENGER MANIFEST
          </span>
          <h1 className="text-3xl font-black text-white">Travellers Manifest</h1>
          <p className="text-xs text-zinc-400">Total {travellers.length} travellers registered across all coaches.</p>
        </div>

        <button
          onClick={fetchTravellers}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search traveller name, seat, mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none"
        />
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Traveller Name</th>
                <th className="p-4">Mobile & Email</th>
                <th className="p-4">Coach & Seat</th>
                <th className="p-4">Emergency Contact</th>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Check-In Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No travellers found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="font-bold text-white">{t.fullName}</div>
                      <div className="text-[11px] text-zinc-500">{t.gender}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-200">{t.phone}</div>
                      <div className="text-[11px] text-zinc-500">{t.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white block">
                        {t.booking?.bus?.busNumber || 'Bus 01'}
                      </span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono font-bold text-[11px]">
                        Seat {t.assignedSeatNumber || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300">
                      <div>{t.emergencyContactName || 'Guardian'}</div>
                      <div className="text-[11px] text-zinc-500">{t.emergencyContactPhone}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      #{t.booking?.bookingId}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        t.checkInStatus === 'CHECKED_IN' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {t.checkInStatus === 'CHECKED_IN' ? 'Checked In' : 'Not Boarded'}
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
