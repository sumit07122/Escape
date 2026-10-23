'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import DualAuthCard from '@/components/auth/DualAuthCard';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/book';
  const urlError = searchParams.get('error');

  return (
    <div className="w-full min-h-[78vh] flex items-center justify-center px-4 py-12 bg-[#F7F5EF] text-[#171918]">
      <div className="w-full max-w-md space-y-4">
        {/* Official Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-[#163C32]/20 shadow-sm mx-auto p-0.5">
            <Image
              src="/logo.png"
              alt="Himalayan Escape"
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-full"
              priority
            />
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#171918]">HIMALAYAN ESCAPE</h1>
          <p className="text-[10px] font-bold tracking-widest text-[#D87945] uppercase">
            STUDENT MOUNTAIN EXPEDITION • 2026
          </p>
        </div>

        {urlError && (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Authentication Notice</p>
              <p className="text-[11px] opacity-90">{urlError}</p>
            </div>
          </div>
        )}

        <DualAuthCard
          returnUrl={returnUrl}
          title="Expedition Account Sign In"
          subtitle="Sign in with Google or your Mobile Number to access your seat reservations and digital QR passes."
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-[75vh] flex items-center justify-center text-xs text-[#646864]">Loading authentication...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
