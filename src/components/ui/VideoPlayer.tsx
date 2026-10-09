'use client';

import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface VideoPlayerProps {
  src: string;
  poster?: string | null;
  title?: string | null;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = true, // Default true agar otomatis terputar di halaman publik
  muted = true,    // Default true agar lolos kebijakan browser autoplay
  loop = true,
  className = '',
}: VideoPlayerProps) {
  const youtubeId = extractYouTubeId(src);

  // Jika sumber video merupakan YouTube
  if (youtubeId) {
    const autoplayParam = autoPlay ? '1' : '0';
    const muteParam = muted ? '1' : '0';
    const loopParam = loop ? `1&playlist=${youtubeId}` : '0';
    const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${autoplayParam}&mute=${muteParam}&loop=${loopParam}&playsinline=1&controls=1&rel=0&modestbranding=1&enablejsapi=1`;

    return (
      <div className={`relative overflow-hidden rounded-2xl bg-black shadow-xl aspect-video w-full ${className}`}>
        {/* YouTube Iframe Embed */}
        <iframe
          src={embedUrl}
          title={title || 'Virtual Tour Properti'}
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        {/* Top Floating Badge */}
        {title && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            <span className="text-xs font-semibold tracking-wide drop-shadow-md truncate bg-black/60 text-white/95 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              {title}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1 backdrop-blur-md">
              <YoutubeIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>YouTube</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback untuk file video HTML5 native (misal data lama)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [hasError, setHasError] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (hasError) {
    return (
      <div className={`relative flex flex-col items-center justify-center rounded-2xl bg-slate-900/90 text-white p-8 border border-slate-700/50 min-h-[220px] ${className}`}>
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <p className="text-sm font-medium text-slate-200">Video tidak dapat dimuat</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">Pastikan format video atau link didukung oleh browser Anda.</p>
      </div>
    );
  }

  return (
    <div
      onClick={togglePlay}
      className={`group relative overflow-hidden rounded-2xl bg-slate-950 shadow-xl cursor-pointer select-none transition-all duration-300 ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-emerald-400/40 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white text-white" />
          </div>
        </div>
      )}

      {title && (
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white/90">
          <span className="text-xs sm:text-sm font-semibold tracking-wide drop-shadow-md truncate bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            {title}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Video Tour
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between text-white pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-xs font-medium transition-all"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-white" /> Jeda
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" /> Putar
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/90 transition-all"
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
          </button>

          <button
            type="button"
            onClick={handleFullscreen}
            className="p-2 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white/90 transition-all"
            title="Layar Penuh"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
