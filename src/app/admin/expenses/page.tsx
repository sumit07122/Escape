'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Plus, RefreshCw, X, TrendingDown, DollarSign } from 'lucide-react';

const CATEGORIES = [
  'Transport', 'Hotels', 'Food', 'Activities', 'Staff',
  'Marketing', 'Emergency', 'Miscellaneous', 'Other'
];

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [category, setCategory] = useState('Transport');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [receiptRef, setReceiptRef] = useState('');
  const [description, setDescription] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        setCategoryTotals(data.categoryTotals || {});
        setTotalExpense(data.totalExpense || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          amount: Number(amount),
          vendor,
          receiptRef,
          description,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setTitle('');
        setAmount('');
        setVendor('');
        setReceiptRef('');
        setDescription('');
        await fetchExpenses();
      } else {
        alert('Failed to record expense');
      }
    } catch {
      alert('Error recording expense');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            OPERATIONAL LEDGER
          </span>
          <h1 className="text-3xl font-black text-white">Expense Management</h1>
          <p className="text-xs text-zinc-400">
            Total recorded disbursements: <strong className="text-rose-400">₹{totalExpense.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg glow-orange"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>

          <button
            onClick={fetchExpenses}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Category Totals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
            <span className="text-[11px] text-zinc-500 uppercase font-bold">{cat}</span>
            <div className="text-base font-black text-white">
              ₹{(categoryTotals[cat] || 0).toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Expense Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Vendor & Receipt</th>
                <th className="p-4">Recorded By</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No expense items logged yet.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold text-white text-sm">
                      {e.title}
                      {e.description && (
                        <span className="block text-[11px] text-zinc-500 font-normal">{e.description}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px] uppercase">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-4 font-black text-rose-400 text-sm">
                      ₹{e.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-zinc-300">
                      <div>{e.vendor || 'N/A'}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{e.receiptRef}</div>
                    </td>
                    <td className="p-4 text-zinc-400">{e.recordedBy || 'Admin'}</td>
                    <td className="p-4 text-zinc-400 text-[11px]">{new Date(e.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-3xl border border-zinc-700 max-w-md w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">Log Trip Expense</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 text-zinc-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bus Diesel Refuel Karnal Stop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Amount (INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1 font-bold">Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HPCL Petrol Pump"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1 font-bold">Receipt / Voucher #</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-8921"
                    value={receiptRef}
                    onChange={(e) => setReceiptRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional context"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg mt-3">
                Save Expense Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
