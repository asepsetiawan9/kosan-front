'use client';

import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface GoogleMapsPreviewProps {
  url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  name?: string;
  className?: string;
}

export const GoogleMapsPreview: React.FC<GoogleMapsPreviewProps> = ({
  url,
  latitude,
  longitude,
  address,
  name,
  className = '',
}) => {
  // Generate maps link
  const mapsLink =
    url ||
    (latitude && longitude
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : address
      ? `https://maps.google.com/?q=${encodeURIComponent(address)}`
      : null);

  // Generate embed URL if possible
  const embedUrl = React.useMemo(() => {
    if (latitude && longitude) {
      return `https://maps.google.com/maps?q=${latitude},${longitude}&hl=id&z=15&output=embed`;
    }
    if (url && (url.includes('q=') || url.includes('@'))) {
      const match = url.match(/q=([-\d.]+,[-\d.]+)/);
      if (match) {
        return `https://maps.google.com/maps?q=${match[1]}&hl=id&z=15&output=embed`;
      }
    }
    if (address) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=id&z=14&output=embed`;
    }
    return null;
  }, [latitude, longitude, url, address]);

  if (!mapsLink) {
    return (
      <div className={`p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400 ${className}`}>
        <MapPin className="w-5 h-5 mx-auto mb-1 text-slate-300" />
        Belum ada informasi lokasi Google Maps.
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs ${className}`}>
      {embedUrl ? (
        <div className="relative w-full h-40 bg-slate-100">
          <iframe
            src={embedUrl}
            title={name ? `Peta Lokasi ${name}` : 'Peta Lokasi'}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="p-4 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{name || 'Lokasi Properti'}</p>
              <p className="text-[11px] text-slate-500 line-clamp-1">{address || 'Tautan Google Maps terpasang'}</p>
            </div>
          </div>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition"
          >
            <span>Buka Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
      {embedUrl && (
        <div className="px-3.5 py-2 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 truncate max-w-xs">{address || name || 'Lihat rute navigasi'}</span>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800 shrink-0 ml-2"
          >
            <span>Buka di Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
