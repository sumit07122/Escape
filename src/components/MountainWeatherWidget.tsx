'use client';

import React, { useState, useEffect } from 'react';
import { CloudSnow, Sun, Cloud, Thermometer, Wind } from 'lucide-react';

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

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Open-Meteo API for Manali (32.2396, 77.1887) and Kasol (32.0100, 77.3150)
        const [manaliRes, kasolRes] = await Promise.all([
          fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=32.2396&longitude=77.1887&current=temperature_2m,weather_code&timezone=auto',
            { next: { revalidate: 3600 } }
          ).catch(() => null),
          fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=32.0100&longitude=77.3150&current=temperature_2m,weather_code&timezone=auto',
            { next: { revalidate: 3600 } }
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

  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white shadow-xl text-xs sm:text-sm font-medium tracking-wide">
      {/* Live Blinking Green Status */}
      <span className="flex items-center gap-1.5 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className={`text-[10px] uppercase font-mono font-bold ${weather.isLive ? 'text-cyan-300' : 'text-amber-200'}`}>
          {weather.isLive ? 'LIVE WEATHER' : loading ? 'WEATHER' : 'SEASONAL ESTIMATE'}
        </span>
      </span>

      <span className="text-white/30 hidden sm:inline">•</span>

      {/* Manali Status */}
      <div className="flex items-center gap-1.5 font-mono text-stone-200">
        <span className="font-bold text-white">Manali:</span>
        <span className="font-bold text-amber-300">{weather.manaliTemp}°C</span>
        <span className="text-[11px] text-stone-300 hidden md:inline">({weather.manaliCondition})</span>
      </div>

      <span className="text-white/30">•</span>

      {/* Kasol Status */}
      <div className="flex items-center gap-1.5 font-mono text-stone-200">
        <span className="font-bold text-white">Kasol:</span>
        <span className="font-bold text-emerald-300">{weather.kasolTemp}°C</span>
        <span className="text-[11px] text-stone-300 hidden md:inline">({weather.kasolCondition})</span>
      </div>
    </div>
  );
}
