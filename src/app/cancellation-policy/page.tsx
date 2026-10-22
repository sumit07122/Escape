import React from 'react';

export const metadata = {
  title: 'Cancellation & Refund Policy | Himalayan Escape — Student Mountain Expedition',
  description: 'Cancellation timelines, refund rules, and reservation policies for the independent student expedition.',
};

export default function CancellationPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8 bg-[#F7F5EF] text-[#171918]">
      <div className="space-y-2 border-b border-[#D8D2C4] pb-4">
        <span className="text-xs font-bold text-[#D87945] uppercase tracking-widest">
          POLICY GUIDELINES
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#171918]">
          Cancellation & Refund Policy
        </h1>
        <p className="text-xs text-[#646864]">Effective for November 2026 Himalayan Expedition</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-[#171918]/80 leading-relaxed bg-white p-6 sm:p-8 rounded-2xl border border-[#D8D2C4]">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">1. Reservation Amount (₹1,000)</h2>
          <p>
            The ₹1,000 reservation fee immediately commits bus seats, resort room blocks, and administrative logistics. It is non-refundable upon cancellation by the traveller. However, seat transfers to another verified student are permitted up to 7 days before departure subject to coordinator approval.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">2. Full Package Cancellation Timeline</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[#646864]">
            <li><strong>More than 15 days before departure:</strong> 70% refund of balance paid (excluding reservation amount).</li>
            <li><strong>7 to 15 days before departure:</strong> 40% refund of balance paid.</li>
            <li><strong>Less than 7 days before departure:</strong> No refund applicable due to advance hotel & transport lock-in.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">3. Force Majeure & Weather Delays</h2>
          <p>
            In the event that natural calamities, severe landslides, or official government road closures prevent departure from Mathura, coordinators will reschedule the expedition or refund payments net of unrecoverable third-party commitments.
          </p>
        </section>
      </div>
    </div>
  );
}
