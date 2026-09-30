'use client';

import React, { useMemo } from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface GoogleMapsEmbedProps {
  url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  propertyName?: string | null;
  className?: string;
  height?: string;
}

export function GoogleMapsEmbed({
  url,
  latitude,
  longitude,
  address,
  propertyName,
  className = '',
  height = 'h-72 sm:h-96',
}: GoogleMapsEmbedProps) {
  // Compute external link to Google Maps
  const mapsLink = useMemo(() => {
    if (url) return url;
    if (latitude && longitude) return `https://maps.google.com/?q=${latitude},${longitude}`;
    if (address) return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    return null;
  }, [url, latitude, longitude, address]);

  // Compute embed URL
  const embedUrl = useMemo(() => {
    if (latitude && longitude) {
      return `https://maps.google.com/maps?q=${latitude},${longitude}&hl=id&z=15&output=embed`;
    }
    if (url) {
      const coordMatch = url.match(/q=([-\d.]+,[-\d.]+)/) || url.match(/@([-\d.]+),([-\d.]+)/);
      if (coordMatch) {
        const query = coordMatch[2] ? `${coordMatch[1]},${coordMatch[2]}` : coordMatch[1];
        return `https://maps.google.com/maps?q=${query}&hl=id&z=15&output=embed`;
      }
    }
    if (address) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=id&z=14&output=embed`;
    }
    return null;
  }, [url, latitude, longitude, address]);

  if (!mapsLink && !embedUrl) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 ${className}`}>
        <MapPin className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium">Informasi peta lokasi belum ditambahkan</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col ${className}`}>
      {/* Map Header Banner */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700 mt-0.5 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              {propertyName ? `Lokasi ${propertyName}` : 'Peta Lokasi'}
            </h4>
            {address && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {address}
              </p>
            )}
          </div>
        </div>

        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-teal-700 hover:text-teal-800 border border-slate-200 text-xs font-medium shadow-xs transition-all duration-200 group"
          >
            <Navigation className="w-3.5 h-3.5 text-teal-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span>Petunjuk Arah</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </a>
        )}
      </div>

      {/* Map Embed Frame */}
      <div className={`relative w-full ${height} bg-slate-100`}>
        {embedUrl ? (
          <iframe
            title={`Peta Lokasi ${propertyName || ''}`}
            src={embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="w-10 h-10 text-teal-500 mb-2" />
            <p className="text-sm text-slate-600 font-medium">Buka peta langsung melalui tautan Google Maps</p>
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Buka di Google Maps
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
