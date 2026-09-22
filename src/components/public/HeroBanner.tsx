'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, DoorClosed, ArrowRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 border-b border-slate-200/80 gradient-fresh-horizon">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold border border-emerald-200/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sistem Sewa Digital Modern & Transparan</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Temukan Kos Nyaman, <br />
              <span className="text-teal-700">Hunian Idaman Anda.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Hunian kos bersih, fasilitas komplit, dan lokasi strategis. Booking kamar favorit Anda secara online dalam 2 menit tanpa perantara.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/kamar"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white gradient-emerald-glow shadow-emerald-glow hover:opacity-95 transition-all"
              >
                <DoorClosed className="w-4 h-4" />
                Jelajahi Pilihan Kamar
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#fasilitas"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors"
              >
                Fasilitas Unggulan
              </a>
            </div>

            {/* Quick Trust Badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-md text-slate-600">
              <div>
                <p className="text-xl sm:text-2xl font-black text-teal-800">100%</p>
                <p className="text-xs text-slate-500 font-medium">Bebas Calo / Agen</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-teal-800">24 Jam</p>
                <p className="text-xs text-slate-500 font-medium">Layanan Tanggap</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-teal-800">Resmi</p>
                <p className="text-xs text-slate-500 font-medium">Kontrak Sewa Digital</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80"
                alt="Kamar Kos Modern"
                className="w-full h-80 sm:h-96 object-cover"
              />
              {/* Glassmorphic Overlay Card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Paling Favorit
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Deluxe King Comfort</h4>
                  <p className="text-xs text-slate-500">AC • Kasur Queen • WiFi 100 Mbps</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Mulai dari</p>
                  <p className="text-sm font-extrabold text-teal-800">Rp 1,75 Jt<span className="text-[10px] font-normal text-slate-500">/bln</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
