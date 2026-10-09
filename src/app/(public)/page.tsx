'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookingModalForm } from '@/components/public/BookingModalForm';
import { HeroBanner } from '@/components/public/HeroBanner';
import { RoomCard } from '@/components/public/RoomCard';
import { PropertyCard } from '@/components/public/PropertyCard';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { GoogleMapsEmbed } from '@/components/public/GoogleMapsEmbed';
import { PublicComplaintSection } from '@/components/public/PublicComplaintSection';
import { Room, Property, PropertyMedia } from '@/lib/types';
import { 
  Wifi, 
  Shield, 
  Coffee, 
  DoorClosed, 
  ChevronRight,
  Wind,
  MapPin,
  CalendarCheck,
  Building2,
  Video,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<{ media: PropertyMedia; property: Property } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch rooms (all rooms)
        const roomsRes = await fetch('/api/proxy/public/rooms?all=1');
        if (roomsRes.ok) {
          const json = await roomsRes.json();
          setRooms(json.data || []);
        }

        // Fetch properties
        const propRes = await fetch('/api/proxy/public/properties');
        if (propRes.ok) {
          const json = await propRes.json();
          const props: Property[] = json.data || [];
          setProperties(props);

          // Find first featured or available video
          for (const p of props) {
            const vid = p.media?.find((m) => m.media_type === 'video');
            if (vid) {
              setFeaturedVideo({ media: vid, property: p });
              break;
            }
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data beranda:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
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

      {/* SECTION: GEDUNG & LOKASI PROPERTI KOSAN */}
      {properties.length > 0 && (
        <section className="py-16 bg-slate-50/80 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  Gedung & Lokasi
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Pilihan Properti Hunian Kami
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Temukan kosan strategis di lokasi idaman Anda dengan fasilitas unggulan dan suasana kondusif.
                </p>
              </div>
              <Link
                href="/properti"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
              >
                Lihat Semua Properti
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {properties.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION: VIRTUAL TOUR VIDEO (JIKA ADA VIDEO MEDIA) */}
      {featuredVideo && (
        <section className="py-16 bg-slate-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
                  <Video className="w-3.5 h-3.5" />
                  <span>Virtual Tour Interaktif</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  Rasakan Suasana Hunian Sebelum Berkunjung
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Lihat langsung tata ruang kamar, area komunal, lorong, dan fasilitas pendukung melalui video tur beresolusi tinggi kami.
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <Link
                    href={`/properti/${featuredVideo.property.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors shadow-lg"
                  >
                    <span>Lihat {featuredVideo.property.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7">
                <VideoPlayer
                  src={featuredVideo.media.url}
                  poster={featuredVideo.media.thumbnail_url}
                  title={featuredVideo.media.title || `Virtual Tour - ${featuredVideo.property.name}`}
                  className="aspect-[16/9] w-full"
                  autoPlay={true}
                  muted={true}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION KAMAR PUBLIK DISEMBUNYIKAN SEMENTARA SESUAI INSTRUKSI */}

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

      {/* PUBLIC COMPLAINT SECTION (ADUAN PUBLIK / PENGUNJUNG) */}
      <PublicComplaintSection />

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
              href="/properti"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Lihat Pilihan Properti
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
