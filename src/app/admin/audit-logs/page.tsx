'use client';

import React, { useState, useEffect } from 'react';
import { History, RefreshCw, ShieldAlert, Clock, User } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            SECURITY & AUDIT LOGS
          </span>
          <h1 className="text-3xl font-black text-white">System Audit Trail</h1>
          <p className="text-xs text-zinc-400">
            Immutable chronological record of seat holds, admin seat overrides, payments, and check-ins.
          </p>
        </div>

        <button
          onClick={fetchLogs}
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
                <th className="p-4">Action</th>
                <th className="p-4">Entity Type</th>
                <th className="p-4">Performed By</th>
                <th className="p-4">Seat / Coach Ref</th>
                <th className="p-4">Value / Details</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-sans">No audit events recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">{log.entityType}</td>
                    <td className="p-4 text-zinc-300">{log.performedBy}</td>
                    <td className="p-4 text-sky-400 font-bold">
                      {log.seatNumber ? `Seat ${log.seatNumber}` : log.bookingId ? `#${log.bookingId}` : '-'}
                    </td>
                    <td className="p-4 text-zinc-400 max-w-xs truncate font-sans text-[11px]">
                      {log.newValue || log.oldValue || '-'}
                    </td>
                    <td className="p-4 text-zinc-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
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
