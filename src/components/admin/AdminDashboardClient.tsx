'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bus, Sliders, Users } from 'lucide-react';
import FleetSeatMatrixTab from '@/components/admin/FleetSeatMatrixTab';
import TripPricingConfigTab from '@/components/admin/TripPricingConfigTab';
import PassengerManifestTab from '@/components/admin/PassengerManifestTab';
import { TripConfigData } from '@/lib/trip-config-shared';

type TabKey = 'fleet' | 'config' | 'manifest';

interface AdminDashboardClientProps {
  initialConfig?: TripConfigData;
}

export default function AdminDashboardClient({ initialConfig }: AdminDashboardClientProps) {
  const searchParams = useSearchParams();

  const tabParam = (searchParams.get('tab') as TabKey) || 'fleet';
  const [activeTab, setActiveTab] = useState<TabKey>('fleet');
  const [tripConfig, setTripConfig] = useState<TripConfigData | undefined>(initialConfig);

  useEffect(() => {
    if (tabParam === 'fleet' || tabParam === 'config' || tabParam === 'manifest') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Periodic fresh config check with cache-busting
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/trip-config?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.config) setTripConfig(data.config);
        }
      } catch {
        // Fallback to initial
      }
    };

    fetchLatest();
  }, []);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: string }[] = [
    {
      key: 'fleet',
      label: 'Fleet & Seat Matrix',
      icon: Bus,
      badge: '4 Coaches',
    },
    {
      key: 'config',
      label: 'Trip & Pricing Config',
      icon: Sliders,
      badge: 'Live Parameters',
    },
    {
      key: 'manifest',
      label: 'Passenger Manifest',
      icon: Users,
      badge: 'Gate & CSV',
    },
  ];

  const totalCap = tripConfig?.totalCapacity || 75;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* OPERATIONS HEADER BANNER (DYNAMIC SSOT CAPACITY)        */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
              REAL-TIME OPERATIONS CONSOLE
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live DB Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-100 tracking-tight mt-0.5">
            Expedition Operations Desk
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Himalayan Escape • Manali × Kasol ({totalCap} Capacity)
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ALPINE TABBED NAVIGATION SWITCHER                        */}
      {/* ======================================================== */}
      <div className="flex items-center p-1.5 rounded-2xl backdrop-blur-md bg-stone-900/80 border border-white/10 shadow-lg overflow-x-auto gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 min-w-[170px] sm:min-w-0 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/15 text-amber-300 border border-amber-500/35 shadow-md shadow-amber-950/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-amber-400' : 'text-stone-500'
                }`}
              />
              <span className="truncate">{tab.label}</span>
              {tab.badge && (
                <span
                  className={`hidden sm:inline-block text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* ACTIVE TAB RENDERER                                      */}
      {/* ======================================================== */}
      <div className="transition-all duration-200">
        {activeTab === 'fleet' && <FleetSeatMatrixTab />}
        {activeTab === 'config' && <TripPricingConfigTab />}
        {activeTab === 'manifest' && <PassengerManifestTab />}
      </div>
    </div>
  );
}
