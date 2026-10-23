'use client';

import React, { useState, useEffect } from 'react';
import {
  Save, RefreshCw, CheckCircle2, AlertCircle,
  CreditCard, MapPin, Calendar, Clock, Phone, AlertTriangle, Loader2
} from 'lucide-react';
import { TripConfigData, DEFAULT_TRIP_CONFIG } from '@/lib/trip-config';

export default function TripPricingConfigTab() {
  const [config, setConfig] = useState<TripConfigData>(DEFAULT_TRIP_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/config');
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

  useEffect(() => {
    fetchConfig();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const gateBalance = Math.max(0, (Number(config.packagePrice) || 6200) - (Number(config.depositPrice) || 1000));

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
          depositPrice: Number(config.depositPrice),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to update trip configuration');
      } else {
        showToast('success', 'Trip Configuration Updated Successfully');
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

  return (
    <div className="space-y-6 max-w-4xl">
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
            Trip Configuration & Pricing Controls
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time control over advance deposits, balance collections, expedition capacity caps, reporting schedules, and broadcast banners.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConfig}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-amber-400/40 text-xs font-bold text-stone-200 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Pricing & Financial Parameters */}
        <div className="backdrop-blur-md bg-stone-900/75 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <CreditCard className="w-4 h-4" />
            <span>Financial & Deposit Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Package Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 block">
                Total Package Price (₹)
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
              <span className="text-[10px] text-stone-500 block">All-inclusive per-student package</span>
            </div>

            {/* Advance Reservation Deposit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 block">
                Online Reservation Deposit (₹)
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
              <span className="text-[10px] text-stone-500 block">Required upfront to confirm seat</span>
            </div>

            {/* Auto-Calculated Gate Due Balance */}
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-white/10 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Auto Gate Due Balance
              </span>
              <span className="text-2xl font-black text-white font-mono tracking-tight mt-1">
                ₹{gateBalance.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-400 mt-0.5 font-semibold">
                Collectable in Cash/UPI at departure
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Logistics, Cap & Reporting Info */}
        <div className="backdrop-blur-md bg-stone-900/75 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <MapPin className="w-4 h-4" />
            <span>Expedition Logistics & Capacity Limits</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <span className="text-[10px] text-stone-500 block">Total students across all 4 coaches</span>
            </div>

            {/* Departure Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Departure Date</span>
              </label>
              <input
                type="date"
                required
                value={config.departureDate}
                onChange={(e) => setConfig({ ...config, departureDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
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
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Coordinator Helplines (comma-separated)</span>
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
                placeholder="7017936338, 9368287947"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-white/20 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
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
              When enabled, displays an atmospheric alert strip at the top of the passenger booking portal.
            </span>
          </div>
        </div>

        {/* Submit Button */}
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
    </div>
  );
}
