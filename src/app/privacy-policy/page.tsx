import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Himalayan Escape',
  description: 'How we collect, protect, and use traveller information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8 text-xs sm:text-sm text-[#171918]/80 leading-relaxed bg-[#F7F5EF]">
      <div className="space-y-2 border-b border-[#D8D2C4] pb-4">
        <span className="text-xs font-bold text-[#163C32] uppercase tracking-widest">
          DATA PROTECTION
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#171918]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#646864]">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#D8D2C4]">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">1. Information We Collect</h2>
          <p>
            We collect traveller full name, mobile number, email, gender, emergency contact person details, and coach seat preferences strictly for group coordination, bus manifest preparation, resort rooming, and student safety.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">2. Payment Security</h2>
          <p>
            Payments are processed securely via Razorpay with industry-standard 256-bit SSL encryption. We never store credit/debit card numbers or UPI PINs on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">3. Digital QR Code Privacy</h2>
          <p>
            Digital QR boarding tickets contain cryptographically secure random verification tokens, not raw personal identity details. Verification takes place through authorized campus coordinator scanner endpoints only.
          </p>
        </section>
      </div>
    </div>
  );
}
