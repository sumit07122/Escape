'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Compass, Mountain, Sparkles } from 'lucide-react';

interface DestinationSlide {
  title: string;
  subtitle: string;
  altitude: string;
  tag: string;
  description: string;
  image: string;
}

const DESTINATIONS: DestinationSlide[] = [
  {
    title: 'Old Manali & Cafes',
    subtitle: 'Cobblestone village lanes & live acoustic vibes',
    altitude: '6,726 FT',
    tag: 'CULTURE & CAFES',
    description: 'Breathe in the scent of pine woods, explore historic cedar architecture, and unwind in world-famous bohemian mountain cafes with panoramic Beas valley views.',
    image: '/images/old-manali.jpg',
  },
  {
    title: 'Solang Valley & Atal Tunnel',
    subtitle: 'High-altitude snow trails & alpine thrills',
    altitude: '8,400 FT',
    tag: 'SNOW & ADVENTURE',
    description: 'Traverse the legendary engineering marvel Atal Tunnel into Sissu and carve through fresh Himalayan powdery snow in Solang Valley.',
    image: '/images/solang-valley.jpg',
  },
  {
    title: 'Kasol Riverside & Parvati Valley',
    subtitle: 'Turquoise glacial currents under starry skies',
    altitude: '5,180 FT',
    tag: 'NATURE & CHILL',
    description: 'Camp beside the turquoise rapids of the roaring Parvati River, surrounded by towering deodar trees and bonfire nights with fellow college explorers.',
    image: '/images/kasol-river.jpg',
  },
  {
    title: 'Manikaran Sahib & Hot Springs',
    subtitle: 'Sacred steaming thermal baths & serenity',
    altitude: '5,774 FT',
    tag: 'SPIRITUAL & RELAXATION',
    description: 'Experience natural geothermal hot springs beside the rushing river at the historic Manikaran Sahib Gurudwara and ancient Shiva Temple.',
    image: '/images/manikaran.jpg',
  },
  {
    title: 'Tosh Alpine Trek',
    subtitle: 'Epic mountain panoramas & Himalayan peaks',
    altitude: '7,874 FT',
    tag: 'ALPINE TREKKING',
    description: 'Hike through terraced alpine meadows and pine forests to high viewpoints overlooking the snow-crowned Parvati peaks and Tosh glacier streams.',
    image: '/images/tosh.jpg',
  },
];

export default function DestinationCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % DESTINATIONS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + DESTINATIONS.length) % DESTINATIONS.length);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setIsVisible(!document.hidden);
    updatePreference();
    updateVisibility();
    preference.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      preference.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  // Gently advance the carousel while it is visible and motion is allowed.
  useEffect(() => {
    if (isPaused || reducedMotion || !isVisible) return;
    const interval = window.setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [isPaused, handleNext, reducedMotion, isVisible]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
  };

  const current = DESTINATIONS[currentIndex];

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false); }}
    >
      <div className="space-y-4 mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#163C32]/10 text-[#163C32] text-xs font-bold uppercase tracking-widest mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>EXPEDITION HIGHLIGHTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#171918] tracking-tight">
            Curated Himalayan Destinations
          </h2>
          <p className="text-sm text-[#646864] max-w-xl mt-1">
            Explore the handpicked destinations across Manali, Parvati Valley, and Kasol included in your 6D/5N journey.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="w-10 h-10 rounded-full border border-[#D8D2C4] bg-white hover:bg-[#F7F5EF] flex items-center justify-center text-[#171918] hover:border-[#163C32] shadow-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-xs font-bold text-[#646864] px-2">
            <span className="text-[#163C32]">{currentIndex + 1}</span> / {DESTINATIONS.length}
          </div>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="w-10 h-10 rounded-full border border-[#D8D2C4] bg-white hover:bg-[#F7F5EF] flex items-center justify-center text-[#171918] hover:border-[#163C32] shadow-sm transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Carousel Card */}
      <div
        className="relative w-full h-[460px] sm:h-[500px] rounded-3xl overflow-hidden border border-[#D8D2C4] shadow-xl group touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={current.image}
            alt={current.title}
            fill
            sizes="100vw"
            priority
            className="object-cover object-center transition-all duration-700 ease-out scale-100 group-hover:scale-105"
          />
          {/* Multi-stage Atmospheric Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/70 via-stone-950/30 to-transparent z-10" />
        </div>

        {/* Floating Altitude & Category Badges */}
        <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-full bg-[#163C32]/90 backdrop-blur-md text-white font-black text-[11px] tracking-wider uppercase border border-white/20 shadow-sm flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            <span>{current.altitude}</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#D87945]/90 backdrop-blur-md text-white font-bold text-[11px] tracking-wider uppercase border border-white/20 shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{current.tag}</span>
          </span>
        </div>

        {/* Slide Content */}
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 z-20 max-w-2xl text-white space-y-2.5">
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {current.title}
          </h3>
          <p className="text-sm sm:text-base font-semibold text-stone-200">
            {current.subtitle}
          </p>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light hidden sm:block">
            {current.description}
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 right-6 z-20 hidden sm:flex items-center gap-2">
          {DESTINATIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-[#D87945]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
