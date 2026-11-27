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
  Copy,
  Check,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Sparkles
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
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

  // KPI Calculations
  const paidPayments = payments.filter((p) => p.status === 'PAID');
  const totalCollected = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const upiPayments = paidPayments.filter(
    (p) =>
      p.razorpayOrderId?.startsWith('UPI-') ||
      p.razorpaySignature?.includes('UPI') ||
      /^\d{12}$/.test(p.razorpayPaymentId || '') ||
      p.razorpayPaymentId?.includes('_UPI_')
  );
  const upiCollected = upiPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const manualPayments = paidPayments.filter(
    (p) => p.razorpayPaymentId?.startsWith('MANUAL_') && p.razorpayPaymentId?.includes('_CASH_')
  );
  const manualCollected = manualPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* Header — Editorial Alpine Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-[#D87945] tracking-widest uppercase">
              Financial Audit & Settlement
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            Payment Transactions Ledger
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Real-time reconciliation of zero-commission direct UPI payments, gateway orders, and on-site desk collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-200" />
            <span>Record Desk Payment</span>
          </button>

          <button
            onClick={fetchPayments}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-xs font-bold text-stone-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Verified Revenue */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Total Verified Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
              ₹{totalCollected.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{paidPayments.length} transactions fully settled</span>
          </p>
        </div>

        {/* Direct UPI Collections */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Direct UPI Collections
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
              ₹{upiCollected.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-cyan-300 mt-1 font-medium">
            {upiPayments.length} payments • 0% MDR direct account
          </p>
        </div>

        {/* Desk Cash Collections */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Desk Cash Collections
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
              ₹{manualCollected.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-amber-300 mt-1 font-medium">
            {manualPayments.length} cash settlements at campus counter
          </p>
        </div>

        {/* Awaiting Settlement */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
              ₹{pendingAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 font-medium">
            {pendingPayments.length} orders awaiting UTR confirmation
          </p>
        </div>

      </div>

      {/* Notifications / Toast */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Booking ID, student name, 12-digit UTR, phone, or order reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-white/10 text-white text-xs placeholder-stone-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-white text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="PAID">Paid / Verified (Confirmed)</option>
          <option value="PENDING">Pending Verification</option>
          <option value="FAILED">Failed / Expired</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/10 text-stone-200 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
        >
          <option value="ALL">All Payment Modes</option>
          <option value="UPI">Direct UPI Gateway & Desk</option>
          <option value="CASH">Desk Cash Counter</option>
          <option value="ONLINE">Razorpay Online Gateway</option>
        </select>
      </div>

      {/* Transactions Table — Fintech Grade */}
      <div className="rounded-2xl border border-white/10 bg-stone-900/60 overflow-hidden shadow-2xl backdrop-blur-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/90 border-b border-white/10 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Payment ID / UTR</th>
                <th className="p-4">Booking Reference</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method & Channel</th>
                <th className="p-4">Status</th>
                <th className="p-4">Audit Trail / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FileText className="w-8 h-8 text-stone-600 mx-auto" />
                      <p className="font-medium">
                        {loading ? 'Querying payment ledger...' : 'No transactions found matching your search or filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isManual = p.razorpayPaymentId?.startsWith('MANUAL_');
                  const isUpi =
                    p.razorpayOrderId?.startsWith('UPI-') ||
                    p.razorpaySignature?.includes('UPI') ||
                    /^\d{12}$/.test(p.razorpayPaymentId || '');
                  
                  let payloadData: any = null;
                  if (p.payload) {
                    try {
                      payloadData = JSON.parse(p.payload);
                    } catch {}
                  }

                  const is12DigitUtr = /^\d{12}$/.test(p.razorpayPaymentId || '');

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.03] transition-colors group">
                      
                      {/* Payment ID / UTR Reference */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {is12DigitUtr ? (
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md text-xs">
                                UTR: {p.razorpayPaymentId}
                              </span>
                              <button
                                onClick={() => copyToClipboard(p.razorpayPaymentId, p.id)}
                                className="text-stone-500 hover:text-white transition-colors cursor-pointer p-0.5"
                                title="Copy UTR"
                              >
                                {copiedId === p.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono font-bold text-stone-200">
                              {p.razorpayPaymentId || 'Pending Gateway Reference'}
                            </span>
                          )}

                          {isManual && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-sans font-bold text-[9px] uppercase tracking-wider">
                              Desk
                            </span>
                          )}

                          {isUpi && !isManual && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-sans font-bold text-[9px] uppercase tracking-wider">
                              Direct UPI
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-stone-500 font-mono mt-1 truncate max-w-[220px]">
                          Order: {p.razorpayOrderId}
                        </div>
                      </td>

                      {/* Booking Reference */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-emerald-400 text-xs">
                          #{p.booking?.bookingId}
                        </div>
                        <span className="block text-[11px] font-sans font-semibold text-stone-200 mt-0.5">
                          {p.booking?.primaryTravellerName}
                        </span>
                        {p.booking?.primaryPhone && (
                          <span className="block text-[10px] text-stone-500 font-mono">
                            {p.booking?.primaryPhone}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-white text-sm tabular-nums">
                          ₹{(p.amount || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] text-stone-500 font-mono uppercase">
                          {p.currency || 'INR'}
                        </span>
                      </td>

                      {/* Method & Channel */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {isManual ? (
                            p.razorpayPaymentId?.includes('_UPI_') ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-bold">
                                <Smartphone className="w-3.5 h-3.5" /> Desk UPI
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                                <Banknote className="w-3.5 h-3.5" /> Desk Cash
                              </span>
                            )
                          ) : isUpi ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                              <Smartphone className="w-3.5 h-3.5" /> UPI Gateway
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-bold">
                              <CreditCard className="w-3.5 h-3.5" /> Razorpay
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-stone-500 font-mono mt-0.5 uppercase">
                          {p.paymentType}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            p.status === 'PAID'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-xs'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-xs'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'PAID' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {p.status}
                        </span>
                      </td>

                      {/* Audit Trail / Recorded By */}
                      <td className="p-4 text-stone-400 text-[11px]">
                        <div className="font-mono text-stone-300">{new Date(p.createdAt).toLocaleString()}</div>
                        {payloadData?.recordedBy && (
                          <div className="text-[10px] text-stone-500 truncate max-w-[200px] mt-0.5">
                            {payloadData.recordedBy}
                          </div>
                        )}
                        {payloadData?.notes && (
                          <div className="text-[10px] text-amber-300/80 italic truncate max-w-[200px] mt-0.5">
                            &ldquo;{payloadData.notes}&rdquo;
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

      {/* Manual Payment Recording Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 rounded-3xl border border-stone-800 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] text-[#D87945] font-extrabold uppercase tracking-widest block">
                  Coordinator Desk Action
                </span>
                <h2 className="font-serif text-xl font-black text-white mt-0.5">Record Manual Settlement</h2>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white transition-colors cursor-pointer"
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
                  placeholder="e.g. 5199"
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
                      className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition text-center cursor-pointer ${
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
                  placeholder="e.g. Paid balance at campus bus gate before departure"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition disabled:opacity-50 cursor-pointer"
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
