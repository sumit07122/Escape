'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  Filter,
  DollarSign,
  X,
  AlertCircle,
  FileText,
  Banknote,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Manual Payment Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualBookingId, setManualBookingId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualMethod, setManualMethod] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER'>('CASH');
  const [manualUtr, setManualUtr] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRecordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBookingId.trim()) {
      showToast('error', 'Booking ID is required');
      return;
    }
    const amt = Number(manualAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('error', 'Enter a valid payment amount');
      return;
    }

    setSubmittingManual(true);
    try {
      const res = await fetch('/api/admin/payments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: manualBookingId.trim(),
          amount: amt,
          paymentMethod: manualMethod,
          utr: manualMethod === 'UPI' && manualUtr.trim() ? manualUtr.trim() : undefined,
          notes: manualNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Payment recorded successfully');
        setShowManualModal(false);
        setManualBookingId('');
        setManualAmount('');
        setManualUtr('');
        setManualNotes('');
        await fetchPayments();
      } else {
        showToast('error', data.error || 'Failed to record payment');
      }
    } catch (err) {
      console.error('Error recording manual payment:', err);
      showToast('error', 'Network error recording payment');
    } finally {
      setSubmittingManual(false);
    }
  };

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    // Status filter
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

    // Method filter
    const isManual = p.razorpayPaymentId?.startsWith('MANUAL_');
    const isUpi =
      p.razorpayOrderId?.startsWith('UPI-') ||
      p.razorpaySignature?.includes('UPI') ||
      /^\d{12}$/.test(p.razorpayPaymentId || '') ||
      p.razorpayPaymentId?.includes('_UPI_');
    const isCash = isManual && p.razorpayPaymentId?.includes('_CASH_');
    const isOnline = !isManual && !isUpi;

    if (methodFilter === 'CASH' && !isCash) return false;
    if (methodFilter === 'UPI' && !isUpi) return false;
    if (methodFilter === 'ONLINE' && !isOnline) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const bookingId = p.booking?.bookingId?.toLowerCase() || '';
      const name = p.booking?.primaryTravellerName?.toLowerCase() || '';
      const paymentId = p.razorpayPaymentId?.toLowerCase() || '';
      const orderId = p.razorpayOrderId?.toLowerCase() || '';
      const phone = p.booking?.primaryPhone?.toLowerCase() || '';
      return (
        bookingId.includes(q) ||
        name.includes(q) ||
        paymentId.includes(q) ||
        orderId.includes(q) ||
        phone.includes(q)
      );
    }

    return true;
  });

  const totalCollected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const manualCollected = payments
    .filter((p) => p.status === 'PAID' && p.razorpayPaymentId?.startsWith('MANUAL_'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
            FINANCIAL AUDIT TRAIL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Payment Transactions Ledger</h1>
          <p className="text-xs text-stone-400">
            Total Collections: <strong className="text-emerald-400">₹{totalCollected.toLocaleString('en-IN')}</strong>
            {' • '}
            Desk Manual Collections: <strong className="text-amber-400">₹{manualCollected.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-md"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Manual Payment</span>
          </button>

          <button
            onClick={fetchPayments}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs font-bold text-stone-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Booking ID, student name, Razorpay payment ID or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-white/10 text-white text-xs placeholder-stone-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PAID">Paid / Verified</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none"
        >
          <option value="ALL">All Methods</option>
          <option value="ONLINE">Razorpay Online</option>
          <option value="CASH">Desk Cash</option>
          <option value="UPI">Direct UPI</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-white/10 bg-stone-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 border-b border-white/10 text-stone-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Payment ID / Order</th>
                <th className="p-4">Booking Reference</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method & Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Recorded By / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    {loading ? 'Loading payment records...' : 'No payment records found matching filters.'}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isManual = p.razorpayPaymentId?.startsWith('MANUAL_');
                  const isUpi = p.razorpayOrderId?.startsWith('UPI-') || p.razorpaySignature?.includes('UPI') || /^\d{12}$/.test(p.razorpayPaymentId || '');
                  let payloadData: any = null;
                  if (p.payload) {
                    try {
                      payloadData = JSON.parse(p.payload);
                    } catch {}
                  }

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">
                            {p.razorpayPaymentId ? (
                              /^\d{12}$/.test(p.razorpayPaymentId) ? (
                                <span className="text-emerald-300 font-mono">UTR: {p.razorpayPaymentId}</span>
                              ) : p.razorpayPaymentId
                            ) : (
                              'Pending Gateway ID'
                            )}
                          </span>
                          {isManual && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-sans font-bold text-[9px] uppercase">
                              Manual
                            </span>
                          )}
                          {isUpi && !isManual && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-sans font-bold text-[9px] uppercase">
                              Direct UPI
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate max-w-[200px]">
                          {p.razorpayOrderId}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400">
                        #{p.booking?.bookingId}
                        <span className="block text-[11px] font-sans font-normal text-stone-300">
                          {p.booking?.primaryTravellerName}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white text-sm">
                        ₹{(p.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {isManual ? (
                            p.razorpayPaymentId?.includes('_UPI_') ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                                <Smartphone className="w-3 h-3" /> UPI Desk
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                                <Banknote className="w-3 h-3" /> Cash Desk
                              </span>
                            )
                          ) : isUpi ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                              <Smartphone className="w-3 h-3" /> UPI Gateway
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-stone-300 font-semibold">
                              <CreditCard className="w-3 h-3" /> Razorpay
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-stone-500 font-mono mt-0.5 uppercase">
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            p.status === 'PAID'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-stone-400 text-[11px]">
                        <div>{new Date(p.createdAt).toLocaleString()}</div>
                        {payloadData?.recordedBy && (
                          <div className="text-[10px] text-stone-500 truncate max-w-[180px]">
                            {payloadData.recordedBy}
                          </div>
                        )}
                        {payloadData?.notes && (
                          <div className="text-[10px] text-amber-400/80 italic truncate max-w-[180px]">
                            "{payloadData.notes}"
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Payment Recording Modal (Section 3 Requirement) */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 rounded-3xl border border-stone-800 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                  Coordinator Desk Action
                </span>
                <h2 className="text-xl font-black text-white">Record Manual Payment</h2>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordManualPayment} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Booking Reference ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GHE-123456 or cuid"
                  value={manualBookingId}
                  onChange={(e) => setManualBookingId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 5200"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Payment Collection Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'UPI', 'BANK_TRANSFER'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setManualMethod(method)}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition text-center ${
                        manualMethod === method
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                          : 'bg-stone-900 text-stone-400 border-white/5 hover:text-white'
                      }`}
                    >
                      {method === 'CASH' ? 'Cash' : method === 'UPI' ? 'Direct UPI' : 'Bank Transfer'}
                    </button>
                  ))}
                </div>
              </div>

              {manualMethod === 'UPI' && (
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    12-Digit UPI Ref / UTR Number (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="e.g. 432109876543"
                    value={manualUtr}
                    onChange={(e) => setManualUtr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Coordinator Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Paid at campus gate counter to Rajesh"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition disabled:opacity-50"
                >
                  {submittingManual ? 'Recording...' : 'Confirm & Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
