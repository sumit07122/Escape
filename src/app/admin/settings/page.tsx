'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  CheckCircle2,
  Users,
  CreditCard,
  Calendar,
  DollarSign,
  Megaphone,
  Phone,
  Bus,
  ShieldAlert,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

interface SettingItem {
  id?: string;
  key: string;
  value: string;
  category?: string;
  description?: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [tripCapacity, setTripCapacity] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/settings?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
        if (data.tripCapacity !== undefined) {
          setTripCapacity(Number(data.tripCapacity));
        } else if (data.globalSettings?.tripCapacity !== undefined) {
          setTripCapacity(Number(data.globalSettings.tripCapacity));
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleValueChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const getSettingValue = (key: string, fallback = '') => {
    return settings.find((s) => s.key === key)?.value ?? fallback;
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setSettingsSavedSuccess(true);
        setTimeout(() => setSettingsSavedSuccess(false), 4000);
        await fetchSettings();
      } else {
        alert('Failed to save settings. Please check server logs.');
      }
    } catch {
      alert('Network error updating system configuration');
    } finally {
      setSavingSettings(false);
    }
  };

  // Helper to get raw helpline display
  const formatHelplinesDisplay = (raw: string) => {
    try {
      if (raw.startsWith('[') && raw.endsWith(']')) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.join(', ');
      }
    } catch {}
    return raw;
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            SYSTEM PARAMETERS & GATEWAYS
          </span>
          <h1 className="text-3xl font-black text-white">System Configuration</h1>
          <p className="text-xs text-stone-400 mt-1">
            Configure coordinator UPI ID, pricing tiers, expedition dates, fleet capacity, and real-time disclaimers.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs font-bold text-stone-300 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {/* Global Success Banner */}
      {settingsSavedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-3 text-emerald-200 text-xs font-bold shadow-xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-white">Settings Successfully Synchronized!</p>
            <p className="text-[11px] text-emerald-300/90 font-normal">
              Database models, SSOT TripConfig cache, and public pricing tiers have been updated across all pages.
            </p>
          </div>
        </div>
      )}

      {/* 1. Fleet Capacity Overview */}
      <div className="rounded-3xl p-6 sm:p-7 border border-amber-500/30 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20 shadow-xl space-y-3">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                LIVE PHYSICAL FLEET CAPACITY
              </span>
              <h2 className="text-xl font-black text-white">Active Bus Seats</h2>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/40">
            {tripCapacity} seats across active coaches
          </span>
        </div>
        <p className="text-xs leading-relaxed text-stone-400">
          Derived dynamically from active coaches (Bus 01 & Bus 02). Modify physical seating layouts directly under{' '}
          <strong className="text-white">Fleet & Seats</strong>.
        </p>
      </div>

      {/* 2. Structured Settings Form */}
      <form onSubmit={handleSettingsSave} className="space-y-6">
        
        {/* Section: Coordinator UPI & Payment Gateway */}
        <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Coordinator Direct UPI & Payment VPA</h3>
              <p className="text-[11px] text-stone-400">
                Direct receiver UPI address for zero-fee instant QR payments.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block flex items-center justify-between">
              <span>Coordinator UPI ID (VPA)</span>
              <span className="text-[10px] text-emerald-400 font-mono">0% Fee Direct Verification</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={getSettingValue('upi_vpa', 'gdark909@okicici')}
                onChange={(e) => handleValueChange('upi_vpa', e.target.value.trim())}
                placeholder="e.g. gdark909@okicici"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Payments initiated on the site generate dynamic intent links and QR codes pointing directly to this UPI ID.
            </p>
          </div>
        </div>

        {/* Section: Pricing & Reservation Deposits */}
        <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Expedition Pricing & Booking Deposit</h3>
              <p className="text-[11px] text-stone-400">
                Live pricing engine values shown to travellers on booking and checkout flows.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Package Price per Traveller (₹)</label>
              <input
                type="number"
                min="1000"
                value={getSettingValue('price_single', '6200')}
                onChange={(e) => handleValueChange('price_single', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white font-bold text-xs focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Duo / Group Price per Traveller (₹)</label>
              <input
                type="number"
                min="1000"
                value={getSettingValue('price_group', '5800')}
                onChange={(e) => handleValueChange('price_group', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white font-bold text-xs focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Seat Reservation Token Amount (₹)</label>
              <input
                type="number"
                min="100"
                value={getSettingValue('price_reservation', '1000')}
                onChange={(e) => handleValueChange('price_reservation', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white font-bold text-xs focus:border-amber-400 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-stone-500">Minimum initial deposit required to lock bus seat.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Group Discount Threshold (Pax)</label>
              <input
                type="number"
                min="2"
                max="20"
                value={getSettingValue('group_size_threshold', '3')}
                onChange={(e) => handleValueChange('group_size_threshold', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white font-bold text-xs focus:border-amber-400 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-stone-500">Minimum party size to unlock group rate.</p>
            </div>
          </div>
        </div>

        {/* Section: Trip Identity & Schedule */}
        <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Trip Schedule & Departure Details</h3>
              <p className="text-[11px] text-stone-400">
                Departure timestamps and boarding point locations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-stone-300 block">Trip Title / Campaign Name</label>
              <input
                type="text"
                value={getSettingValue('trip_name', 'Himalayan Escape 2026')}
                onChange={(e) => handleValueChange('trip_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white font-bold text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-stone-300 block">Hero Subtitle</label>
              <textarea
                rows={2}
                value={getSettingValue('trip_subtitle')}
                onChange={(e) => handleValueChange('trip_subtitle', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Departure Date</label>
              <input
                type="date"
                value={getSettingValue('departure_date', '2026-12-24')}
                onChange={(e) => handleValueChange('departure_date', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Return Date</label>
              <input
                type="date"
                value={getSettingValue('return_date', '2026-12-29')}
                onChange={(e) => handleValueChange('return_date', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Reporting Time</label>
              <input
                type="text"
                value={getSettingValue('reporting_time', '07:00 PM')}
                onChange={(e) => handleValueChange('reporting_time', e.target.value)}
                placeholder="e.g. 07:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Pickup & Boarding Location</label>
              <input
                type="text"
                value={getSettingValue('pickup_location', 'Near Main Gate (NH-2), Mathura')}
                onChange={(e) => handleValueChange('pickup_location', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section: Announcements & Emergency Contacts */}
        <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Announcements & Emergency Contacts</h3>
              <p className="text-[11px] text-stone-400">
                Top alert banners and student coordinator contact lines.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-950 border border-white/10">
              <div>
                <p className="text-xs font-bold text-white">Top Announcement Banner</p>
                <p className="text-[11px] text-stone-400">Display prominent alert banner across the site</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = getSettingValue('announcement_active', 'false');
                  handleValueChange('announcement_active', current === 'true' ? 'false' : 'true');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  getSettingValue('announcement_active') === 'true'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {getSettingValue('announcement_active') === 'true' ? 'Active' : 'Disabled'}
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">Announcement Banner Text</label>
              <input
                type="text"
                value={getSettingValue('announcement_banner')}
                onChange={(e) => handleValueChange('announcement_banner', e.target.value)}
                placeholder="e.g. Reporting time updated: Buses will depart from NH-2 gate at 8:00 PM sharp."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">
                Emergency Helpline Numbers (Comma-separated)
              </label>
              <input
                type="text"
                value={formatHelplinesDisplay(getSettingValue('emergency_helplines', '["6398412828","8126854850"]'))}
                onChange={(e) => handleValueChange('emergency_helplines', e.target.value)}
                placeholder="e.g. 6398412828, 8126854850"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
              />
              <p className="text-[10px] text-stone-500">
                Automatically parsed and formatted for one-click calling across customer booking cards.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Custom Seat Availability Override */}
        <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">Custom Seat Scarcity Display Override</h3>
              <p className="text-[11px] text-stone-400">
                Override public seat count to create urgency without modifying actual database bus seats.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-950 border border-white/10">
              <div>
                <p className="text-xs font-bold text-white">Custom Display Override</p>
                <p className="text-[11px] text-stone-400">When enabled, public hero shows custom counts below</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = getSettingValue('custom_seats_display_enabled', 'false');
                  handleValueChange('custom_seats_display_enabled', current === 'true' ? 'false' : 'true');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  getSettingValue('custom_seats_display_enabled') === 'true'
                    ? 'bg-purple-600 text-white shadow-md font-black'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {getSettingValue('custom_seats_display_enabled') === 'true' ? 'Enabled' : 'Live Fleet Count'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">Displayed Available Seats</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={getSettingValue('custom_available_seats', '35')}
                  onChange={(e) => handleValueChange('custom_available_seats', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">Displayed Total Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={getSettingValue('custom_total_capacity', '50')}
                  onChange={(e) => handleValueChange('custom_total_capacity', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Legal & Disclaimers */}
        <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <ShieldAlert className="w-4 h-4 text-stone-400" />
            <div>
              <h3 className="text-base font-bold text-white">Legal & Itinerary Disclaimers</h3>
              <p className="text-[11px] text-stone-400">
                Official fine print rendered at the bottom of public itineraries and booking slips.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 block">Itinerary Legal Disclaimer</label>
            <textarea
              rows={3}
              value={getSettingValue(
                'itinerary_disclaimer',
                'Trip itinerary may change due to weather, road conditions, traffic, permits, government restrictions or safety requirements.'
              )}
              onChange={(e) => handleValueChange('itinerary_disclaimer', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-white/15 text-white text-xs focus:border-amber-400 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'Saving Configuration…' : 'Save & Publish All Settings'}</span>
          </button>
        </div>
      </form>

      {/* Production Launch & Fleet Reset Zone */}
      <div className="rounded-3xl border border-rose-900/40 bg-gradient-to-br from-rose-950/20 via-stone-950 to-stone-900/60 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700/50 text-[10px] font-bold uppercase tracking-wider">
                Production Launch Zone
              </span>
              <span className="text-xs text-stone-400">Pristine State Reset</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Reset Fleet to 100% Live Availability
            </h3>
            <p className="text-xs text-stone-400 max-w-xl mt-1 leading-relaxed">
              Purges all test bookings, payments, and seat holds. Restores passenger seats to Available, preserves driver and crew locks, and aligns dates to Dec 24 – Dec 29, 2026.
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (
                !window.confirm(
                  '⚠️ PRODUCTION RESET: This will purge all existing test bookings and reset bus seats to AVAILABLE for live student bookings. Proceed?'
                )
              )
                return;
              try {
                const res = await fetch('/api/admin/reset-data', { method: 'POST' });
                const data = await res.json();
                if (res.ok) {
                  alert(
                    `✅ SUCCESS: ${data.message}\nReset ${data.stats.resetPassengerSeats} seats to Available. Fleet Capacity: ${data.stats.totalFleetCapacity}.`
                  );
                  fetchSettings();
                } else {
                  alert('❌ Error: ' + (data.error || 'Failed to reset database'));
                }
              } catch {
                alert('Network error connecting to reset service');
              }
            }}
            className="shrink-0 px-5 py-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🚀 Reset to Live Stage</span>
          </button>
        </div>
      </div>
    </div>
  );
}
