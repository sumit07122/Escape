import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Mail } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="w-full bg-[#E7E2D8] border-t border-[#D8D2C4] pt-12 pb-10 text-[#171918]/80 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-[#163C32]/20 shadow-sm shrink-0">
                <Image
                  src="/logo.png"
                  alt="Himalayan Escape Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-black text-[#171918] text-sm tracking-tight">HIMALAYAN ESCAPE</span>
                <p className="text-[10px] text-[#D87945] font-bold uppercase tracking-wider">STUDENT EXPEDITION • MANALI × KASOL</p>
              </div>
            </div>
            <p className="text-[#171918]/70 text-[11px] leading-relaxed">
              Independent student mountain expedition. Pickup & Reporting: Near Main Gate (NH-2), Mathura. Tiered squad pricing: ₹6,500 solo / ₹6,200 for groups of 5+ with ₹1,000 advance reservation deposit.
            </p>
          </div>

          {/* Expedition Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#171918] uppercase text-[11px] tracking-wider">Expedition</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/trip" className="hover:text-[#163C32] transition-colors">Trip Overview</Link></li>
              <li><Link href="/itinerary" className="hover:text-[#163C32] transition-colors">Itinerary</Link></li>
              <li><Link href="/pricing" className="hover:text-[#163C32] transition-colors">Pricing</Link></li>
              <li><Link href="/book" className="hover:text-[#D87945] font-bold transition-colors">Book Now</Link></li>
              <li><Link href="/my-bookings" className="hover:text-[#163C32] transition-colors">My Bookings</Link></li>
            </ul>
          </div>

          {/* Policy Guidelines */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#171918] uppercase text-[11px] tracking-wider">Policies</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/terms" className="hover:text-[#163C32] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[#163C32] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cancellation" className="hover:text-[#163C32] transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>

          {/* Operational Contacts */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#171918] uppercase text-[11px] tracking-wider">Operational Contacts</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#163C32] shrink-0" />
                <a href={`tel:${CONTACT_INFO.coordinatorPhone1}`} className="hover:text-[#163C32] font-mono font-semibold">
                  {CONTACT_INFO.coordinatorPhone1}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#163C32] shrink-0" />
                <a href={`tel:${CONTACT_INFO.coordinatorPhone2}`} className="hover:text-[#163C32] font-mono font-semibold">
                  {CONTACT_INFO.coordinatorPhone2}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#171918]/70">
                <MapPin className="w-3.5 h-3.5 text-[#D87945] shrink-0" />
                <span>Pickup & Reporting: Near Main Gate (NH-2), Mathura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Developer Credit */}
        <div className="pt-6 border-t border-[#D8D2C4] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#171918]/70">
          <div>
            <p>© {new Date().getFullYear()} Himalayan Escape — Student Mountain Expedition. All rights reserved.</p>
            <p className="text-[10px] text-[#171918]/50 mt-0.5">Independent student-organized expedition. Not an officially sponsored university event.</p>
          </div>

          {/* Developer Credit */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/80 border border-[#D8D2C4] shadow-xs">
            <span className="font-extrabold text-[#171918]">
              Built by Shrikant Thakur
            </span>
            <div className="flex items-center gap-2 border-l border-[#D8D2C4] pl-3">
              <a
                href="mailto:shrikant.thakur_cs26@gmail.com"
                title="Email Shrikant Thakur"
                className="text-[#163C32] hover:text-[#D87945] transition-colors flex items-center gap-1 font-semibold"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gmail</span>
              </a>
              <span className="text-stone-300">•</span>
              <a
                href="https://instagram.com/who_sumitt"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram Profile"
                className="text-[#163C32] hover:text-[#D87945] transition-colors flex items-center gap-1 font-semibold"
              >
                <svg className="w-3.5 h-3.5 fill-current text-pink-600 shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@who_sumitt</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
