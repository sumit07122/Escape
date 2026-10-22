import React from 'react';

export const metadata = {
  title: 'Privacy Policy | GLA Himalayan Escape',
  description: 'How we collect, protect, and use traveller information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          DATA PROTECTION
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400">Last updated: October 2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
        <p>
          We collect traveller full name, mobile number, email, gender, emergency contact person details, and bus seat preferences strictly for group coordination, coach manifest preparation, hotel rooming, and emergency assistance.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">2. Payment Security</h2>
        <p>
          Payments are processed securely via Razorpay with industry-standard 256-bit SSL encryption. We never store credit/debit card numbers or UPI PINs on our servers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">3. Digital QR Code Privacy</h2>
        <p>
          Digital QR boarding tickets contain cryptographically secure random verification tokens, not raw personal identity details. Verification takes place through authorized admin scanner endpoints only.
        </p>
      </section>
    </div>
  );
}
