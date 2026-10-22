'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mountain, Phone, MessageSquare, Ticket, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<{ totalBooked: number; capacity: number } | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/buses');
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalBooked: data.trip?.totalBooked || 0,
            capacity: data.trip?.capacity || 75,
          });
        }
      } catch {
        // Fallback
      }
    }
    loadStats();
    const interval = setInterval(loadStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Itinerary', href: '/itinerary' },
    { name: 'Trip Details', href: '/trip-details' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Inclusions', href: '/inclusions' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  GLA HIMALAYAN ESCAPE
                </span>
              </div>
              <p className="text-xs font-semibold tracking-wider text-orange-400 uppercase">
                MANALI × KASOL • 6D / 5N
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions & Live Availability */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Seat Badge */}
            {stats && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-xs font-medium text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{stats.totalBooked} / {stats.capacity} Booked</span>
              </div>
            )}

            {/* Call Button */}
            <a
              href={`tel:${CONTACT_INFO.coordinatorPhone1}`}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
              title="Call Trip Coordinator"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
            </a>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp1}?text=Hi%2C%20I%20have%20a%20query%20about%20GLA%20Himalayan%20Escape%20Manali%20Kasol%20trip`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-green-950/70 hover:bg-green-900 text-zinc-200 border border-green-700/50 transition-colors"
              title="WhatsApp Trip Team"
            >
              <MessageSquare className="w-4 h-4 text-green-400" />
            </a>

            {/* My Booking Link */}
            <Link
              href="/my-booking"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-700 transition-colors"
            >
              <Ticket className="w-3.5 h-3.5 text-zinc-400" />
              <span>My Ticket</span>
            </Link>

            {/* Book Now Primary Button */}
            <Link
              href="/book"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-950/60 glow-orange transition-all hover:scale-105"
            >
              <span>BOOK SEAT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/book"
              className="px-3 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-xs"
            >
              BOOK
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          {stats && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/60 border border-emerald-600/30 text-xs text-emerald-300 font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Availability:
              </span>
              <span className="font-bold">{stats.totalBooked} / {stats.capacity} Booked</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <a
                href={`tel:${CONTACT_INFO.coordinatorPhone1}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call ({CONTACT_INFO.coordinatorPhone1})</span>
              </a>
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp1}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-950/70 text-xs font-semibold text-green-300 border border-green-700/50"
              >
                <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/my-booking"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300"
              >
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                <span>My Booking</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-400"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Admin</span>
              </Link>
            </div>

            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-sm shadow-lg text-center"
            >
              <span>BOOK YOUR SEAT NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
