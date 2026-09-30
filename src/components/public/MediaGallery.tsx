'use client';

import React, { useState } from 'react';
import { PropertyMedia } from '@/lib/types';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { Play, Image as ImageIcon, Video, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MediaGalleryProps {
  media: PropertyMedia[];
  defaultImage?: string;
  propertyName?: string;
  className?: string;
}

export function MediaGallery({
  media,
  defaultImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  propertyName,
  className = '',
}: MediaGalleryProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const filteredMedia = media.filter((item) => {
    if (filter === 'image') return item.media_type === 'image';
    if (filter === 'video') return item.media_type === 'video';
    return true;
  });

  const photoCount = media.filter((m) => m.media_type === 'image').length;
  const videoCount = media.filter((m) => m.media_type === 'video').length;

  const currentItem = filteredMedia[selectedIndex] || media[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredMedia.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev < filteredMedia.length - 1 ? prev + 1 : 0));
  };

  if (!media || media.length === 0) {
    return (
      <div className={`relative overflow-hidden rounded-3xl aspect-[16/9] bg-slate-900 shadow-xl ${className}`}>
        <img
          src={defaultImage}
          alt={propertyName || 'Gedung Kosan'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
          <span className="text-white text-sm font-semibold">{propertyName || 'Foto Properti'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Category Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setFilter('all');
            setSelectedIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          Semua ({media.length})
        </button>

        {photoCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setFilter('image');
              setSelectedIndex(0);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === 'image'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto ({photoCount})</span>
          </button>
        )}

        {videoCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setFilter('video');
              setSelectedIndex(0);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === 'video'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video ({videoCount})</span>
          </button>
        )}
      </div>

      {/* Main Showcase Frame */}
      <div className="relative overflow-hidden rounded-3xl aspect-[16/9] sm:aspect-[21/9] bg-slate-950 shadow-2xl group">
        {currentItem?.media_type === 'video' ? (
          <VideoPlayer
            src={currentItem.url}
            poster={currentItem.thumbnail_url}
            title={currentItem.title || propertyName}
            className="w-full h-full"
          />
        ) : (
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full h-full cursor-zoom-in"
          >
            <img
              src={currentItem?.url || defaultImage}
              alt={currentItem?.title || propertyName || 'Foto Media'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Bottom Caption */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                {currentItem?.title && (
                  <h4 className="text-white font-bold text-base sm:text-lg drop-shadow-md">
                    {currentItem.title}
                  </h4>
                )}
                {currentItem?.description && (
                  <p className="text-white/80 text-xs sm:text-sm mt-0.5 max-w-xl line-clamp-1 drop-shadow">
                    {currentItem.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-medium border border-white/20 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Perbesar</span>
              </button>
            </div>
          </div>
        )}

        {/* Prev / Next Navigation Arrows (when multiple items) */}
        {filteredMedia.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all"
              title="Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {filteredMedia.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filteredMedia.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const thumbSrc = item.media_type === 'video' ? (item.thumbnail_url || item.url) : item.url;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative shrink-0 w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-teal-500 ring-2 ring-teal-500/30 scale-105'
                    : 'border-slate-200 hover:border-teal-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={thumbSrc}
                  alt={item.title || `Media ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {item.media_type === 'video' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && currentItem?.media_type === 'image' && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={currentItem.url}
            alt={currentItem.title || propertyName || 'Foto'}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
