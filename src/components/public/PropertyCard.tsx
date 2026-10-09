'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, Video, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { Property } from '@/lib/types';
import { PriceRangeDisplay } from './PriceRangeDisplay';

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className = '' }: PropertyCardProps) {
  // Find featured media, or first media, or fallback image
  const featured = property.featured_media?.[0] || property.media?.find((m) => m.is_featured) || property.media?.[0];
  const hasVideo = property.media?.some((m) => m.media_type === 'video');

  const imageUrl = featured
    ? (featured.media_type === 'video' ? featured.thumbnail_url || featured.url : featured.url)
    : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 ${className}`}>
      {/* Media Showcase */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <img
          src={imageUrl}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Unit Count Badge */}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-300" />
            <span>{property.total_rooms ?? 0} Unit Kamar</span>
          </span>

          {/* Video Tour Badge */}
          {hasVideo && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-950/80 text-teal-300 border border-teal-500/40 backdrop-blur-md shadow-sm flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              <span>Video Tour</span>
            </span>
          )}
        </div>

        {/* Bottom City Tag */}
        {property.city && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/95 text-xs font-medium bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-teal-300" />
            <span>{property.city}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
            {property.name}
          </h3>

          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {property.address}
          </p>

          {/* Quick Metrics */}
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-600 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold text-slate-800">{property.total_rooms ?? 0} Total Unit Kamar</span>
            </div>
            {property.city && (
              <>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{property.city}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer: Price & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Rentang Harga
            </span>
            <PriceRangeDisplay minPrice={property.min_price} maxPrice={property.max_price} size="md" />
          </div>

          <Link
            href={`/properti/${property.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-semibold text-xs transition-all duration-200 group/btn shadow-xs hover:shadow-md"
          >
            <span>Detail</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
