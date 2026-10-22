'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalCollected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            PAYMENT LEDGER
          </span>
          <h1 className="text-3xl font-black text-white">Payment Transactions</h1>
          <p className="text-xs text-zinc-400">
            Total verified collections: <strong className="text-emerald-400">₹{totalCollected.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <button
          onClick={fetchPayments}
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
                <th className="p-4">Payment ID / Order ID</th>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">No payment records found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono">
                      <div className="font-bold text-white">{p.razorpayPaymentId || 'Pending'}</div>
                      <div className="text-[11px] text-zinc-500">{p.razorpayOrderId}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      #{p.booking?.bookingId}
                      <span className="block text-[11px] font-normal text-zinc-400">{p.booking?.primaryTravellerName}</span>
                    </td>
                    <td className="p-4 font-bold text-white text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px] uppercase">
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        p.status === 'PAID' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 text-[11px]">
                      {new Date(p.createdAt).toLocaleString()}
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
