import React from 'react';
import Link from 'next/link';
import { Mountain, Phone, MessageSquare, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { TRIP_METADATA, CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050d09] border-t border-white/10 pt-14 pb-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Safety & Route Notice */}
        <div className="mb-10 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-300 uppercase tracking-wide text-xs">
              Official Safety & Route Notice
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {TRIP_METADATA.disclaimer}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">GLA HIMALAYAN ESCAPE</span>
                <p className="text-[10px] text-orange-400 font-semibold uppercase">MANALI × KASOL</p>
              </div>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Official expedition starting and ending at GLA University Mathura campus. Flat ₹6,200 per traveller with ₹1,000 reservation deposit.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/trip" className="hover:text-white transition-colors">Trip Overview</Link></li>
              <li><Link href="/itinerary" className="hover:text-white transition-colors">6-Day Itinerary</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/book" className="hover:text-emerald-400 font-bold transition-colors">Book Seat Now</Link></li>
            </ul>
          </div>

          {/* Policies & Passes */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Customer Portal</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/my-booking" className="hover:text-white transition-colors">My Booking</Link></li>
              <li><Link href="/ticket" className="hover:text-white transition-colors">Digital QR Ticket</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cancellation" className="hover:text-white transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Coordinators</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`tel:${CONTACT_INFO.coordinatorPhone1}`} className="hover:text-white">
                  {CONTACT_INFO.coordinatorPhone1}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <a href={`tel:${CONTACT_INFO.coordinatorPhone2}`} className="hover:text-white">
                  {CONTACT_INFO.coordinatorPhone2}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>GLA University, Mathura</span>
              </div>
              <div className="pt-2">
                <Link href="/login" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Login</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} GLA Himalayan Escape. All rights reserved.</p>
          <p>Origin: GLA University, Mathura • 75 Capacity</p>
        </div>
      </div>
    </footer>
  );
}
