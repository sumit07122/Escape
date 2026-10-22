import React from 'react';
import Link from 'next/link';
import { Mountain, Camera, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Expedition Gallery | GLA Himalayan Escape',
  description: 'Scenic vistas, pine trails, riverbanks, and memories from Manali and Kasol.',
};

const DESTINATIONS = [
  {
    title: 'Solang Valley Snow Point',
    location: 'Solang Valley, Manali',
    desc: 'High-altitude snow slopes surrounded by towering Pir Panjal peaks. Adventure hub for paragliding and zorbing.',
    tag: 'Snow & Adventure',
  },
  {
    title: 'Atal Tunnel & Sissu Valley',
    location: 'Lahaul Valley (3,048 m)',
    desc: 'World’s longest highway tunnel above 10,000 feet leading to the breathtaking trans-Himalayan waterfalls of Sissu.',
    tag: 'Engineering Wonder',
  },
  {
    title: 'Hidimba Devi Temple & Deodars',
    location: 'Dhungri Forest, Old Manali',
    desc: '16th-century wooden pagoda temple amidst centuries-old giant cedar deodars and mystical forest trails.',
    tag: 'Heritage & Nature',
  },
  {
    title: 'Parvati Riverbank & Kasol Trails',
    location: 'Kasol, Parvati Valley',
    desc: 'Turquoise glacial waters rushing past alpine pines, wooden bridges, and bohemian riverside cafes.',
    tag: 'Alpine Peace',
  },
  {
    title: 'Manikaran Sahib Gurudwara',
    location: 'Manikaran, Parvati Valley',
    desc: 'Historic Sikh and Hindu pilgrimage shrine famed for its sacred natural boiling sulphur hot springs and community langar.',
    tag: 'Spiritual Heritage',
  },
  {
    title: 'Campfire & Starry Valley Night',
    location: 'Kasol Riverside Campsite',
    desc: 'Evening group bonding around the warm campfire with acoustic tunes, shared stories, and memories for life.',
    tag: 'Group Experience',
  },
];

export default function GalleryPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Camera className="w-4 h-4" /> VISUAL JOURNEY
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Expedition Gallery & Destinations
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          From the pine-scented valleys of Old Manali to the mystic mist of Parvati River in Kasol.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DESTINATIONS.map((dest, i) => (
          <div
            key={i}
            className="glass-card rounded-3xl p-6 border border-zinc-800 space-y-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                <Mountain className="w-12 h-12 text-emerald-600/40" />
                <span className="absolute bottom-3 left-3 text-[10px] font-black px-2 py-0.5 rounded bg-zinc-900/80 text-emerald-300 border border-zinc-700">
                  {dest.tag}
                </span>
              </div>

              <div>
                <span className="text-xs text-orange-400 font-semibold">{dest.location}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{dest.title}</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{dest.desc}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <span className="text-[11px] text-zinc-500">GLA Himalayan Escape 2026</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-6">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg glow-orange"
        >
          <span>JOIN THE EXPEDITION</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
