'use client';

import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Award, Ticket } from 'lucide-react';

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groupBookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            GROUP DEALS AUDIT
          </span>
          <h1 className="text-3xl font-black text-white">5 + 1 Group Bookings</h1>
          <p className="text-xs text-zinc-400">
            For every 5 paid travellers, 1 free traveller is accommodated. Free traveller occupies a physical bus seat.
          </p>
        </div>

        <button
          onClick={fetchGroups}
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
                <th className="p-4">Group / Squad Name</th>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Paid Travellers</th>
                <th className="p-4">Free Travellers</th>
                <th className="p-4">Physical Seats Occupied</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No 5+1 group bookings recorded yet.
                  </td>
                </tr>
              ) : (
                groups.map((g) => (
                  <tr key={g.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white text-sm">
                      {g.groupName || 'GLA Squad'}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      #{g.booking?.bookingId}
                    </td>
                    <td className="p-4 font-bold text-zinc-200">
                      {g.paidTravellers} Paid
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold text-[11px]">
                        {g.freeTravellers} Free Seat
                      </span>
                    </td>
                    <td className="p-4 font-black text-sky-400 text-sm">
                      {g.totalSeatsOccupied} Seats
                    </td>
                    <td className="p-4 text-zinc-400 text-[11px]">
                      {new Date(g.createdAt).toLocaleDateString()}
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
