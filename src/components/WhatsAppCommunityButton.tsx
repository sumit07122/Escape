'use client';

import React, { useState } from 'react';

const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/BpzC0H0GEM6GlhslBJWDTE';

export default function WhatsAppCommunityButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-5 md:right-6 z-50 flex items-center group">
      {/* Hover Tooltip */}
      <div
        className={`absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-stone-900/90 text-white text-[11px] font-bold whitespace-nowrap shadow-xl backdrop-blur-sm border border-white/10 pointer-events-none transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span>Join Expedition WhatsApp Group 🏔️</span>
        {/* Little right arrow pointer */}
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-stone-900/90 rotate-45 border-t border-r border-white/10" />
      </div>

      {/* Pulsing Outer Rings */}
      <div className="relative flex items-center justify-center">
        <span
          className="absolute -inset-1.5 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none"
          style={{ animationDuration: '2.5s' }}
        />
        <span className="absolute -inset-2.5 rounded-full bg-[#25D366]/20 animate-pulse pointer-events-none" />

        {/* WhatsApp Button */}
        <a
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Join Expedition WhatsApp Group"
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl hover:scale-108 active:scale-95 transition-all duration-200 border-2 border-white/80"
        >
          {/* Official WhatsApp SVG Icon */}
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-sm"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.201.3-.777.978-.953 1.179-.176.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.176-.3-.019-.463.132-.612.136-.134.301-.35.452-.525.15-.175.2-.3.301-.5.101-.2.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.235-.244-.588-.493-.508-.677-.518-.175-.008-.376-.01-.577-.01-.2 0-.526.075-.802.375-.276.3-1.053 1.029-1.053 2.509 0 1.48 1.078 2.91 1.228 3.11.15.2 2.122 3.24 5.14 4.543.718.31 1.279.495 1.716.634.721.23 1.378.197 1.897.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.429-.075-.126-.276-.201-.577-.351zM12.04 21.785c-1.758 0-3.483-.473-5.002-1.371l-.358-.213-3.718.975.992-3.624-.233-.371a9.78 9.78 0 0 1-1.503-5.21c0-5.412 4.403-9.815 9.819-9.815 2.624 0 5.09 1.023 6.945 2.88 1.856 1.856 2.878 4.323 2.877 6.947 0 5.414-4.403 9.817-9.817 9.817zm7.643-17.46C17.65 2.29 14.945 1.2 12.04 1.2 6.069 1.2 1.21 6.059 1.21 12.033c0 1.909.5 3.771 1.45 5.418L1 23l5.694-1.493a10.8 10.8 0 0 0 5.346 1.405h.005c5.969 0 10.828-4.86 10.83-10.835 0-2.894-1.127-5.614-3.192-7.75z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
