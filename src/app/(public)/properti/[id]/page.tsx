'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Wifi,
  Phone,
  Mail,
  Home,
  Layers,
} from 'lucide-react';
import { Property, Room } from '@/lib/types';
import { MediaGallery } from '@/components/public/MediaGallery';
import { GoogleMapsEmbed } from '@/components/public/GoogleMapsEmbed';
import { PriceRangeDisplay } from '@/components/public/PriceRangeDisplay';
import { RoomCard } from '@/components/public/RoomCard';

export default function PublicPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/proxy/public/properties/${propertyId}`);
        if (!res.ok) {
          throw new Error('Properti tidak ditemukan atau terjadi kesalahan.');
        }
        const json = await res.json();
        setProperty(json.data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat detail properti');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Properti Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          {error || 'Data properti yang Anda cari tidak tersedia.'}
        </p>
        <Link
          href="/properti"
          className="mt-5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md transition-colors"
        >
          Lihat Semua Properti
        </Link>
      </div>
    );
  }

  const availableRooms = property.rooms?.filter((r) => r.status === 'kosong') || [];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-teal-700 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
          <span>/</span>
          <Link href="/properti" className="hover:text-teal-700 transition-colors">
            Properti
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{property.name}</span>
        </div>

        {/* Property Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Terverifikasi SIKOS</span>
              </span>
              {property.city && (
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>{property.city}</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {property.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              {property.address}{property.postal_code ? `, ${property.postal_code}` : ''}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <span className="text-xs font-medium text-slate-400">Rentang Harga Kamar</span>
            <PriceRangeDisplay minPrice={property.min_price} maxPrice={property.max_price} size="lg" />
          </div>
        </div>

        {/* Media Showcase: Photos & Virtual Tour Videos */}
        <MediaGallery
          media={property.media || []}
          propertyName={property.name}
        />

        {/* Main Content 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Details, Facilities & Rooms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="block text-xs text-slate-400 font-medium">Total Kamar</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                  {property.total_rooms ?? 0} Unit
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="block text-xs text-emerald-600 font-medium">Kamar Siap Huni</span>
                <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
                  {property.available_rooms ?? 0} Unit
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-teal-50/60 border border-teal-100">
                <span className="block text-xs text-teal-600 font-medium">Pengelola Resmi</span>
                <span className="text-sm font-bold text-teal-900 mt-1 block truncate">
                  {property.owner_name}
                </span>
              </div>
            </div>

            {/* Facilities Section */}
            {property.facilities && property.facilities.length > 0 && (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Fasilitas Hunian
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.facilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{fac.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Rooms Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Pilihan Kamar Siap Huni
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tersedia {availableRooms.length} kamar kosong di gedung ini
                  </p>
                </div>
              </div>

              {availableRooms.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500">
                  <p className="text-sm font-semibold text-slate-700">Saat ini seluruh kamar di gedung ini terisi penuh.</p>
                  <p className="text-xs text-slate-400 mt-1">Silakan hubungi pengelola untuk daftar tunggu atau cek kosan lainnya.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {availableRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              )}
            </div>

            {/* Google Maps Embed Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                Peta & Petunjuk Arah
              </h3>
              <GoogleMapsEmbed
                url={property.google_maps_url}
                latitude={property.latitude}
                longitude={property.longitude}
                address={property.address}
                propertyName={property.name}
              />
            </div>
          </div>

          {/* Right Column: Sticky Booking & Contact Card */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Mulai Dari
                </span>
                <PriceRangeDisplay minPrice={property.min_price} maxPrice={property.max_price} size="lg" />
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Hunian:</span>
                  <span className="font-semibold text-emerald-600">
                    {availableRooms.length > 0 ? `${availableRooms.length} Kamar Tersedia` : 'Penuh'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Kota / Wilayah:</span>
                  <span className="font-semibold text-slate-800">{property.city || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Kontak Pengelola:</span>
                  <span className="font-semibold text-slate-800">{property.owner_phone || '-'}</span>
                </div>
              </div>

              {availableRooms.length > 0 ? (
                <Link
                  href={`/kamar/${availableRooms[0].id}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm text-center block shadow-lg hover:shadow-xl transition-all"
                >
                  Ajukan Sewa Kamar Sekarang
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs text-center block cursor-not-allowed"
                >
                  Kamar Sedang Penuh
                </button>
              )}

              {/* Security & Comfort Assurances */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Survei lokasi langsung didampingi penjaga kos</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Perjanjian sewa digital sah & transparan</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Pembayaran aman dengan multi-metode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
