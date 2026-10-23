'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SCENES = [
  {
    image: '/images/solang-valley.jpg',
    alt: 'Snow covered alpine valley in Solang near Manali',
    eyebrow: 'MANALI & SOLANG VALLEY',
    title: 'Alpine snow trails, cedar forests & high mountain passes',
  },
  {
    image: '/images/kasol-river.jpg',
    alt: 'Parvati River flowing through Kasol',
    eyebrow: 'PARVATI VALLEY & KASOL',
    title: 'Turquoise glacial streams and riverside mountain stays',
  },
  {
    image: '/images/old-manali.jpg',
    alt: 'Cedar forest lanes and cafes in Old Manali',
    eyebrow: 'OLD MANALI',
    title: 'Pine-scented lanes, mountain cafes and slow evenings',
  },
  {
    image: '/images/manikaran.jpg',
    alt: 'Manikaran Sahib in Parvati Valley',
    eyebrow: 'MANIKARAN SAHIB',
    title: 'Sacred hot springs beside the rushing Parvati River',
  },
];

function ScenicCard({ scene, compact = false }: { scene: (typeof SCENES)[number]; compact?: boolean }) {
  return (
    <article className={`scenic-fade-in group relative isolate overflow-hidden rounded-[1.75rem] border border-white/15 shadow-[0_24px_60px_rgba(10,25,20,0.2)] ${compact ? 'h-[300px] md:h-[440px]' : 'h-[300px] md:col-span-2 md:h-[440px]'}`}>
      <Image
        src={scene.image}
        alt={scene.alt}
        fill
        sizes={compact ? '(max-width: 768px) 100vw, 34vw' : '(max-width: 768px) 100vw, 66vw'}
        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07130f]/95 via-[#07130f]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07130f]/30 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        <span className="inline-flex rounded-full border border-white/20 bg-[#10231f]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[#ffcf76] shadow-lg backdrop-blur-sm">
          {scene.eyebrow}
        </span>
        <h3 style={{ color: '#ffffff' }} className={`mt-3 max-w-2xl font-semibold leading-tight tracking-tight !text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.85)] ${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
          {scene.title}
        </h3>
      </div>
    </article>
  );
}

export default function HomeScenicCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const next = useCallback(() => setIndex((value) => (value + 1) % SCENES.length), []);
  const previous = useCallback(() => setIndex((value) => (value - 1 + SCENES.length) % SCENES.length), []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || document.hidden) return;
    const timer = window.setInterval(next, 6500);
    return () => window.clearInterval(timer);
  }, [next, paused, reducedMotion]);

  const secondIndex = (index + 1) % SCENES.length;

  return (
    <section
      aria-label="Himalayan destination highlights"
      className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#163C32]/70">A glimpse of the route</p>
        <div className="flex items-center gap-2">
          <span className="min-w-10 text-center text-xs font-semibold tabular-nums text-[#53635b]" aria-live="polite">{index + 1} / {SCENES.length}</span>
          <button type="button" onClick={previous} aria-label="Previous destination image" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8d2c4] bg-white text-[#163C32] shadow-sm transition hover:border-[#163C32] hover:bg-[#edf3ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163C32]"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={next} aria-label="Next destination image" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8d2c4] bg-white text-[#163C32] shadow-sm transition hover:border-[#163C32] hover:bg-[#edf3ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163C32]"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5" aria-live="off">
        <ScenicCard key={index} scene={SCENES[index]} />
        <ScenicCard key={secondIndex} scene={SCENES[secondIndex]} compact />
      </div>
    </section>
  );
}
