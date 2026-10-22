'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowRight, User } from 'lucide-react';

function LoginFormContent() {
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
    <div className="w-full min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#F7F5EF] text-[#171918]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] space-y-6 shadow-sm">
        {/* Toggle between Traveller & Admin */}
        <div className="flex rounded-xl bg-[#F7F5EF] p-1 border border-[#D8D2C4]">
          <button
            onClick={() => setActiveTab('TRAVELLER')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TRAVELLER'
                ? 'bg-[#163C32] text-white shadow-sm'
                : 'text-[#646864] hover:text-[#171918]'
            }`}
          >
            Traveller Login
          </button>
          <button
            onClick={() => setActiveTab('COORDINATOR')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'COORDINATOR'
                ? 'bg-[#163C32] text-white shadow-sm'
                : 'text-[#646864] hover:text-[#171918]'
            }`}
          >
            Coordinator Portal
          </button>
        </div>

        {urlError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{urlError}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: TRAVELLER (GOOGLE OAUTH ONLY)                     */}
        {/* ======================================================== */}
        {activeTab === 'TRAVELLER' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#163C32]/10 text-[#163C32] flex items-center justify-center mx-auto mb-2">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-[#171918]">Traveller Account</h2>
              <p className="text-xs text-[#646864]">
                Sign in with your Google account to book seats and access your boarding pass.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={`/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[#D8D2C4] bg-white hover:bg-[#F7F5EF] text-[#171918] font-bold text-xs shadow-sm transition-all hover:border-[#B4AA96]"
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

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#D8D2C4]" />
                <span className="flex-shrink mx-3 text-[10px] text-[#646864] uppercase font-bold tracking-wider">
                  Test Sandbox
                </span>
                <div className="flex-grow border-t border-[#D8D2C4]" />
              </div>

              <button
                type="button"
                onClick={handleDemoTravellerLogin}
                disabled={demoLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F7F5EF] hover:bg-[#E7E2D8] border border-[#D8D2C4] text-[#163C32] font-bold text-xs transition-colors"
              >
                {demoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#163C32]" />
                ) : (
                  <>
                    <span>1-Click Test Login (Aryan Sharma)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-[#646864] text-center leading-relaxed">
              Fast, passwordless login with your verified Google account.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: COORDINATOR / ADMIN LOGIN                         */}
        {/* ======================================================== */}
        {activeTab === 'COORDINATOR' && (
          <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#D87945]/10 text-[#D87945] flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-[#171918]">Coordinator Portal</h2>
              <p className="text-xs text-[#646864]">
                Gate check-in desk, bus manifests, and operations management.
              </p>
            </div>

            {adminError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#163C32]" />
                <span>Coordinator Email</span>
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#163C32]" />
                <span>Access Password</span>
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={adminLoading}
              className="w-full py-3 rounded-xl bg-[#163C32] hover:bg-[#0F2A23] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all mt-2"
            >
              {adminLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Enter Coordinator Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-[75vh] flex items-center justify-center text-xs">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
