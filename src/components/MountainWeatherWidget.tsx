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
      className="w-full rounded-2xl border border-white/15 bg-[#10231f]/80 p-4 text-left text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-[#f1c39e]">
            <CloudSnow className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Mountain weather</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-white/90">
              <MapPin className="h-3.5 w-3.5 text-[#f1c39e]" aria-hidden="true" />
              Manali <span className="text-white/35">&</span> Kasol
            </p>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${weather.isLive ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200' : 'border-[#f1c39e]/20 bg-[#f1c39e]/10 text-[#f1c39e]'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${weather.isLive ? 'bg-emerald-300' : 'bg-[#f1c39e]'}`} />
          {weather.isLive ? 'Live' : loading ? 'Updating' : 'Seasonal estimate'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 pt-3.5">
        {locations.map((location) => {
          const ConditionIcon = weatherIcon(location.condition);
          return (
            <div key={location.name} className="min-w-0 px-2 first:pl-0 last:pr-0 sm:px-4">
              <p className="text-xs font-medium text-white/60">{location.name}</p>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className="font-serif text-3xl leading-none tracking-tight text-white sm:text-[2rem]">
                  {location.temp}<span className="ml-0.5 align-top font-sans text-base text-[#f1c39e]">°</span>
                </p>
                <ConditionIcon className="h-5 w-5 shrink-0 text-[#f1c39e]" aria-hidden="true" />
              </div>
              <p className="mt-1.5 truncate text-[11px] text-white/60">{location.condition}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
