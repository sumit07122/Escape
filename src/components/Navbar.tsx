'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mountain, Menu, X, ArrowRight, User as UserIcon,
  ChevronDown, Ticket, Compass, LogOut
} from 'lucide-react';

interface AuthUser {
  id: string;
  name?: string;
  email: string;
  image?: string | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userSession, setUserSession] = useState<AuthUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUserSession(data.user);
          } else {
            setUserSession(null);
          }
        }
      } catch {
        // Silently handle offline/sandbox
      }
    }
    checkAuth();
  }, [pathname]);

  // Dismiss dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Trip', href: '/trip' },
    { name: 'Itinerary', href: '/itinerary' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'My Bookings', href: '/my-bookings' },
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
                HIMALAYAN ESCAPE
              </span>
              <p className="text-[10px] font-bold tracking-widest text-[#D87945] uppercase">
                STUDENT EXPEDITION • MANALI × KASOL
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/my-bookings' && pathname === '/my-booking');
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

          {/* Desktop Right: Authenticated User Dropdown OR Continue with Google */}
          <div className="hidden md:flex items-center gap-3">
            {userSession ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-[#163C32] bg-[#E7E2D8] hover:bg-[#DDD5C5] border border-[#D8D2C4] transition-all cursor-pointer"
                >
                  {userSession.image ? (
                    <img
                      src={userSession.image}
                      alt={userSession.name || 'Traveller'}
                      className="w-6 h-6 rounded-full object-cover border border-[#163C32]/30 shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#163C32] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {(userSession.name || userSession.email).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[110px] truncate">{userSession.name?.split(' ')[0] || userSession.email.split('@')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#163C32] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#D8D2C4] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#E7E2D8]">
                      <p className="font-bold text-xs text-[#171918] truncate">{userSession.name || 'Traveller'}</p>
                      <p className="text-[11px] text-[#646864] truncate">{userSession.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#171918] hover:bg-[#F7F5EF] transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-[#163C32]" />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        href="/book"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#171918] hover:bg-[#F7F5EF] transition-colors"
                      >
                        <Compass className="w-4 h-4 text-[#D87945]" />
                        <span>Book Seats</span>
                      </Link>
                    </div>

                    <div className="border-t border-[#E7E2D8] pt-1">
                      <a
                        href="/api/auth/logout"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setUserSession(null);
                        }}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
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

            {userSession ? (
              <div className="p-3 rounded-2xl bg-white border border-[#D8D2C4] space-y-2 mt-2">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E7E2D8]">
                  {userSession.image ? (
                    <img src={userSession.image} alt="User" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#163C32] text-white text-xs font-bold flex items-center justify-center">
                      {(userSession.name || userSession.email).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#171918] truncate">{userSession.name || 'Traveller'}</p>
                    <p className="text-[10px] text-[#646864] truncate">{userSession.email}</p>
                  </div>
                </div>
                <Link
                  href="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-[#163C32] hover:bg-[#F7F5EF]"
                >
                  <Ticket className="w-4 h-4" />
                  <span>My Bookings</span>
                </Link>
                <Link
                  href="/book"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-[#D87945] hover:bg-[#F7F5EF]"
                >
                  <Compass className="w-4 h-4" />
                  <span>Book Seats</span>
                </Link>
                <a
                  href="/api/auth/logout"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </a>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#163C32] hover:bg-[#E7E2D8]"
              >
                Continue with Google
              </Link>
            )}
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
