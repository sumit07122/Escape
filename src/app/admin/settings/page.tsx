'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
      }
    } catch (err) {
      console.error(err);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch {
      alert('Error updating configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            SYSTEM PARAMETERS
          </span>
          <h1 className="text-3xl font-black text-white">System Configuration</h1>
          <p className="text-xs text-zinc-400">
            Edit capacity limits, pricing structures, contact numbers, and hold durations without editing code.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2 text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>System configuration saved and active across all endpoints!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6">
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
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg glow-orange"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
