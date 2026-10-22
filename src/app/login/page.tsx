'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/book';
  const urlError = searchParams.get('error');

  const [activeTab, setActiveTab] = useState<'TRAVELLER' | 'COORDINATOR'>('TRAVELLER');

  // Coordinator admin states
  const [adminEmail, setAdminEmail] = useState('admin@glaescape.in');
  const [adminPassword, setAdminPassword] = useState('GLAAdmin@2026#Secure');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Demo customer loading
  const [demoLoading, setDemoLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || 'Invalid coordinator credentials');
      } else {
        router.push('/admin');
      }
    } catch {
      setAdminError('Connection failed. Please check server.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDemoTravellerLogin = () => {
    setDemoLoading(true);
    const email = 'aryan.sharma@gla.ac.in';
    const name = 'Aryan Sharma';
    window.location.href = `/api/auth/google?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
        {/* Toggle between Traveller & Admin */}
        <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('TRAVELLER')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'TRAVELLER'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Traveller Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COORDINATOR')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'COORDINATOR'
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Coordinator Portal
          </button>
        </div>

        {urlError && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-600/50 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{urlError}</span>
          </div>
        )}

        {/* TAB 1: TRAVELLER (GOOGLE ONLY) */}
        {activeTab === 'TRAVELLER' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white text-zinc-900 flex items-center justify-center mx-auto shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              </div>
              <h1 className="text-2xl font-black text-white">Traveller Sign In</h1>
              <p className="text-xs text-zinc-400">
                Sign in with Google to access your bookings, tickets, and seat allocation.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-sm shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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

              <button
                type="button"
                onClick={handleDemoTravellerLogin}
                disabled={demoLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2"
              >
                {demoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Instant GLA Student Sign-in (Demo Mode)</span>}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <span className="font-bold text-zinc-300 block">Passwordless Security</span>
              <p>No passwords to remember. Your Google account automatically verifies and retrieves your tickets.</p>
            </div>
          </div>
        )}

        {/* TAB 2: COORDINATOR / ADMIN ONLY */}
        {activeTab === 'COORDINATOR' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Coordinator Portal</h2>
              <p className="text-xs text-zinc-400">
                Sign in to manage bus seating, QR gate scanner, payments and expedition operations.
              </p>
            </div>

            {adminError && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-600/50 flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@glaescape.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                {adminLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Admin Console</span>}
              </button>
            </form>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <span className="font-bold text-zinc-300 block">Default Seed Admin Credentials:</span>
              <p>Email: <span className="font-mono text-emerald-400">admin@glaescape.in</span></p>
              <p>Password: <span className="font-mono text-emerald-400">GLAAdmin@2026#Secure</span></p>
            </div>
          </div>
        )}

        <div className="text-center pt-2 border-t border-zinc-800">
          <Link href="/my-booking" className="text-xs text-zinc-400 hover:text-white">
            Looking for your booking or boarding pass? <span className="text-emerald-400 underline">Click here</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
