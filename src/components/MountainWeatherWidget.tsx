'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, CloudSnow, MapPin, Sun } from 'lucide-react';

interface WeatherData {
  manaliTemp: number;
  manaliCondition: string;
  kasolTemp: number;
  kasolCondition: string;
  isLive: boolean;
}

export default function MountainWeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    manaliTemp: 4,
    manaliCondition: 'Light Snow ❄️',
    kasolTemp: 7,
    kasolCondition: 'Clear Skies ☀️',
    isLive: false,
  });
  const [loading, setLoading] = useState(true);

  const weatherIcon = (condition: string) => {
    if (/snow|flurr/i.test(condition)) return CloudSnow;
    if (/cloud|mist|rain|shower/i.test(condition)) return Cloud;
    return Sun;
  };

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Open-Meteo API for Manali (32.2396, 77.1887) and Kasol (32.0100, 77.3150)
        const [manaliRes, kasolRes] = await Promise.all([
          fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=32.2396&longitude=77.1887&current=temperature_2m,weather_code&timezone=auto',
            { signal: AbortSignal.timeout(5000) }
          ).catch(() => null),
          fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=32.0100&longitude=77.3150&current=temperature_2m,weather_code&timezone=auto',
            { signal: AbortSignal.timeout(5000) }
          ).catch(() => null),
        ]);

        let manaliTemp = 4;
        let manaliCondition = 'Light Snow ❄️';
        let kasolTemp = 7;
        let kasolCondition = 'Clear Skies ☀️';
        let live = false;

        if (manaliRes && manaliRes.ok) {
          const mData = await manaliRes.json();
          if (mData?.current?.temperature_2m !== undefined) {
            manaliTemp = Math.round(mData.current.temperature_2m);
            const code = mData.current.weather_code || 0;
            if (code >= 71) manaliCondition = 'Snow Falling ❄️';
            else if (code >= 51) manaliCondition = 'Cold Mist 🌧️';
            else if (code >= 1) manaliCondition = 'Partly Cloudy ⛅';
            else manaliCondition = 'Crisp Alpine Air 🏔️';
            live = true;
          }
        }

        if (kasolRes && kasolRes.ok) {
          const kData = await kasolRes.json();
          if (kData?.current?.temperature_2m !== undefined) {
            kasolTemp = Math.round(kData.current.temperature_2m);
            const code = kData.current.weather_code || 0;
            if (code >= 71) kasolCondition = 'Light Flurries ❄️';
            else if (code >= 51) kasolCondition = 'Valley Showers 🌧️';
            else if (code >= 1) kasolCondition = 'Sunny Valleys 🌤️';
            else kasolCondition = 'Clear Skies ☀️';
            live = true;
          }
        }

        setWeather({
          manaliTemp,
          manaliCondition,
          kasolTemp,
          kasolCondition,
          isLive: live,
        });
      } catch {
        // Fallback to trusted seasonal mountain defaults
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  const locations = [
    { name: 'Manali', temp: weather.manaliTemp, condition: weather.manaliCondition },
    { name: 'Kasol', temp: weather.kasolTemp, condition: weather.kasolCondition },
  ];

  return (
    <section
      aria-label="Mountain weather in Manali and Kasol"
      className="w-full rounded-2xl border border-white/15 bg-[#10231f]/80 px-4 py-3 text-left text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-5 sm:py-3.5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:w-[37%] sm:shrink-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-[#f1c39e]">
              <CloudSnow className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">Mountain weather</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-white/95">
                <MapPin className="h-3 w-3 text-[#f1c39e]" aria-hidden="true" />
                Manali <span className="text-white/45">&</span> Kasol
              </p>
            </div>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] sm:hidden ${weather.isLive ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' : 'border-[#f1c39e]/25 bg-[#f1c39e]/10 text-[#ffdbb9]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${weather.isLive ? 'bg-emerald-300' : 'bg-[#f1c39e]'}`} />
            {weather.isLive ? 'Live' : loading ? 'Updating' : 'Estimate'}
          </span>
        </div>
        <span className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] sm:inline-flex ${weather.isLive ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' : 'border-[#f1c39e]/25 bg-[#f1c39e]/10 text-[#ffdbb9]'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${weather.isLive ? 'bg-emerald-300' : 'bg-[#f1c39e]'}`} />
          {weather.isLive ? 'Live' : loading ? 'Updating' : 'Seasonal estimate'}
        </span>

        <div className="grid min-w-0 flex-1 grid-cols-2 divide-x divide-white/15 border-t border-white/10 pt-2.5 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          {locations.map((location) => {
            const ConditionIcon = weatherIcon(location.condition);
            return (
              <div key={location.name} className="min-w-0 px-3 first:pl-0 last:pr-0 sm:px-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-white/70">{location.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-white/70">{location.condition}</p>
                  </div>
                  <p className="shrink-0 font-serif text-2xl leading-none tracking-tight text-white sm:text-[1.7rem]">
                    {location.temp}<span className="ml-0.5 align-top font-sans text-sm text-[#f1c39e]">°</span>
                  </p>
                  <ConditionIcon className="hidden h-4 w-4 shrink-0 text-[#f1c39e] sm:block" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
