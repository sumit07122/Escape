import React from 'react';
import Link from 'next/link';
import { Mountain, Phone, MapPin, Shield } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="w-full bg-[#E7E2D8] border-t border-[#D8D2C4] pt-12 pb-10 text-[#171918]/80 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#163C32] flex items-center justify-center text-white shadow-sm">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-black text-[#171918] text-sm tracking-tight">GLA HIMALAYAN ESCAPE</span>
                <p className="text-[10px] text-[#D87945] font-bold uppercase tracking-wider">MANALI × KASOL • 6D / 5N</p>
              </div>
            </div>
            <p className="text-[#171918]/70 text-[11px] leading-relaxed">
              Official student expedition starting and ending at GLA University, Mathura. Flat ₹6,200 package with ₹1,000 reservation deposit.
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
              <li><Link href="/my-booking" className="hover:text-[#163C32] transition-colors">My Booking</Link></li>
            </ul>
          </div>

          {/* Policy Guidelines */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#171918] uppercase text-[11px] tracking-wider">Policies</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/terms" className="hover:text-[#163C32] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[#163C32] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cancellation" className="hover:text-[#163C32] transition-colors">Cancellation Policy</Link></li>
              <li>
                <Link href="/login" className="hover:text-[#163C32] flex items-center gap-1 text-[#171918]/60 pt-1">
                  <Shield className="w-3 h-3" />
                  <span>Coordinator Admin</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Contacts */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#171918] uppercase text-[11px] tracking-wider">Operational Contacts</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#163C32] shrink-0" />
                <a href={`tel:${CONTACT_INFO.coordinatorPhone1}`} className="hover:text-[#163C32]">
                  {CONTACT_INFO.coordinatorPhone1}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#163C32] shrink-0" />
                <a href={`tel:${CONTACT_INFO.coordinatorPhone2}`} className="hover:text-[#163C32]">
                  {CONTACT_INFO.coordinatorPhone2}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#171918]/70">
                <MapPin className="w-3.5 h-3.5 text-[#D87945] shrink-0" />
                <span>GLA University, Mathura (NH-19)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-[#D8D2C4] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#171918]/60">
          <p>© {new Date().getFullYear()} GLA Himalayan Escape. All rights reserved.</p>
          <p>GLA University, Mathura → Manali → Kasol → GLA • 75 Capacity</p>
        </div>
      </div>
    </footer>
  );
}
