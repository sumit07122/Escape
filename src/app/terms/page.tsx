import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle, Shield, Bus, CreditCard,
  Phone, Mail, FileText, CheckCircle2, ArrowRight
} from 'lucide-react';
import { TRIP_METADATA, CONTACT_INFO } from '@/lib/constants';

export const metadata = {
  title: 'Terms & Conditions | Himalayan Escape — Student Mountain Expedition',
  description:
    'Official terms of participation, seat reservation guidelines, payment schedule, cancellation policies, and safety rules for Himalayan Escape.',
};

export default function TermsPage() {
  return (
    <div className="w-full min-h-screen bg-[#F7F5EF] text-[#171918] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-3 border-b border-[#D8D2C4] pb-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#D87945]/15 text-[#D87945] uppercase tracking-widest border border-[#D87945]/30">
              Expedition Agreement
            </span>
            <span className="text-[11px] text-[#646864] font-medium">
              Effective Date: November 2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#171918] tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#646864] leading-relaxed max-w-3xl">
            Please read these Terms & Conditions carefully before making a seat reservation with <strong>Himalayan Escape</strong>. By using this website, completing an online booking, or boarding the expedition coach, you agree to be bound by these terms.
          </p>
        </div>

        {/* Disclaimer Card */}
        <div className="p-5 rounded-2xl bg-[#E7E2D8] border border-[#D8D2C4] flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-[#D87945] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-[#171918]/85 leading-relaxed">
            <p className="font-bold text-[#171918]">Independent Student Expedition Notice</p>
            <p>{TRIP_METADATA.disclaimer}</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-[#171918]/85 leading-relaxed bg-white p-6 sm:p-8 rounded-2xl border border-[#D8D2C4] shadow-xs">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#163C32] flex items-center gap-2">
              <span>1. Booking Eligibility & Passenger Identification</span>
            </h2>
            <p>
              Himalayan Escape is organized for university students and young adults aged 18 and older. Every traveller must provide their legal full name, verified mobile number, and emergency contact details during booking. A valid government photo ID (Aadhaar, Passport, or Voter ID) and student identity card must be carried throughout the journey for identity verification at Himachal Pradesh state border checkposts and hotel check-in.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2 pt-2 border-t border-[#E7E2D8]">
            <h2 className="text-base font-bold text-[#163C32] flex items-center gap-2">
              <span>2. Seat Reservation, 10-Minute Lock & Advance Deposit</span>
            </h2>
            <p>
              When selecting your coach seats on our interactive bus layout, selected seats are held for exactly <strong>10 minutes</strong>. If payment is not completed within this window, held seats are automatically released back to the general inventory to ensure fair availability.
            </p>
            <p>
              A non-refundable advance reservation deposit of <strong>₹1,000 per traveller</strong> is required to confirm your seat booking. This deposit commits your seat on the designated luxury 2x2 AC tourist coach and reserves resort room allotments in advance.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2 pt-2 border-t border-[#E7E2D8]">
            <h2 className="text-base font-bold text-[#163C32] flex items-center gap-2">
              <span>3. Package Pricing & Remaining Balance Schedule</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#646864]">
              <li><strong>Total Package Price:</strong> ₹6,199 per person all-inclusive.</li>
              <li><strong>Advance Reservation Deposit:</strong> ₹1,000 per traveller paid at the time of booking to permanently lock coach seats and hotel allotments.</li>
              <li><strong>Remaining Balance:</strong> ₹5,199 per traveller due before coach boarding at GLA University, Mathura, according to coordinator schedule.</li>
              <li><strong>Group Adventure Discount:</strong> A ₹600 discount is automatically applied to the entire booking total when 5 or more travellers book together under a single booking. The discount applies once per qualifying booking (not stacked, not per person), reducing the outstanding balance.</li>
              <li><strong>Balance Due Timing:</strong> The remaining balance must be settled before boarding at GLA University, Mathura. Failure to clear the balance may result in seat cancellation with forfeiture of the advance reservation deposit.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2 pt-2 border-t border-[#E7E2D8]">
            <h2 className="text-base font-bold text-[#163C32] flex items-center gap-2">
              <span>4. Cancellation & Refund Policy</span>
            </h2>
            <p>
              Our cancellation schedule is strictly governed by advance vendor lock-ins for transport coaches and mountain hotel properties:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#646864]">
              <li><strong>Reservation Deposit (₹1,000/pax):</strong> Non-refundable upon voluntary cancellation by the passenger.</li>
              <li><strong>More than 15 days before departure:</strong> 70% refund of balance paid (excluding the initial reservation deposit).</li>
              <li><strong>7 to 15 days before departure:</strong> 40% refund of balance paid.</li>
              <li><strong>Less than 7 days before departure:</strong> No refund applicable due to irreversible transport and resort commitments.</li>
              <li><strong>Seat Transfers:</strong> You may transfer your confirmed seat to another eligible verified student up to <strong>7 days before departure</strong> at zero extra charge, subject to coordinator approval.</li>
            </ul>
            <p className="text-xs text-[#646864] pt-1">
              For complete details, please review our dedicated <Link href="/cancellation" className="text-[#163C32] font-semibold underline">Cancellation & Refund Policy</Link>.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2 pt-2 border-t border-[#E7E2D8]">
            <h2 className="text-base font-bold text-[#163C32] flex items-center gap-2">
              <span>5. High-Altitude Safety, Route Changes & Force Majeure</span>
            </h2>
            <p>
              Mountain travel in Himachal Pradesh is inherently subject to weather events, snowfall, landslides, and traffic advisories along National Highway 3 / Atal Tunnel corridor. While coordinators strive to adhere to the published itinerary, excursions to Solang Valley, Atal Tunnel, Sissu, and Manikaran Sahib are contingent upon real-time local police and administrative safety clearances.
            </p>
            <p>
              In the event that extreme weather, road closures, or governmental restrictions prevent departure from Mathura, coordinators will reschedule the expedition or issue refunds net of non-recoverable supplier commitments.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2 pt-2 border-t border-[#E7E2D8]">
            <h2 className="text-base font-bold text-[#163C32] flex items-center gap-2">
              <span>6. Passenger Conduct & Zero-Tolerance Safety Rules</span>
            </h2>
            <p>
              To ensure safety and comfort for all travellers, Himalayan Escape strictly enforces:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#646864]">
              <li><strong>Zero Tolerance for Prohibited Substances:</strong> Possession or consumption of illegal narcotics or prohibited substances on board tourist coaches or hotel premises is strictly forbidden and will result in immediate disembarkation and reporting to local authorities.</li>
              <li><strong>Coordinator Instructions:</strong> Travellers must abide by reporting times, meeting points, and safety instructions provided by lead coordinators at all times.</li>
              <li><strong>Riverside Caution:</strong> Bathing or entering high-current mountain rivers (including the Parvati and Beas rivers) is strictly prohibited due to unpredictable water surges and cold currents.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2 pt-2 border-t border-[#E7E2D8]">
            <h2 className="text-base font-bold text-[#163C32] flex items-center gap-2">
              <span>7. Digital QR Boarding Passes & Reporting Desk</span>
            </h2>
            <p>
              Upon payment confirmation, a unique digital QR boarding pass is generated for each passenger. This digital pass must be presented at the departure point (Near Main Gate, NH-2, Mathura) for check-in scanning. Passes are non-transferable once checked in.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2 pt-2 border-t border-[#E7E2D8]">
            <h2 className="text-base font-bold text-[#163C32] flex items-center gap-2">
              <span>8. Privacy Policy Incorporation</span>
            </h2>
            <p>
              Our collection and processing of personal data, including Google Sign-In and Google Contacts autofill, are governed by our <Link href="/privacy-policy" className="text-[#163C32] font-semibold underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2 pt-2 border-t border-[#E7E2D8]">
            <h2 className="text-base font-bold text-[#163C32] flex items-center gap-2">
              <span>9. Support & Grievance Contact</span>
            </h2>
            <p>
              For booking assistance, seat queries, or grievance resolution, reach out directly to:
            </p>
            <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8D2C4] space-y-1 text-xs">
              <p><strong>Expedition Coordinator:</strong> Shrikant Thakur</p>
              <p><strong>Email:</strong> <a href="mailto:shrikant.thakur_cs26@gmail.com" className="text-[#163C32] underline font-semibold">shrikant.thakur_cs26@gmail.com</a></p>
              <p><strong>Hotlines:</strong> {CONTACT_INFO.coordinatorPhone1} / {CONTACT_INFO.coordinatorPhone2}</p>
              <p><strong>Reporting Location:</strong> Near Main Gate (NH-2), Mathura, Uttar Pradesh, India</p>
            </div>
          </section>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F5EF] text-[#171918] text-xs font-bold border border-[#D8D2C4] transition-colors"
          >
            Back to Homepage
          </Link>
          <Link
            href="/privacy-policy"
            className="px-5 py-2.5 rounded-xl bg-[#163C32] hover:bg-[#0f2a23] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <span>Read Privacy Policy</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
