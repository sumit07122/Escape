'use client';

import React, { useState, useEffect } from 'react';
import {
  Save, RefreshCw, CheckCircle2, AlertCircle,
  CreditCard, MapPin, Calendar, Clock, Phone, AlertTriangle,
  Loader2, Tag, Trash2, Plus, Users, Sparkles, Check, X
} from 'lucide-react';
import { TripConfigData, DEFAULT_TRIP_CONFIG } from '@/lib/trip-config-shared';

interface CouponItem {
  id: string;
  code: string;
  discountAmount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export default function TripPricingConfigTab() {
  const [config, setConfig] = useState<TripConfigData>(DEFAULT_TRIP_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Coupon management state
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(200);
  const [newCouponMaxUses, setNewCouponMaxUses] = useState<number>(100);
  const [newCouponExpiry, setNewCouponExpiry] = useState('');
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/config?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (err) {
      console.error('Error fetching trip config:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await fetch(`/api/admin/coupons?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
        }
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchCoupons();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const standardPrice = Number(config.packagePrice) || 6500;
  const groupPrice = Number(config.groupPackagePrice) || 6200;
  const depositPrice = Number(config.depositPrice) || 1000;
  const soloGateBalance = Math.max(0, standardPrice - depositPrice);
  const squadGateBalance = Math.max(0, groupPrice - depositPrice);
  const squadSavings = Math.max(0, standardPrice - groupPrice);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          totalCapacity: Number(config.totalCapacity),
          packagePrice: Number(config.packagePrice),
          groupPackagePrice: Number(config.groupPackagePrice),
          groupSizeThreshold: Number(config.groupSizeThreshold),
          depositPrice: Number(config.depositPrice),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to update trip configuration');
      } else {
        showToast('success', 'Trip Configuration & Pricing Updated');
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch {
      showToast('error', 'Network error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    try {
      setCreatingCoupon(true);
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          discountAmount: Number(newCouponDiscount),
          maxUses: Number(newCouponMaxUses),
          expiresAt: newCouponExpiry ? new Date(newCouponExpiry).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to create promo code');
      } else {
        showToast('success', `Coupon "${newCouponCode.trim().toUpperCase()}" created!`);
        setNewCouponCode('');
        setNewCouponDiscount(200);
        setNewCouponMaxUses(100);
        setNewCouponExpiry('');
        fetchCoupons();
      }
    } catch {
      showToast('error', 'Failed to create coupon');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
        );
        showToast('success', `Coupon status updated`);
      }
    } catch {
      showToast('error', 'Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        showToast('success', `Coupon "${code}" deleted`);
      }
    } catch {
      showToast('error', 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif">
            Trip Configuration & Squad Pricing
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure tiered squad rates, advance deposits, dates, departure logistics, helplines, broadcast banners, and promo codes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchConfig();
            fetchCoupons();
          }}
          disabled={loading || loadingCoupons}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-amber-400/40 text-xs font-bold text-stone-200 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingCoupons ? 'animate-spin' : ''}`} />
          <span>Reload All</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Tiered Squad Pricing Architecture */}
        <div className="backdrop-blur-md bg-stone-900/75 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <CreditCard className="w-4 h-4" />
            <span>Tiered Squad Pricing & Deposit Structure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Standard Individual Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 block">
                Solo Rate (1–4 pax) (₹)
              </label>
              <input
                type="number"
                required
                min={1000}
                max={50000}
                value={config.packagePrice}
                onChange={(e) => setConfig({ ...config, packagePrice: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-white/20 text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 block">Standard individual rate (₹6,500)</span>
            </div>

            {/* Group Discounted Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-400 block">
                Squad Rate (5+ pax) (₹)
              </label>
              <input
                type="number"
                required
                min={1000}
                max={50000}
                value={config.groupPackagePrice}
                onChange={(e) => setConfig({ ...config, groupPackagePrice: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-sm focus:border-emerald-400 focus:outline-none"
              />
              <span className="text-[10px] text-emerald-500/80 block">Squad rate (₹6,200)</span>
            </div>

            {/* Group Size Threshold */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>Squad Threshold</span>
              </label>
              <input
                type="number"
                required
                min={2}
                max={20}
                value={config.groupSizeThreshold}
                onChange={(e) => setConfig({ ...config, groupSizeThreshold: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-white/20 text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 block">Min travelers for group rate (5)</span>
            </div>

            {/* Advance Reservation Deposit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 block">
                Advance Deposit (₹)
              </label>
              <input
                type="number"
                required
                min={500}
                max={config.packagePrice}
                value={config.depositPrice}
                onChange={(e) => setConfig({ ...config, depositPrice: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-amber-400/40 text-amber-300 font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 block">Required upfront per seat (₹1,000)</span>
            </div>
          </div>

          {/* Live Pricing Summary Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Solo Gate Due (Per Pax)
              </span>
              <span className="text-xl font-black text-white font-mono">
                ₹{soloGateBalance.toLocaleString('en-IN')}
              </span>
              <p className="text-[10px] text-stone-500">
                ₹{standardPrice.toLocaleString('en-IN')} − ₹{depositPrice.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Squad Gate Due (Per Pax)
              </span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                ₹{squadGateBalance.toLocaleString('en-IN')}
              </span>
              <p className="text-[10px] text-stone-500">
                ₹{groupPrice.toLocaleString('en-IN')} − ₹{depositPrice.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Squad Savings Per Head
              </span>
              <span className="text-xl font-black text-amber-400 font-mono">
                ₹{squadSavings.toLocaleString('en-IN')} OFF
              </span>
              <p className="text-[10px] text-stone-500">
                Applied automatically for {config.groupSizeThreshold}+ seats
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Logistics, Dates & Reporting Schedule */}
        <div className="backdrop-blur-md bg-stone-900/75 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <MapPin className="w-4 h-4" />
            <span>Expedition Logistics, Capacity & Travel Dates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Expedition Cap */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 block">
                Expedition Passenger Cap
              </label>
              <input
                type="number"
                required
                min={10}
                max={200}
                value={config.totalCapacity}
                onChange={(e) => setConfig({ ...config, totalCapacity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white font-mono font-bold text-xs focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 block">Total students across all coaches</span>
            </div>

            {/* Going / Departure Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Departure / Going Date</span>
              </label>
              <input
                type="date"
                required
                value={config.departureDate}
                onChange={(e) => setConfig({ ...config, departureDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 block">Official trip departure date</span>
            </div>

            {/* Return Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Return Date</span>
              </label>
              <input
                type="date"
                required
                value={config.returnDate || '2026-10-29'}
                onChange={(e) => setConfig({ ...config, returnDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 block">Official expedition return date</span>
            </div>

            {/* Pickup & Reporting Point */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-stone-200 block">
                Pickup & Reporting Point
              </label>
              <input
                type="text"
                required
                value={config.pickupLocation}
                onChange={(e) => setConfig({ ...config, pickupLocation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Reporting Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Reporting Time</span>
              </label>
              <input
                type="text"
                required
                value={config.reportingTime}
                onChange={(e) => setConfig({ ...config, reportingTime: e.target.value })}
                placeholder="e.g. 07:00 PM"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Emergency Helplines */}
            <div className="space-y-1.5 sm:col-span-3">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Emergency Coordinator Helplines (comma-separated)</span>
              </label>
              <input
                type="text"
                value={config.emergencyHelplines?.join(', ')}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    emergencyHelplines: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="6398412828, 8126854850"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-stone-500 block">
                Primary WhatsApp & call emergency lines: 6398412828, 8126854850
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Emergency Live Broadcast Banner */}
        <div className="backdrop-blur-md bg-stone-900/75 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency Live Broadcast Banner</span>
            </div>

            {/* Toggle Active Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.announcementActive}
                onChange={(e) => setConfig({ ...config, announcementActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="ml-2.5 text-xs font-bold text-stone-300">
                {config.announcementActive ? 'Live on Site' : 'Disabled'}
              </span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-200 block">
              Banner Message Text
            </label>
            <textarea
              rows={2}
              value={config.announcementBanner || ''}
              onChange={(e) => setConfig({ ...config, announcementBanner: e.target.value })}
              placeholder="e.g. Reporting time updated: Buses will depart from NH-2 gate at 8:00 PM sharp. Bring valid student ID cards."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
            <span className="text-[10px] text-stone-500 block">
              When enabled, displays an atmospheric notice bar across the top of the passenger booking portal.
            </span>
          </div>
        </div>

        {/* Submit Button for Config */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
            ) : (
              <Save className="w-4 h-4 text-stone-950" />
            )}
            <span>Save & Apply Trip Configuration</span>
          </button>
        </div>
      </form>

      {/* Card 4: Coupon & Promo Code Management Section */}
      <div className="backdrop-blur-md bg-stone-900/75 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Tag className="w-4 h-4" />
            <span>Coupon & Promo Code Management</span>
          </div>

          <button
            type="button"
            onClick={fetchCoupons}
            disabled={loadingCoupons}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-950 border border-white/10 text-[11px] text-stone-300 hover:text-white"
          >
            <RefreshCw className={`w-3 h-3 ${loadingCoupons ? 'animate-spin' : ''}`} />
            <span>Refresh Coupons</span>
          </button>
        </div>

        {/* Create Coupon Form */}
        <form onSubmit={handleCreateCoupon} className="p-4 rounded-2xl bg-stone-950 border border-white/10 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add New Promo Code</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-stone-400 block mb-1">PROMO CODE</label>
              <input
                type="text"
                required
                placeholder="e.g. EARLYBIRD"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/20 text-white font-mono text-xs uppercase focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-400 block mb-1">DISCOUNT (₹)</label>
              <input
                type="number"
                required
                min={50}
                max={5000}
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/20 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-400 block mb-1">MAX USES</label>
              <input
                type="number"
                required
                min={1}
                max={1000}
                value={newCouponMaxUses}
                onChange={(e) => setNewCouponMaxUses(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/20 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creatingCoupon}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow"
              >
                {creatingCoupon ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Create Code</span>
              </button>
            </div>
          </div>
        </form>

        {/* Existing Coupons List */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Active Promo Codes ({coupons.length})
          </span>

          {coupons.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500 border border-white/5 rounded-2xl bg-stone-950">
              No promo codes created yet. Add your first coupon above (e.g. EARLYBIRD or SQUAD5).
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    coupon.isActive
                      ? 'bg-stone-950 border-white/10'
                      : 'bg-stone-950/50 border-stone-800 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-sm tracking-wide">
                        {coupon.code}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase font-mono ${
                          coupon.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <p className="text-xs text-amber-400 font-bold font-mono">
                      ₹{coupon.discountAmount.toLocaleString('en-IN')} OFF
                    </p>

                    <p className="text-[10px] text-stone-400">
                      Redeemed: <span className="text-white font-mono">{coupon.usedCount}</span> / {coupon.maxUses} uses
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(coupon.id, coupon.isActive)}
                      title={coupon.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        coupon.isActive
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                      title="Delete Coupon"
                      className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
