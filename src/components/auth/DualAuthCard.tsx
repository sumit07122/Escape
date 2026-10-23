'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, User, Phone, CheckCircle2 } from 'lucide-react';

interface DualAuthCardProps {
  returnUrl?: string;
  onAuthSuccess?: (user: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    image?: string | null;
    role?: string;
  }) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function DualAuthCard({
  returnUrl = '/book',
  onAuthSuccess,
  title = 'Student Mountain Expedition Sign In',
  subtitle = 'Sign in or create an account to reserve your coach seats and access your digital QR boarding pass.',
  compact = false,
}: DualAuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'SIGN_IN' | 'REGISTER'>('SIGN_IN');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length <= 10) {
      setPhone(raw);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage('Mobile number must start with 6, 7, 8, or 9.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'REGISTER' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'SIGN_IN' ? '/api/auth/login-phone' : '/api/auth/register-phone';
      const payload = mode === 'SIGN_IN'
        ? { phone: cleanPhone, password }
        : { phone: cleanPhone, password, name: name.trim() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
      } else {
        const successText = mode === 'SIGN_IN'
          ? 'Signed in successfully! Transitioning...'
          : 'Account created successfully! Welcome aboard...';
        setSuccessMessage(successText);

        if (onAuthSuccess && data.user) {
          setTimeout(() => {
            onAuthSuccess(data.user);
          }, 400);
        } else {
          setTimeout(() => {
            router.push(returnUrl);
            router.refresh();
          }, 400);
        }
      }
    } catch {
      setErrorMessage('Network connection error. Please verify your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto bg-white rounded-3xl border border-[#D8D2C4] shadow-sm space-y-5 text-left ${compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8'}`}>
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-black text-[#171918] tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-[#646864] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Primary OAuth: Continue with Google */}
      <div className="space-y-3 pt-1">
        <a
          href={`/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[#D8D2C4] bg-white hover:bg-[#F7F5EF] text-[#171918] font-bold text-xs shadow-sm transition-all hover:border-[#B4AA96] group"
        >
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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

        {/* Subtle Divider */}
        <div className="relative flex py-1.5 items-center">
          <div className="flex-grow border-t border-[#D8D2C4]" />
          <span className="flex-shrink mx-3 text-[10px] text-[#646864] uppercase font-bold tracking-wider">
            — OR WITH PHONE NUMBER —
          </span>
          <div className="flex-grow border-t border-[#D8D2C4]" />
        </div>
      </div>

      {/* Tabs: Sign In vs Create Account */}
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

      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'REGISTER' && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#171918] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#163C32]" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* Mobile Number with Fixed +91 Prefix */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#171918] uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#163C32]" />
            <span>Mobile Number</span>
          </label>
          <div className="relative flex rounded-xl border border-[#D8D2C4] bg-[#F7F5EF] overflow-hidden focus-within:border-[#163C32] focus-within:bg-white transition-colors">
            <div className="flex items-center justify-center px-3 border-r border-[#D8D2C4] bg-[#EAE6DC] text-xs font-bold text-[#163C32] select-none">
              +91
            </div>
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={handlePhoneChange}
              placeholder="10-digit mobile number"
              className="w-full px-3.5 py-2.5 bg-transparent text-xs text-[#171918] focus:outline-none tracking-wide"
            />
          </div>
        </div>

        {/* Password with Show/Hide Toggle */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#171918] uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#163C32]" />
            <span>Password</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'REGISTER' ? 'Minimum 6 characters' : 'Enter your password'}
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] text-xs text-[#171918] focus:border-[#163C32] focus:bg-white focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#646864] hover:text-[#171918] transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#163C32] hover:bg-[#0F2A23] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all mt-2 disabled:opacity-50 cursor-pointer"
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

      {/* Switch mode footer */}
      <p className="text-[11px] text-[#646864] text-center leading-relaxed pt-1">
        {mode === 'SIGN_IN' ? (
          <>
            Don&apos;t have an account yet?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setErrorMessage(null);
              }}
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
              onClick={() => {
                setMode('SIGN_IN');
                setErrorMessage(null);
              }}
              className="font-bold text-[#163C32] hover:underline"
            >
              Sign in here
            </button>
          </>
        )}
      </p>
    </div>
  );
}
