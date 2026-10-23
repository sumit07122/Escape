'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BarChart3, Bus, CalendarDays, CreditCard, LayoutDashboard, PanelsTopLeft, Settings2, Sliders, Users } from 'lucide-react';
import FleetSeatMatrixTab from '@/components/admin/FleetSeatMatrixTab';
import TripPricingConfigTab from '@/components/admin/TripPricingConfigTab';
import PassengerManifestTab from '@/components/admin/PassengerManifestTab';
import { TripConfigData } from '@/lib/trip-config-shared';

type TabKey = 'overview' | 'fleet' | 'config' | 'manifest';

interface AdminDashboardClientProps {
  initialConfig?: TripConfigData;
}

export default function AdminDashboardClient({ initialConfig }: AdminDashboardClientProps) {
  const searchParams = useSearchParams();

  const tabParam = (searchParams.get('tab') as TabKey) || 'overview';
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [tripConfig, setTripConfig] = useState<TripConfigData | undefined>(initialConfig);

  useEffect(() => {
    if (tabParam === 'overview' || tabParam === 'fleet' || tabParam === 'config' || tabParam === 'manifest') {
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
    { key: 'overview', label: 'Overview', icon: LayoutDashboard, badge: 'Site manager' },
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

  const totalCap = tripConfig?.totalCapacity ?? 75;
  const quickLinks = [
    { title: 'Edit the website', description: 'Name, dates, pricing, announcements and contact details', href: '/admin/site-editor', icon: PanelsTopLeft, tone: 'amber' },
    { title: 'Plan the itinerary', description: 'Update day-by-day activities and departure notes', href: '/admin/itinerary', icon: CalendarDays, tone: 'emerald' },
    { title: 'Manage stays', description: 'Edit hotels, rooms and accommodation details', href: '/admin/hotels', icon: Settings2, tone: 'blue' },
    { title: 'Reservations', description: 'Review bookings and traveller information', href: '/admin/bookings', icon: Users, tone: 'violet' },
    { title: 'Fleet and seats', description: 'Manage coaches, capacity and seat availability', href: '/admin/buses', icon: Bus, tone: 'orange' },
    { title: 'Payments and reports', description: 'Track deposits, balances and trip performance', href: '/admin/payments', icon: CreditCard, tone: 'teal' },
  ];

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
              className={`flex-1 min-w-[132px] sm:min-w-0 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer sm:gap-2.5 sm:px-4 sm:text-xs ${
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#183c31] via-[#142a23] to-[#101916] p-6 shadow-xl sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
              <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="max-w-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1bd94]">Your expedition workspace</span>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Manage the whole trip from here.</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/70">Edit what travellers see, keep the schedule current and manage bookings from one control room.</p>
                </div>
                <Link href="/admin/site-editor" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f0bd94] px-5 py-3 text-xs font-bold text-[#203a30] transition hover:bg-white">Open site editor <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Trip capacity', value: `${tripConfig?.totalCapacity ?? totalCap} travellers`, detail: 'Current booking limit' },
                { label: 'Standard rate', value: `₹${(tripConfig?.packagePrice || 6500).toLocaleString('en-IN')}`, detail: 'Per traveller' },
                { label: 'Next departure', value: tripConfig?.departureDate || 'Set a date', detail: tripConfig?.returnDate ? `Returns ${tripConfig.returnDate}` : 'Update in Site editor' },
              ].map((metric) => <article key={metric.label} className="rounded-2xl border border-white/10 bg-stone-900/70 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">{metric.label}</p><strong className="mt-2 block text-xl font-semibold tracking-tight text-white">{metric.value}</strong><span className="mt-1 block text-[11px] text-stone-500">{metric.detail}</span></article>)}
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-stone-100">Manage your site and trip</h2><p className="mt-1 text-xs text-stone-500">Choose a section to start editing.</p></div><BarChart3 className="h-5 w-5 text-stone-600" /></div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {quickLinks.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="group rounded-2xl border border-white/[0.08] bg-stone-900/65 p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-stone-900"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-200"><Icon className="h-5 w-5" /></span><h3 className="mt-4 flex items-center justify-between text-sm font-semibold text-stone-100">{item.title}<ArrowRight className="h-4 w-4 text-stone-600 transition group-hover:translate-x-1 group-hover:text-emerald-300" /></h3><p className="mt-1.5 text-xs leading-5 text-stone-500">{item.description}</p></Link>; })}
              </div>
            </section>
          </div>
        )}
        {activeTab === 'fleet' && <FleetSeatMatrixTab />}
        {activeTab === 'config' && <TripPricingConfigTab />}
        {activeTab === 'manifest' && <PassengerManifestTab />}
      </div>
    </div>
  );
}
