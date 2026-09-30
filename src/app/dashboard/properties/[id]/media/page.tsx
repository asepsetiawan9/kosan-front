'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Building2, Image as ImageIcon, Video, Star, RefreshCw } from 'lucide-react';
import { Property, PropertyMedia } from '@/lib/types';
import { PropertyMediaUploader } from '@/components/admin/PropertyMediaUploader';
import { PropertyMediaGrid } from '@/components/admin/PropertyMediaGrid';
import { Button } from '@/components/ui/Button';

export default function PropertyMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [media, setMedia] = useState<PropertyMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const fetchPropertyAndMedia = async () => {
    setIsLoading(true);
    try {
      // Fetch property details
      const propRes = await fetch(`/api/proxy/admin/properties/${propertyId}`);
      if (propRes.ok) {
        const propData = await propRes.json();
        setProperty(propData.data);
      }

      // Fetch property media
      const mediaRes = await fetch(`/api/proxy/admin/properties/${propertyId}/media`);
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMedia(mediaData.data || []);
      }
    } catch (err) {
      console.error('Failed to load property media', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyAndMedia();
  }, [propertyId]);

  const filteredMedia = media.filter((m) => {
    if (filterType === 'image') return m.media_type === 'image';
    if (filterType === 'video') return m.media_type === 'video';
    return true;
  });

  const photoCount = media.filter((m) => m.media_type === 'image').length;
  const videoCount = media.filter((m) => m.media_type === 'video').length;
  const featuredCount = media.filter((m) => m.is_featured).length;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/properties"
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Kembali ke Daftar Properti"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                Media & Iklan
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
                {property?.name || 'Memuat...'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Galeri & Video Properti
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPropertyAndMedia}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Button onClick={() => setIsUploaderOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Unggah Media Baru</span>
          </Button>
        </div>
      </div>

      {/* Property Information Card */}
      {property && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{property.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{property.address}, {property.city}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {property.total_rooms ?? 0} Total Kamar
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {property.available_rooms ?? 0} Siap Huni
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="block text-lg font-bold text-slate-900">{photoCount}</span>
              <span className="block text-[11px] text-slate-400 font-medium">Foto</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="block text-lg font-bold text-purple-700">{videoCount}</span>
              <span className="block text-[11px] text-slate-400 font-medium">Video</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
              <span className="block text-lg font-bold text-amber-700">{featuredCount}</span>
              <span className="block text-[11px] text-amber-600 font-medium">Iklan Utama</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua Media ({media.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('image')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'image'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Foto ({photoCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('video')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'video'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Video ({videoCount})</span>
        </button>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <PropertyMediaGrid
          media={filteredMedia}
          propertyId={propertyId}
          onRefresh={fetchPropertyAndMedia}
        />
      )}

      {/* Uploader Modal */}
      <PropertyMediaUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        propertyId={propertyId}
        onSuccess={fetchPropertyAndMedia}
      />
    </div>
  );
}
