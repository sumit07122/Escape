'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Compass, Mountain, Sparkles, MapPin, Flame } from 'lucide-react';

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
    title: 'Kasol Riverside Camping',
    subtitle: 'Pitching tents under deodar pines beside Parvati River',
    altitude: '5,180 FT',
    tag: 'RIVERSIDE CAMPING',
    description: 'Camp under starry skies beside the rushing turquoise rapids of Parvati River. Cozy alpine tents, fresh pine air, and starlit gatherings with fellow travellers.',
    image: '/images/kasol-river.jpg',
  },
  {
    title: 'Manikaran Sahib & Hot Springs',
    subtitle: 'Sacred thermal sulphur baths & ancient temples',
    altitude: '5,774 FT',
    tag: 'SPIRITUAL & CULTURE',
    description: 'Experience the revered Sikh Gurudwara and holy Lord Shiva temple. Soak in therapeutic natural geothermal sulphur springs beside the icy river waters.',
    image: '/images/manikaran.jpg',
  },
  {
    title: 'Manali Local Sightseeing & Cafés',
    subtitle: 'Hadimba Temple, 3-garden hotel & Old Manali lanes',
    altitude: '6,726 FT',
    tag: 'HERITAGE & LEISURE',
    description: 'Explore the 16th-century wooden pagoda Hadimba Temple in Dhungri forest, Vashisht temple, Van Vihar, and bohemian cobblestone café streets in Old Manali.',
    image: '/images/old-manali.jpg',
  },
  {
    title: 'Solang Valley Snow Adventures',
    subtitle: 'High-altitude snow slopes & alpine adventure bowl',
    altitude: '8,400 FT',
    tag: 'SNOW & ADVENTURE',
    description: 'The premier mountain adventure playground. Carve through powdery snow slopes with optional paragliding, skiing, and ATV rides (self-paid on-site).',
    image: '/images/solang-valley.jpg',
  },
  {
    title: 'Atal Tunnel & Sissu Valley',
    subtitle: '9.02 km engineering marvel to frozen waterfalls',
    altitude: '10,170 FT',
    tag: 'HIGH-ALTITUDE PASS',
    description: 'Drive beneath the Pir Panjal mountain range into Lahaul Valley. Explore frozen Sissu waterfall and breathtaking Himalayan landscape panoramas.',
    image: '/hero-mountain.jpg',
  },
  {
    title: 'Jogini Waterfall Nature Trek',
    subtitle: 'Pine wood trail & cascading mountain streams',
    altitude: '7,100 FT',
    tag: 'SCENIC TREK',
    description: 'A picturesque hike through traditional Himachali apple orchards and dense cedar groves to the dramatic tiered waters of Jogini Falls.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Christmas Celebration on Mall Road',
    subtitle: 'Festive lights, carols, street shopping & winter cafés',
    altitude: '6,700 FT',
    tag: 'CHRISTMAS SPECIAL',
    description: 'Celebrate Christmas in the mountains with sparkling tree lights, seasonal carols, hot cocoa in quaint cafés, and festive cheer along Manali Mall Road.',
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Campfire, Music & DJ Night',
    subtitle: 'Warm bonfires, DJ beats & lifelong college bonds',
    altitude: 'PARVATI & BEAS',
    tag: 'NIGHTLIFE & VIBES',
    description: 'Warm evening bonfires in Kasol and Manali. Dance to upbeat music, share road trip stories, and forge unforgettable memories under the winter stars.',
    image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
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

  useEffect(() => {
    if (reducedMotion || isPaused || !isVisible) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [handleNext, isPaused, reducedMotion, isVisible]);

  const current = DESTINATIONS[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
  };

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#163C32]">
            <Compass className="w-4 h-4 text-[#D87945]" />
            <span>Christmas Special Highlights</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#171918] tracking-tight">
            Destinations & Experiences
          </h2>
          <p className="text-xs sm:text-sm text-[#646864] max-w-lg">
            Eight iconic mountain stops across Parvati Valley, Kullu, and Manali.
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <button
            onClick={handlePrev}
            aria-label="Previous destination"
            className="w-10 h-10 rounded-full border border-[#D8D2C4] bg-white flex items-center justify-center text-[#171918] hover:bg-[#edf3ef] transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-[#163C32] px-2 tabular-nums">
            {currentIndex + 1} / {DESTINATIONS.length}
          </span>
          <button
            onClick={handleNext}
            aria-label="Next destination"
            className="w-10 h-10 rounded-full border border-[#D8D2C4] bg-white flex items-center justify-center text-[#171918] hover:bg-[#edf3ef] transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Feature Slide Card */}
      <div
        className="relative rounded-3xl overflow-hidden bg-[#163C32] text-white shadow-xl min-h-[460px] sm:min-h-[500px] flex flex-col justify-end p-6 sm:p-10 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 -z-10">
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061412] via-[#061412]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#f1c39e] text-[#17231f]">
              {current.tag}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
              {current.altitude}
            </span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {current.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#f1c39e] font-semibold">
            {current.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed font-normal pt-1">
            {current.description}
          </p>
        </div>
      </div>
    </section>
  );
}
