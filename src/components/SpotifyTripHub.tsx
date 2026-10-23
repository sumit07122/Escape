'use client';

import React, { useState } from 'react';
import { Music, ExternalLink, Play, Radio, Volume2 } from 'lucide-react';

const SPOTIFY_PLAYLIST_URL = 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM';

const HIGHLIGHT_TRACKS = [
  { title: 'Ilahi', artist: 'Pritam, Arijit Singh', vibe: 'Mountain Wanderers' },
  { title: 'Subhanallah', artist: 'Pritam, Sreerama Chandra', vibe: 'Kasol Vibes' },
  { title: 'Matargashti', artist: 'Mohit Chauhan, A.R. Rahman', vibe: 'Highway Energy' },
  { title: 'Safarnama', artist: 'Lucky Ali', vibe: 'Stargazing Acoustic' },
  { title: 'Pasoori / Baarishein', artist: 'Ali Sethi / Anuv Jain', vibe: 'Parvati Bonfire' },
];

export default function SpotifyTripHub() {
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-black text-white border border-white/10 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954]">
              {/* Spotify SVG */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.217.355-.68.468-1.035.252-2.836-1.733-6.406-2.124-10.61-1.163-.404.093-.812-.162-.905-.566-.093-.404.162-.812.566-.905 4.606-1.052 8.56-.615 11.732 1.347.355.217.468.68.252 1.035zm1.467-3.262c-.273.444-.855.586-1.299.313-3.245-1.995-8.192-2.572-12.03-1.407-.498.151-1.026-.135-1.177-.633-.151-.498.135-1.026.633-1.177 4.394-1.332 9.845-.684 13.56 1.605.444.273.586.855.313 1.299zm.126-3.41c-3.89-2.31-10.31-2.523-14.032-1.393-.598.182-1.233-.162-1.415-.76-.182-.598.162-1.233.76-1.415 4.283-1.3 11.373-1.053 15.845 1.602.537.319.713 1.015.394 1.552-.319.537-1.015.713-1.552.394z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Bus 01–04 Official Road-Trip Soundtrack
            </h3>
          </div>
          <p className="text-xs text-stone-300 max-w-xl">
            14 hours of overnight mountain highway tunes. Add your favorite Punjabi, Techno, Indie, and Acoustic tracks to our collaborative playlist.
          </p>
        </div>

        <a
          href={SPOTIFY_PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0 cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.217.355-.68.468-1.035.252-2.836-1.733-6.406-2.124-10.61-1.163-.404.093-.812-.162-.905-.566-.093-.404.162-.812.566-.905 4.606-1.052 8.56-.615 11.732 1.347.355.217.468.68.252 1.035zm1.467-3.262c-.273.444-.855.586-1.299.313-3.245-1.995-8.192-2.572-12.03-1.407-.498.151-1.026-.135-1.177-.633-.151-.498.135-1.026.633-1.177 4.394-1.332 9.845-.684 13.56 1.605.444.273.586.855.313 1.299zm.126-3.41c-3.89-2.31-10.31-2.523-14.032-1.393-.598.182-1.233-.162-1.415-.76-.182-.598.162-1.233.76-1.415 4.283-1.3 11.373-1.053 15.845 1.602.537.319.713 1.015.394 1.552-.319.537-1.015.713-1.552.394z" />
          </svg>
          <span>Open & Add Tracks on Spotify</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Featured Highway Anthems */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block font-mono">
          Featured Highway Anthems (Voted by Coordinators)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {HIGHLIGHT_TRACKS.map((track, idx) => (
            <div
              key={track.title}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-bold text-stone-500 w-4">
                  0{idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {track.title}
                  </p>
                  <p className="text-[10px] text-stone-400 truncate">
                    {track.artist}
                  </p>
                </div>
              </div>

              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-stone-300 shrink-0">
                {track.vibe}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
