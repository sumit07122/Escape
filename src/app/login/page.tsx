'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle, ArrowRight, User, Phone, CheckCircle2 } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/book';
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState<'SIGN_IN' | 'REGISTER'>('SIGN_IN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'SIGN_IN') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || 'Invalid email or password');
        } else {
          setSuccessMessage('Logged in successfully! Redirecting...');
          setTimeout(() => {
            router.push(returnUrl);
            router.refresh();
          }, 400);
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || 'Failed to create account');
        } else {
          setSuccessMessage('Account created successfully! Redirecting...');
          setTimeout(() => {
            router.push(returnUrl);
            router.refresh();
          }, 400);
        }
      }
    } catch {
      setErrorMessage('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#F7F5EF] text-[#171918]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] space-y-6 shadow-sm">
        {/* Brand Header with Official Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-[#163C32]/20 shadow-sm mx-auto">
            <Image
              src="/logo.png"
              alt="Himalayan Escape"
              width={64}
              height={64}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#171918]">HIMALAYAN ESCAPE</h1>
          <p className="text-[10px] font-bold tracking-widest text-[#D87945] uppercase">
            STUDENT MOUNTAIN EXPEDITION • 2026
          </p>
        </div>

        {/* Mode Toggle: Sign In vs Create Account */}
        <div className="flex rounded-xl bg-[#F7F5EF] p-1 border border-[#D8D2C4]">
          <button
            type="button"
            onClick={() => {
              setMode('SIGN_IN');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'SIGN_IN'
                ? 'bg-[#163C32] text-white shadow-sm'
                : 'text-[#646864] hover:text-[#171918]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'REGISTER'
                ? 'bg-[#163C32] text-white shadow-sm'
                : 'text-[#646864] hover:text-[#171918]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Alerts */}
        {urlError && !errorMessage && (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Authentication Notice</p>
              <p className="text-[11px] opacity-90">{urlError}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Top Action: Continue with Google */}
        <div className="space-y-3">
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

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#D8D2C4]" />
            <span className="flex-shrink mx-3 text-[10px] text-[#646864] uppercase font-bold tracking-wider">
              or continue with email
            </span>
            <div className="flex-grow border-t border-[#D8D2C4]" />
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#163C32]" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#163C32]" />
                  <span>Phone Number (Optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#163C32]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#163C32]" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'REGISTER' ? 'Minimum 6 characters' : 'Enter your password'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#163C32] hover:bg-[#0F2A23] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all mt-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>{mode === 'SIGN_IN' ? 'Sign In to Your Account' : 'Create Expedition Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-[#646864] text-center leading-relaxed">
          {mode === 'SIGN_IN' ? (
            <>
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('REGISTER')}
                className="font-bold text-[#163C32] hover:underline"
              >
                Create one now
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('SIGN_IN')}
                className="font-bold text-[#163C32] hover:underline"
              >
                Sign in here
              </button>
            </>
          )}
        </p>
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
