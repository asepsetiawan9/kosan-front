'use client';

import React, { useState } from 'react';
import { PropertyMedia } from '@/lib/types';
import { Trash2, Star, ArrowLeft, ArrowRight, Video, Image as ImageIcon, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PropertyMediaGridProps {
  media: PropertyMedia[];
  propertyId: string;
  onRefresh: () => void;
}

export function PropertyMediaGrid({
  media,
  propertyId,
  onRefresh,
}: PropertyMediaGridProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleFeatured = async (mediaId: string, currentStatus: boolean) => {
    setLoadingId(mediaId);
    try {
      const res = await fetch(`/api/proxy/admin/properties/${propertyId}/media/${mediaId}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !currentStatus }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to toggle featured', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus media ini? Berkas fisik akan dihapus permanen.')) {
      return;
    }

    setLoadingId(mediaId);
    try {
      const res = await fetch(`/api/proxy/admin/properties/${propertyId}/media/${mediaId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete media', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMove = async (currentIndex: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= media.length) return;

    const newOrder = [...media];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    const orderedIds = newOrder.map((m) => m.id);

    try {
      const res = await fetch(`/api/proxy/admin/properties/${propertyId}/media/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordered_ids: orderedIds }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to reorder media', err);
    }
  };

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Belum Ada Media Iklan</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Unggah foto fasilitas, tampak depan gedung, atau video virtual tour untuk menarik minat calon penyewa kosan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {media.map((item, index) => {
        const isVideo = item.media_type === 'video';
        const displayThumb = isVideo ? (item.thumbnail_url || item.url) : item.url;
        const isLoading = loadingId === item.id;

        return (
          <div
            key={item.id}
            className={`group flex flex-col rounded-2xl border overflow-hidden bg-white shadow-xs hover:shadow-md transition-all ${
              item.is_featured ? 'border-amber-300 ring-2 ring-amber-300/30' : 'border-slate-200'
            }`}
          >
            {/* Thumbnail Showcase */}
            <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
              <img
                src={displayThumb}
                alt={item.title || 'Media Properti'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {isVideo && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </div>
                </div>
              )}

              {/* Type Badge & Featured Badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 backdrop-blur-md shadow-xs ${
                    isVideo
                      ? 'bg-purple-900/80 text-purple-200 border border-purple-400/30'
                      : 'bg-teal-900/80 text-teal-200 border border-teal-400/30'
                  }`}
                >
                  {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  <span>{isVideo ? 'Video' : 'Foto'}</span>
                </span>

                {item.is_featured && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-white" />
                    <span>Iklan Utama</span>
                  </span>
                )}
              </div>

              {/* External preview link */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
                title="Buka Berkas Asli"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Reorder Buttons Overlay */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, index - 1)}
                  className="p-1 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Pindah ke Kiri/Atas"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-white/80 font-mono px-1">
                  #{index + 1}
                </span>
                <button
                  type="button"
                  disabled={index === media.length - 1}
                  onClick={() => handleMove(index, index + 1)}
                  className="p-1 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Pindah ke Kanan/Bawah"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                  {item.title || (isVideo ? 'Video Promosi Properti' : 'Foto Properti')}
                </h4>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleToggleFeatured(item.id, item.is_featured)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    item.is_featured
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${item.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{item.is_featured ? 'Batal Featured' : 'Set Featured'}</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                  title="Hapus Media"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
