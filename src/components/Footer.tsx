import React from 'react';
import Link from 'next/link';
import { Mountain, Phone, MessageSquare, AlertTriangle, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { TRIP_METADATA, CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050d09] border-t border-white/10 pt-16 pb-12 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Important Weather & Road Disclaimer Banner */}
        <div className="mb-12 p-5 rounded-2xl bg-amber-950/40 border border-amber-600/30 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
              Official Safety & Route Notice
            </h4>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {TRIP_METADATA.disclaimer}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight">
                  GLA HIMALAYAN ESCAPE
                </span>
                <p className="text-xs text-orange-400 font-semibold">MANALI × KASOL • 6D / 5N</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {TRIP_METADATA.tagline}
            </p>
            <p className="text-xs text-zinc-400">
              Exclusive expedition starting and ending at GLA University, Mathura. Featuring luxury 2x2 AC coaches with interactive BookMyShow-style seat booking and instant digital QR passes.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore Expedition</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/itinerary" className="hover:text-emerald-400 transition-colors">
                  Detailed 6-Day Itinerary
                </Link>
              </li>
              <li>
                <Link href="/trip-details" className="hover:text-emerald-400 transition-colors">
                  Expedition Details & Highlights
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition-colors">
                  Pricing & 5+1 Group Offer
                </Link>
              </li>
              <li>
                <Link href="/inclusions" className="hover:text-emerald-400 transition-colors">
                  Inclusions & Exclusions
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-emerald-400 transition-colors">
                  Scenic Gallery & Memories
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Policies & Booking</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/my-booking" className="hover:text-emerald-400 transition-colors">
                  Track My Booking
                </Link>
              </li>
              <li>
                <Link href="/my-ticket" className="hover:text-emerald-400 transition-colors">
                  Download Digital QR Ticket
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="hover:text-emerald-400 transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Admin & Coordinator Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts & Emergency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact & Emergency</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${CONTACT_INFO.coordinatorPhone1}`} className="hover:text-white font-medium">
                  {CONTACT_INFO.coordinatorPhone1} (Trip Coordinator)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400 shrink-0" />
                <a href={`tel:${CONTACT_INFO.coordinatorPhone2}`} className="hover:text-white font-medium">
                  {CONTACT_INFO.coordinatorPhone2} (Trip Support)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>GLA University, NH-2, Mathura, UP</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center gap-4 text-xs font-semibold text-zinc-300">
                <span className="text-red-400">Police: 100</span>
                <span className="text-red-400">Ambulance: 108</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} GLA Himalayan Escape. Official student-group expedition platform.</p>
          <p className="flex items-center gap-3">
            <span>Mathura → Manali → Kasol</span>
            <span>•</span>
            <span className="text-orange-400 font-semibold">₹1,000 Reservation</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
