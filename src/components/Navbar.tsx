'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mountain, Menu, X, ArrowRight, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUserSession(data.user);
          }
        }
      } catch {
        // Fallback
      }
    }
    checkAuth();
  }, [pathname]);

  const navLinks = [
    { name: 'Trip', href: '/trip' },
    { name: 'Itinerary', href: '/itinerary' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'My Booking', href: '/my-booking' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050e09]/90 border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight text-white block">
                GLA HIMALAYAN ESCAPE
              </span>
              <p className="text-[10px] font-bold tracking-wider text-orange-400 uppercase">
                MANALI × KASOL • 6D / 5N
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Login & Book Now */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>{userSession ? 'Account' : 'Login'}</span>
            </Link>

            <Link
              href="/book"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Right: Book Now + Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/book"
              className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs"
            >
              Book Now
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08140e] border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
            >
              {userSession ? 'My Account' : 'Login'}
            </Link>
          </div>

          <Link
            href="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md text-center"
          >
            <span>BOOK YOUR SEAT NOW</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
}
