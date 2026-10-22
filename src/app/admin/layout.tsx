'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Users, Bus, CreditCard,
  Share2, QrCode, Ticket, Hotel, Truck, Calendar,
  Receipt, BarChart3, Settings, ShieldCheck, LogOut,
  Menu, X, Bell, UserCheck, History
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setAdminUser(data.admin);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/me', { method: 'POST' });
    } catch {
      // Fallback
    }
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: BookOpen },
    { name: 'Travellers', href: '/admin/travellers', icon: Users },
    { name: 'Buses & Seats', href: '/admin/buses', icon: Bus },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'QR Scanner', href: '/admin/scanner', icon: QrCode },
    { name: 'Hotels', href: '/admin/hotels', icon: Hotel },
    { name: 'Transport', href: '/admin/transport', icon: Truck },
    { name: 'Itinerary', href: '/admin/itinerary', icon: Calendar },
    { name: 'Expenses', href: '/admin/expenses', icon: Receipt },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050e09] text-zinc-400">
        Loading Admin Workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050e09] flex text-zinc-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#08140e] border-r border-white/10 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight">GLA EXPEDITION</h2>
            <p className="text-[10px] font-bold text-orange-400 uppercase">ADMIN CONSOLE</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-zinc-950/70 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white truncate max-w-[140px]">
              {adminUser?.name || 'Coordinator'}
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 uppercase">
              {adminUser?.role || 'ADMIN'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{adminUser?.email}</p>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-rose-400 hover:bg-rose-950/40 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-[#08140e] border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-200"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-black text-sm text-white">GLA ADMIN CONSOLE</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-rose-400 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Out</span>
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden bg-[#08140e] border-b border-white/10 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-emerald-600/20 text-emerald-300' : 'text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
