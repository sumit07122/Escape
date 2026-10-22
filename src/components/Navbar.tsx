'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mountain, Menu, X, ArrowRight, User as UserIcon } from 'lucide-react';

interface AuthUser {
  id: string;
  name?: string;
  email: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userSession, setUserSession] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUserSession(data.user);
          }
        }
      } catch {
        // Silently handle offline/sandbox
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
    <header className="sticky top-0 z-50 w-full bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#163C32] flex items-center justify-center text-[#F7F5EF] shadow-sm group-hover:scale-105 transition-transform">
              <Mountain className="w-5 h-5 text-[#F7F5EF]" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight text-[#171918] block leading-tight">
                GLA HIMALAYAN ESCAPE
              </span>
              <p className="text-[10px] font-bold tracking-widest text-[#D87945] uppercase">
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
                      ? 'bg-[#163C32] text-white shadow-sm'
                      : 'text-[#171918]/80 hover:text-[#171918] hover:bg-[#E7E2D8]/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right: Google Auth / My Booking + Book Now */}
          <div className="hidden md:flex items-center gap-3">
            {userSession ? (
              <Link
                href="/my-booking"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#163C32] bg-[#E7E2D8] hover:bg-[#DDD5C5] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#163C32]" />
                <span>{userSession.name?.split(' ')[0] || 'My Booking'}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#171918] hover:text-[#163C32] border border-[#D8D2C4] bg-white hover:bg-[#F0ECE3] transition-colors"
              >
                <span>Continue with Google</span>
              </Link>
            )}

            <Link
              href="/book"
              className="px-5 py-2.5 rounded-xl bg-[#D87945] hover:bg-[#C26735] text-white font-bold text-xs shadow-sm transition-all hover:shadow"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Right */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/book"
              className="px-3.5 py-2 rounded-lg bg-[#D87945] text-white font-bold text-xs"
            >
              Book Now
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white text-[#171918] border border-[#D8D2C4]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F5EF] border-b border-[#D8D2C4] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#171918] hover:bg-[#E7E2D8]"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#163C32] hover:bg-[#E7E2D8]"
            >
              {userSession ? 'My Booking' : 'Continue with Google'}
            </Link>
          </div>

          <Link
            href="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D87945] text-white font-bold text-sm shadow-sm text-center"
          >
            <span>BOOK YOUR SEAT NOW</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
}
