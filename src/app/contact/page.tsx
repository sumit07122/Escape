import React from 'react';
import Link from 'next/link';
import { Phone, MessageSquare, MapPin, Mail, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { CONTACT_INFO, TRIP_METADATA } from '@/lib/constants';

export const metadata = {
  title: 'Contact Trip Coordinators | GLA Himalayan Escape',
  description: 'Reach out to the GLA Himalayan Escape trip coordinators for assistance, registrations, and emergency support.',
};

export default function ContactPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
          24/7 EXPEDITION DESK
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Contact Trip Coordinators
        </h1>
        <p className="text-sm text-zinc-400">
          We are here to help you before, during, and after your Himalayan journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Coordinator */}
        <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                PRIMARY COORDINATOR
              </span>
              <h3 className="text-xl font-bold text-white">Trip Lead Desk</h3>
              <p className="text-xs text-zinc-400">Seat assignments & departures</p>
            </div>
          </div>

          <div className="text-2xl font-black text-white font-mono">
            {CONTACT_INFO.coordinatorPhone1}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={`tel:${CONTACT_INFO.coordinatorPhone1}`}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center border border-zinc-700 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call Now</span>
            </a>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp1}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-green-950 hover:bg-green-900 border border-green-600/50 text-green-300 font-bold text-xs text-center flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-green-400" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Secondary Coordinator */}
        <div className="glass-card rounded-3xl p-8 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                SUPPORT DESK
              </span>
              <h3 className="text-xl font-bold text-white">Trip Support Team</h3>
              <p className="text-xs text-zinc-400">Payments, receipts & referrals</p>
            </div>
          </div>

          <div className="text-2xl font-black text-white font-mono">
            {CONTACT_INFO.coordinatorPhone2}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={`tel:${CONTACT_INFO.coordinatorPhone2}`}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center border border-zinc-700 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-orange-400" />
              <span>Call Now</span>
            </a>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp2}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-green-950 hover:bg-green-900 border border-green-600/50 text-green-300 font-bold text-xs text-center flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-green-400" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Emergency & Address Desk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Emergency Contacts
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Police Helpline</span>
              <span className="text-base font-black text-white">100</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Ambulance Emergency</span>
              <span className="text-base font-black text-white">108</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 italic">
            * All luxury buses are equipped with commercial first-aid kits and emergency protocol guidelines.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            Reporting Location
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            GLA University Mathura, 17km Stone, NH-2, Mathura-Delhi Road, Mathura, Uttar Pradesh 281406
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>Reporting: Day 1 at 04:30 PM (Bus Bay / Main Gate)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
