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

  const standardPrice = Number(config.packagePrice) || 6200;
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
            Public Site & Trip Settings
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Edit the public trip details, schedule, pricing, contact lines, announcements, and promo codes from one place.
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
        {/* Homepage content */}
        <div className="rounded-3xl border border-white/10 bg-stone-900/75 p-5 shadow-xl sm:p-8">
          <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Homepage content</span>
          </div>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <label htmlFor="site-trip-title" className="block text-xs font-bold text-stone-200">Hero title</label>
              <input id="site-trip-title" type="text" required maxLength={80} value={config.tripTitle} onChange={(e) => setConfig({ ...config, tripTitle: e.target.value })} className="w-full rounded-xl border border-white/20 bg-stone-950 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none" />
              <p className="text-[10px] text-stone-500">Shown as the main homepage heading.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="site-hero-copy" className="block text-xs font-bold text-stone-200">Hero description</label>
              <textarea id="site-hero-copy" required maxLength={240} rows={3} value={config.subtitle} onChange={(e) => setConfig({ ...config, subtitle: e.target.value })} className="w-full resize-y rounded-xl border border-white/20 bg-stone-950 px-4 py-3 text-sm leading-6 text-white focus:border-amber-400 focus:outline-none" />
              <p className="text-[10px] text-stone-500">Shown beneath the title. Keep it clear and easy to scan on a phone.</p>
            </div>
          </div>
        </div>

        {/* Live Seat Availability & Urgency Control */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-stone-900/80 to-stone-950 p-5 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Users className="h-4 w-4" />
              <span>Live Public Seat Availability &amp; Urgency Controls</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Hero &amp; Site Sync
            </span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            Control the exact seat availability figures shown live to students across the homepage hero badge, booking portal, and pricing tables. You can either sync directly with real database bookings, or override with custom urgency numbers to stimulate booking velocity.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-950/90 border border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Seat Availability Display Mode</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.customSeatsDisplayEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                  {config.customSeatsDisplayEnabled ? 'Urgency Override Active' : 'Automatic Live DB'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {config.customSeatsDisplayEnabled
                  ? 'The public website is showing your custom urgency figures below.'
                  : 'The public website is dynamically calculating seats from real student reservations.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setConfig({ ...config, customSeatsDisplayEnabled: !config.customSeatsDisplayEnabled })}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md flex items-center gap-1.5 ${
                config.customSeatsDisplayEnabled
                  ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-white/15'
              }`}
            >
              <span>{config.customSeatsDisplayEnabled ? 'Disable Override' : 'Enable Urgency Override'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 block">
                Displayed Available Seats
              </label>
              <input
                type="number"
                min={0}
                max={200}
                value={config.customAvailableSeats ?? 17}
                disabled={!config.customSeatsDisplayEnabled}
                onChange={(e) => setConfig({ ...config, customAvailableSeats: Number(e.target.value) })}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-mono font-bold transition-all ${
                  config.customSeatsDisplayEnabled
                    ? 'bg-stone-950 border-amber-400 text-amber-300 focus:outline-none'
                    : 'bg-stone-950/50 border-white/10 text-stone-500 cursor-not-allowed'
                }`}
              />
              <span className="text-[10px] text-stone-500 block">Number shown in "{'{'}seats{'}'} of {'{'}total{'}'} seats available"</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 block">
                Displayed Total Capacity
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={config.customTotalCapacity ?? 75}
                disabled={!config.customSeatsDisplayEnabled}
                onChange={(e) => setConfig({ ...config, customTotalCapacity: Number(e.target.value) })}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-mono font-bold transition-all ${
                  config.customSeatsDisplayEnabled
                    ? 'bg-stone-950 border-amber-400 text-amber-300 focus:outline-none'
                    : 'bg-stone-950/50 border-white/10 text-stone-500 cursor-not-allowed'
                }`}
              />
              <span className="text-[10px] text-stone-500 block">Denominator shown on badge (e.g. 75 or 25)</span>
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-bold text-stone-200 block">
                Live Public Preview
              </label>
              <div className="p-3 rounded-xl bg-stone-950 border border-white/10 flex flex-col justify-center min-h-[46px]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold text-emerald-300">
                    {config.customSeatsDisplayEnabled ? (config.customAvailableSeats ?? 17) : 'Live DB'} of {config.customSeatsDisplayEnabled ? (config.customTotalCapacity ?? 75) : config.totalCapacity} seats available
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-stone-500 block">Reflects on hero badge and site in real-time</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-stone-400 mr-1">Quick Presets:</span>
            <button
              type="button"
              onClick={() => setConfig({ ...config, customSeatsDisplayEnabled: true, customAvailableSeats: 50, customTotalCapacity: 50, totalCapacity: 50 })}
              className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/40 text-[11px] font-bold text-emerald-300 transition-colors shadow-sm cursor-pointer"
            >
              🎯 50 of 50 Available (Full Live)
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, customSeatsDisplayEnabled: true, customAvailableSeats: 7, customTotalCapacity: 75 })}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-white/10 text-[11px] font-semibold text-amber-300 transition-colors cursor-pointer"
            >
              ⚡ High Urgency (7 of 75)
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, customSeatsDisplayEnabled: true, customAvailableSeats: 17, customTotalCapacity: 75 })}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-white/10 text-[11px] font-semibold text-amber-300 transition-colors cursor-pointer"
            >
              🔥 Coach 01 Momentum (17 of 75)
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, customSeatsDisplayEnabled: true, customAvailableSeats: 17, customTotalCapacity: 25 })}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-white/10 text-[11px] font-semibold text-amber-300 transition-colors cursor-pointer"
            >
              🚌 Single Coach Staging (17 of 25)
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, customSeatsDisplayEnabled: false })}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-white/10 text-[11px] font-semibold text-emerald-400 transition-colors cursor-pointer"
            >
              🔄 Reset to Auto DB Sync
            </button>
          </div>
        </div>

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
                Solo Single Rate (₹)
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
              <span className="text-[10px] text-stone-500 block">Single traveller rate (₹6,200)</span>
            </div>

            {/* Group Discounted Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-400 block">
                Squad Cabin Rate (₹)
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
              <span className="text-[10px] text-emerald-500/80 block">Squad rate per person (₹5,800)</span>
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
              <span className="text-[10px] text-stone-500 block">Min travellers for squad offer (3)</span>
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-200 block">
                  Expedition Passenger Cap
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        totalCapacity: 50,
                        customTotalCapacity: 50,
                        customAvailableSeats: 50,
                      })
                    }
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer"
                  >
                    Set 50 Seats
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        totalCapacity: 75,
                        customTotalCapacity: 75,
                      })
                    }
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300 hover:bg-stone-700 border border-white/10 cursor-pointer"
                  >
                    75
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        totalCapacity: 25,
                        customTotalCapacity: 25,
                      })
                    }
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-300 hover:bg-stone-700 border border-white/10 cursor-pointer"
                  >
                    25
                  </button>
                </div>
              </div>
              <input
                type="number"
                min={1}
                max={500}
                value={config.totalCapacity}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setConfig({ ...config, totalCapacity: val, customTotalCapacity: val });
                }}
                className="w-full rounded-xl border border-white/20 bg-stone-950 px-4 py-2.5 font-mono text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
              />
              <span className="block text-[10px] text-stone-400">Total expedition capacity. Enter 50 or any number, or click presets above.</span>
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
