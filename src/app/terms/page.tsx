import { AlertTriangle } from 'lucide-react';
import { TRIP_METADATA } from '@/lib/constants';

export const metadata = {
  title: 'Terms & Conditions | Himalayan Escape — Student Mountain Expedition',
  description: 'Terms of participation, behavioral guidelines, and safety conditions for the independent student expedition.',
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8 bg-[#F7F5EF] text-[#171918]">
      <div className="space-y-2 border-b border-[#D8D2C4] pb-4">
        <span className="text-xs font-bold text-[#D87945] uppercase tracking-widest">
          EXPEDITION AGREEMENT
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#171918]">
          Terms & Conditions
        </h1>
        <p className="text-xs text-[#646864]">Last updated: October 2026</p>
      </div>

      <div className="p-4 rounded-xl bg-[#E7E2D8] border border-[#D8D2C4] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#D87945] shrink-0 mt-0.5" />
        <p className="text-xs text-[#171918]/85 leading-relaxed">{TRIP_METADATA.disclaimer}</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-[#171918]/80 leading-relaxed bg-white p-6 sm:p-8 rounded-2xl border border-[#D8D2C4]">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">1. Seat Reservation & Payment Policy</h2>
          <p>
            A reservation deposit of ₹1,000 per traveller is required to lock your coach seat. The remaining balance is ₹5,500 per traveller at the standard rate or ₹5,200 per traveller for groups of five or more, and must be cleared as scheduled by trip coordinators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">2. Route & Activity Flexibility</h2>
          <p>
            Weather, road conditions, landslides, snowfall, and local administration directives in Himachal Pradesh can impact travel schedules. High-altitude excursions to Solang Valley, Atal Tunnel, and Sissu are subject to safety clearance by local authorities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">3. Traveller Conduct & Safety</h2>
          <p>
            Travellers are expected to maintain collegiate discipline and adhere to coordinator instructions at all times. Consumption of prohibited substances or unruly conduct that risks passenger safety will result in immediate disqualification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#171918]">4. Digital Boarding Passes</h2>
          <p>
            Each traveller receives a unique digital QR boarding pass upon confirmation. This pass must be presented at the departure point (Near Main Gate, NH-2 Mathura) for check-in.
          </p>
        </section>
      </div>
    </div>
  );
}
