'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle2, Users, AlertCircle, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [tripCapacity, setTripCapacity] = useState<number>(75);
  const [loading, setLoading] = useState(true);
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [capacitySavedSuccess, setCapacitySavedSuccess] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
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

  const handleCapacitySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCapacity(true);
    setCapacitySavedSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripCapacity }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tripCapacity !== undefined) {
          setTripCapacity(data.tripCapacity);
        }
        setCapacitySavedSuccess(true);
        setTimeout(() => setCapacitySavedSuccess(false), 3500);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update expedition capacity');
      }
    } catch {
      alert('Network error updating expedition capacity');
    } finally {
      setSavingCapacity(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, tripCapacity }),
      });

      if (res.ok) {
        setSettingsSavedSuccess(true);
        setTimeout(() => setSettingsSavedSuccess(false), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch {
      alert('Error updating configuration');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            SYSTEM PARAMETERS
          </span>
          <h1 className="text-3xl font-black text-white">System Configuration</h1>
          <p className="text-xs text-zinc-400">
            Edit dynamic expedition capacity limits, pricing structures, contact numbers, and hold durations.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {/* Global Success Notifications */}
      {capacitySavedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2 text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Expedition capacity updated to {tripCapacity} students! Active across all booking endpoints.</span>
        </div>
      )}

      {settingsSavedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2 text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>System configuration saved and active across all endpoints!</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. DEDICATED EXPEDITION CAPACITY CARD (ADMIN CONTROLLED) */}
      {/* ======================================================== */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-orange-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-orange-950/20 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">
                GLOBAL BOOKING CEILING
              </span>
              <h2 className="text-xl font-black text-white">Expedition Capacity</h2>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-orange-950 text-orange-300 border border-orange-600/40">
            Current Cap: {tripCapacity} Students
          </span>
        </div>

        <form onSubmit={handleCapacitySave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white block">
              Total Booking Capacity
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="number"
                min={1}
                max={500}
                required
                value={tripCapacity}
                onChange={(e) => setTripCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-base font-black focus:border-orange-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={savingCapacity}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{savingCapacity ? 'Saving Limit...' : 'Save Capacity Limit'}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed pt-1">
              Maximum number of confirmed students allowed across all buses. Bookings will automatically close once this limit is reached.
            </p>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 2. GENERAL PARAMETERS FORM                               */}
      {/* ======================================================== */}
      <form onSubmit={handleSettingsSave} className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
        <div className="border-b border-zinc-800 pb-3">
          <h2 className="text-xl font-black text-white">General Parameters & Texts</h2>
          <p className="text-xs text-zinc-400">
            Configure system variables, coordination numbers, and legal disclaimers.
          </p>
        </div>

        <div className="space-y-4">
          {settings.map((s) => (
            <div key={s.key} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-400">{s.key}</span>
                  <p className="text-[11px] text-zinc-400">{s.description || 'Configurable system value'}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase self-start sm:self-center">
                  {s.category}
                </span>
              </div>

              {s.key.includes('disclaimer') ? (
                <textarea
                  rows={3}
                  value={s.value}
                  onChange={(e) => handleValueChange(s.key, e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              ) : (
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => handleValueChange(s.key, e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-bold"
                />
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs shadow-lg border border-zinc-700"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
