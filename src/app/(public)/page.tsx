'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookingModalForm } from '@/components/public/BookingModalForm';
import { HeroBanner } from '@/components/public/HeroBanner';
import { RoomCard } from '@/components/public/RoomCard';
import { Room } from '@/lib/types';
import { 
  Wifi, 
  Shield, 
  Coffee, 
  DoorClosed, 
  ChevronRight,
  Wind,
  MapPin,
  CalendarCheck
} from 'lucide-react';

export default function LandingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  useEffect(() => {
    async function fetchAvailableRooms() {
      try {
        const res = await fetch('/api/proxy/public/rooms');
        if (res.ok) {
          const json = await res.json();
          setRooms(json.data || []);
        }
      } catch (err) {
        console.error('Gagal mengambil data kamar:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAvailableRooms();
  }, []);

  const features = [
    {
      icon: Wifi,
      title: 'High-Speed Wi-Fi',
      desc: 'Internet fiber optic cepat & stabil untuk bekerja (WFH) dan hiburan tanpa kendala.',
    },
    {
      icon: Shield,
      title: 'Keamanan 24/7 & CCTV',
      desc: 'Akses lingkungan terjamin dengan pengawasan CCTV berkala dan gerbang aman.',
    },
    {
      icon: Wind,
      title: 'Full AC & Sirkulasi Segar',
      desc: 'Setiap unit dilengkapi pendingin ruangan hemat energi dan ventilasi asri.',
    },
    {
      icon: Coffee,
      title: 'Dapur & Ruang Santai',
      desc: 'Fasilitas dapur bersama bersih, dispenser air minum, dan area komunal yang nyaman.',
    },
  ];

  return (
    <>
      {/* HERO SECTION COMPONENT */}
      <HeroBanner />

      {/* FEATURED AVAILABLE ROOMS */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              <CalendarCheck className="w-4 h-4" />
              Kamar Siap Huni
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pilihan Kamar Kosong Saat Ini
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Kamar yang tertera di bawah ini siap dipesan dan ditempati segera.
            </p>
          </div>
          <Link
            href="/kamar"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
          >
            Lihat Semua Kamar
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <DoorClosed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Semua Kamar Saat Ini Penuh</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Saat ini semua unit kamar sedang terisi. Silakan hubungi pengelola untuk masuk ke daftar tunggu (waiting list).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.slice(0, 6).map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={(r) => setSelectedRoomForBooking(r)}
              />
            ))}
          </div>
        )}
      </section>

      {/* VALUE PROPOSITIONS / FASILITAS */}
      <section id="fasilitas" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-2">
              Kenyamanan Utama
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fasilitas Terbaik untuk Pengalaman Tinggal Maksimal
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Setiap aspek hunian dirawat secara profesional agar Anda merasa betah layaknya di rumah sendiri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-200 hover:bg-teal-50/30 transition-all space-y-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT & LOCATION BANNER */}
      <section id="kontak" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl gradient-fresh-horizon p-8 sm:p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-teal-800 text-xs font-bold shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-teal-700" />
              Lokasi Sangat Strategis
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Punya Pertanyaan atau Ingin Survei Kamar?
            </h3>
            <p className="text-sm text-slate-600 max-w-xl">
              Pengelola kami siap membantu menjawab pertanyaan seputar ketersediaan kamar, survei lokasi langsung, atau tata tertib kos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Pengelola%20KosanKu,%20saya%20tertarik%20dengan%20kamar%20kos."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white gradient-emerald-glow shadow-emerald-glow hover:opacity-95 transition-all"
            >
              Chat WhatsApp Pengelola
            </a>
            <Link
              href="/kamar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Daftar Kamar
            </Link>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModalForm
          room={selectedRoomForBooking}
          isOpen={!!selectedRoomForBooking}
          onClose={() => setSelectedRoomForBooking(null)}
        />
      )}
    </>
  );
}
