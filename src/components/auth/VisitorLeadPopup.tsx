'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  X,
  Sparkles,
  Phone,
  Lock,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export default function VisitorLeadPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Never show on admin or login pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
      return;
    }

    // Check if dismissed in this session
    if (typeof window !== 'undefined') {
      const isDismissed = sessionStorage.getItem('dismissed_lead_popup');
      if (isDismissed === 'true') {
        return;
      }
    }

    // Check if user is already authenticated
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            return; // Already logged in, no popup needed
          }
        }
      } catch {
        // Continue to show popup if check fails
      }

      if (isMounted) {
        // Trigger popup smoothly after 3 seconds of browsing
        const timer = setTimeout(() => {
          if (isMounted) {
            setIsOpen(true);
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleDismiss = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dismissed_lead_popup', 'true');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    const rawDigits = phone.replace(/[^0-9]/g, '');
    const cleanPhone =
      rawDigits.length === 12 && rawDigits.startsWith('91')
        ? rawDigits.slice(2)
        : rawDigits.length > 10
        ? rawDigits.slice(-10)
        : rawDigits;

    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          password,
          termsAccepted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setSuccessMessage(`🎉 Welcome, ${cleanName}! Your account has been registered.`);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dismissed_lead_popup', 'true');
        window.dispatchEvent(new CustomEvent('auth-change'));
      }

      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawDigits = phone.replace(/[^0-9]/g, '');
    const cleanPhone =
      rawDigits.length === 12 && rawDigits.startsWith('91')
        ? rawDigits.slice(2)
        : rawDigits.length > 10
        ? rawDigits.slice(-10)
        : rawDigits;

    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter your 10-digit mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid mobile number or password.');
      }

      setSuccessMessage('Welcome back! Logging you in...');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dismissed_lead_popup', 'true');
        window.dispatchEvent(new CustomEvent('auth-change'));
      }

      setTimeout(() => {
        setIsOpen(false);
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-[#121915] text-stone-100 shadow-2xl shadow-black/90 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-popup-title"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Dismiss 'X' Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-700 transition cursor-pointer"
          aria-label="Close popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Box */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Header Banner */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Winter Expedition 2026</span>
            </div>
            <h2 id="visitor-popup-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Join Himalayan Escape
            </h2>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              Register in seconds to lock member discounts, view full trip details, and save your seat.
            </p>
          </div>

          {/* Quick Google 1-Tap CTA */}
          <div>
            <a
              href={`/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-white/15 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs transition-all shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </a>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#121915] px-3 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Or with mobile number
            </span>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-stone-900 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Feedback & Errors */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          {activeTab === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Full Legal Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full rounded-xl border border-white/15 bg-stone-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-stone-600 focus:border-amber-400 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  WhatsApp Mobile Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-mono font-bold text-amber-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98765 43210"
                    className="w-full rounded-xl border border-white/15 bg-stone-950 py-2.5 pl-12 pr-3 text-xs font-mono text-white placeholder:text-stone-600 focus:border-amber-400 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Create Password (min. 6 chars)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/15 bg-stone-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-stone-600 focus:border-amber-400 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Registering Account…</span>
                ) : (
                  <>
                    <span>Create Account & Unlock Deals</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant sign up · No OTP verification needed</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Registered Mobile Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-mono font-bold text-amber-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98765 43210"
                    className="w-full rounded-xl border border-white/15 bg-stone-950 py-2.5 pl-12 pr-3 text-xs font-mono text-white placeholder:text-stone-600 focus:border-amber-400 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/15 bg-stone-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-stone-600 focus:border-amber-400 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Signing In…</span>
                ) : (
                  <>
                    <span>Sign In to Your Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Skip / Dismiss footer */}
          <div className="text-center pt-1 border-t border-white/5">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-[11px] text-stone-500 hover:text-stone-300 transition underline underline-offset-4 cursor-pointer"
            >
              Continue browsing as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
