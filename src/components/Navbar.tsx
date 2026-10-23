'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        const res = await fetch(`/api/auth/me?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });
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
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#163C32]/25 bg-white p-0.5 shadow-md transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
              <Image
                src="/logo.png"
                alt="Himalayan Escape Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-full"
                priority
              />
            </div>
            <div>
              <span className="block text-[13px] font-black leading-tight tracking-tight text-[#171918] min-[380px]:text-sm sm:text-lg">
                HIMALAYAN ESCAPE
              </span>
              <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#D87945] min-[380px]:text-[9px] sm:text-[10px] sm:tracking-widest max-[359px]:hidden">
                6D / 5N • MANALI × KASOL EXPEDITION
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

          {/* Desktop Right: WhatsApp Shortcut + Auth Dropdown / Sign In + Book Now */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://chat.whatsapp.com/BpzC0H0GEM6GlhslBJWDTE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all hover:scale-105 shadow-xs"
              title="Join Expedition WhatsApp Group 🏔️"
            >
              <svg className="w-3.5 h-3.5 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.201.3-.777.978-.953 1.179-.176.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.176-.3-.019-.463.132-.612.136-.134.301-.35.452-.525.15-.175.2-.3.301-.5.101-.2.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.235-.244-.588-.493-.508-.677-.518-.175-.008-.376-.01-.577-.01-.2 0-.526.075-.802.375-.276.3-1.053 1.029-1.053 2.509 0 1.48 1.078 2.91 1.228 3.11.15.2 2.122 3.24 5.14 4.543.718.31 1.279.495 1.716.634.721.23 1.378.197 1.897.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.429-.075-.126-.276-.201-.577-.351zM12.04 21.785c-1.758 0-3.483-.473-5.002-1.371l-.358-.213-3.718.975.992-3.624-.233-.371a9.78 9.78 0 0 1-1.503-5.21c0-5.412 4.403-9.815 9.819-9.815 2.624 0 5.09 1.023 6.945 2.88 1.856 1.856 2.878 4.323 2.877 6.947 0 5.414-4.403 9.817-9.817 9.817zm7.643-17.46C17.65 2.29 14.945 1.2 12.04 1.2 6.069 1.2 1.21 6.059 1.21 12.033c0 1.909.5 3.771 1.45 5.418L1 23l5.694-1.493a10.8 10.8 0 0 0 5.346 1.405h.005c5.969 0 10.828-4.86 10.83-10.835 0-2.894-1.127-5.614-3.192-7.75z" />
              </svg>
              <span>Join Trip Group</span>
            </a>
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
                <span>Sign In</span>
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
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#D87945] px-3 text-xs font-bold text-white shadow-sm"
            >
              Book Now
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8D2C4] bg-white text-[#171918]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="max-h-[calc(100dvh-4rem)] space-y-3 overflow-y-auto border-b border-[#D8D2C4] bg-[#F7F5EF] px-4 pb-6 pt-3 md:hidden">
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

            <a
              href="https://chat.whatsapp.com/BpzC0H0GEM6GlhslBJWDTE"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
            >
              <svg className="w-4 h-4 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.201.3-.777.978-.953 1.179-.176.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.176-.3-.019-.463.132-.612.136-.134.301-.35.452-.525.15-.175.2-.3.301-.5.101-.2.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.235-.244-.588-.493-.508-.677-.518-.175-.008-.376-.01-.577-.01-.2 0-.526.075-.802.375-.276.3-1.053 1.029-1.053 2.509 0 1.48 1.078 2.91 1.228 3.11.15.2 2.122 3.24 5.14 4.543.718.31 1.279.495 1.716.634.721.23 1.378.197 1.897.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.429-.075-.126-.276-.201-.577-.351zM12.04 21.785c-1.758 0-3.483-.473-5.002-1.371l-.358-.213-3.718.975.992-3.624-.233-.371a9.78 9.78 0 0 1-1.503-5.21c0-5.412 4.403-9.815 9.819-9.815 2.624 0 5.09 1.023 6.945 2.88 1.856 1.856 2.878 4.323 2.877 6.947 0 5.414-4.403 9.817-9.817 9.817zm7.643-17.46C17.65 2.29 14.945 1.2 12.04 1.2 6.069 1.2 1.21 6.059 1.21 12.033c0 1.909.5 3.771 1.45 5.418L1 23l5.694-1.493a10.8 10.8 0 0 0 5.346 1.405h.005c5.969 0 10.828-4.86 10.83-10.835 0-2.894-1.127-5.614-3.192-7.75z" />
              </svg>
              <span>Join Trip WhatsApp Group</span>
            </a>

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
                Sign In
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
