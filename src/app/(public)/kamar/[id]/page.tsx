'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookingModalForm } from '@/components/public/BookingModalForm';
import { RoomGalleryModal } from '@/components/public/RoomGalleryModal';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/api';
import { 
  ArrowLeft, 
  DoorClosed, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Phone,
  Maximize2
} from 'lucide-react';

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params?.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    async function loadRoom() {
      if (!roomId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/proxy/public/rooms/${roomId}`);
        if (res.ok) {
          const json = await res.json();
          setRoom(json.data);
        } else {
          setRoom(null);
        }
      } catch (err) {
        console.error('Gagal mengambil detail kamar:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRoom();
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="lg:col-span-4 h-96 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 py-20 text-center">
        <DoorClosed className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Kamar Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Kamar yang Anda cari mungkin sedang tidak tersedia atau dalam status perbaikan.
        </p>
        <Link
          href="/kamar"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white gradient-emerald-glow cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog Kamar
        </Link>
      </div>
    );
  }

  const gallery = room.images && room.images.length > 0 
    ? room.images.map((img) => img.image_path)
    : [room.primary_image || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'];

  const currentImage = gallery[activeImageIndex] || gallery[0];

  return (
    <div className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/kamar"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Kamar
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              {room.status === 'kosong' ? 'Tersedia' : room.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
              Tipe {room.type}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Gallery & Room Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Photo Gallery Showcase */}
            <div className="space-y-3">
              <div className="relative h-80 sm:h-[450px] w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200/90 group bg-slate-900">
                <img
                  src={currentImage}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-800 shadow-sm backdrop-blur-xs transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Perbesar Foto
                </button>
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-teal-600 scale-102 shadow-xs'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Specs */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                  <DoorClosed className="w-4 h-4 text-teal-700" />
                  <span>Unit No. {room.room_number}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {room.name}
                </h1>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Deskripsi Unit
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {room.description || 'Kamar kos nyaman dan bersih dengan pencahayaan alami serta ventilasi optimal.'}
                </p>
              </div>

              {/* Facilities List */}
              {room.facilities && room.facilities.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Fasilitas Kamar & Properti
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {room.facilities.map((fac) => (
                      <div
                        key={fac.id}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                      >
                        <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-teal-700 font-bold" />
                        </div>
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {fac.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hygiene & Security Promise */}
              <div className="pt-6 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Kamar disanitasi menyeluruh sebelum serah terima kunci. Penghuni mendapatkan perlindungan kontrak sewa resmi dan pencatatan transaksi terkomputerisasi.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Booking Summary Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-md space-y-6">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Harga Sewa Bulanan</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-teal-800">
                    {formatRupiah(room.base_price)}
                  </span>
                  <span className="text-xs font-medium text-slate-500">/ bulan</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2 text-xs text-teal-950">
                <div className="flex justify-between">
                  <span>Status Kamar:</span>
                  <span className="font-bold text-emerald-700">Siap Ditempati Segera</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimal Sewa:</span>
                  <span className="font-semibold text-slate-700">1 Bulan</span>
                </div>
                <div className="flex justify-between">
                  <span>Listrik & Air:</span>
                  <span className="font-semibold text-slate-700">Termasuk (S&K Berlaku)</span>
                </div>
              </div>

              <button
                type="button"
                disabled={room.status !== 'kosong'}
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white gradient-emerald-glow shadow-emerald-glow hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {room.status === 'kosong' ? 'Pesan Kamar Sekarang' : 'Kamar Sedang Terisi'}
              </button>

              <a
                href={`https://wa.me/6281234567890?text=Halo%20Pengelola,%20saya%20ingin%20bertanya%20tentang%20Kamar%20${encodeURIComponent(room.room_number)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Tanya Pengelola via WhatsApp
              </a>

              <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                🔒 Dokumen KTP aman & terenkripsi. Tidak ada biaya pemesanan di awal sebelum survei dan persetujuan.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Gallery Modal Component */}
      <RoomGalleryModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={gallery}
        currentIndex={activeImageIndex}
        onSelectIndex={setActiveImageIndex}
        roomName={room.name}
      />

      {/* Booking Modal Form */}
      <BookingModalForm
        room={room}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={() => {
          // Refresh room status if needed
        }}
      />
    </div>
  );
}
