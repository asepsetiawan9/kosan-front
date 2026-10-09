'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, CalendarClock, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BillingAlertBannerProps {
  summary: {
    jatuh_tempo_hari_ini: number;
    mendekati: number;
    tunggakan: number;
    lunas_bulan_ini: number;
    total_target: number;
  };
  isLoading?: boolean;
}

export const BillingAlertBanner: React.FC<BillingAlertBannerProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-18 rounded-2xl bg-slate-100/70 animate-pulse border border-slate-200/60" />
    );
  }

  const { tunggakan, jatuh_tempo_hari_ini, mendekati, lunas_bulan_ini, total_target } = summary;

  // Kasus 1: Ada tunggakan pembayaran (Prioritas Tertinggi - Kritis)
  if (tunggakan > 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/70 p-4 md:p-5 shadow-xs transition-all duration-200 hover:shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="relative flex items-center justify-center p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0 border border-rose-200/80">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-md">
                  Perhatian Mendesak
                </span>
                <span className="text-xs font-medium text-rose-700">
                  {tunggakan} penyewa melewati batas tempo
                </span>
              </div>
              <h3 className="text-sm md:text-base font-bold text-slate-900 mt-1">
                Terdapat {tunggakan} Tunggakan Pembayaran Sewa Aktif
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Segera kirim pengingat ramah via WhatsApp untuk menjaga kelancaran arus kas kosan Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Link href="/dashboard/billing?status=tunggakan" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white shadow-xs gap-1.5 font-semibold text-xs">
                <Zap className="w-3.5 h-3.5" />
                Tagih Tunggakan ({tunggakan})
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Kasus 2: Ada yang jatuh tempo hari ini (Peringatan Harian)
  if (jatuh_tempo_hari_ini > 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 p-4 md:p-5 shadow-xs transition-all duration-200 hover:shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 border border-amber-200/80">
              <CalendarClock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-md">
                  Jatuh Tempo Hari Ini
                </span>
                <span className="text-xs font-medium text-amber-800">
                  {jatuh_tempo_hari_ini} penyewa perlu diingatkan
                </span>
              </div>
              <h3 className="text-sm md:text-base font-bold text-slate-900 mt-1">
                {jatuh_tempo_hari_ini} Tagihan Sewa Jatuh Tempo Hari Ini
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Sapa penyewa hari ini dengan pesan pengingat tagihan bulanan dan nomor rekening tujuan transfer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Link href="/dashboard/billing?status=jatuh_tempo_hari_ini" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-xs gap-1.5 font-semibold text-xs">
                Kirim Pengingat Hari Ini
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Kasus 3: Mendekati jatuh tempo (H-3)
  if (mendekati > 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/60 p-4 md:p-5 shadow-xs transition-all duration-200 hover:shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex items-center justify-center p-2.5 rounded-xl bg-blue-100 text-blue-800 shrink-0 border border-blue-200/80">
              <CalendarClock className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded-md">
                  Mendekati Batas Waktu
                </span>
                <span className="text-xs font-medium text-blue-800">
                  {mendekati} penyewa dalam 1-3 hari ke depan
                </span>
              </div>
              <h3 className="text-sm md:text-base font-bold text-slate-900 mt-1">
                {mendekati} Tagihan Akan Segera Jatuh Tempo
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Kirim pesan awal santun agar penyewa dapat menyiapkan pembayaran tepat waktu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Link href="/dashboard/billing?status=mendekati" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full sm:w-auto bg-white text-blue-700 border-blue-300 hover:bg-blue-50 shadow-2xs gap-1.5 font-semibold text-xs">
                Lihat Tagihan Mendekati
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Kasus 4: Semua Terkendali & Lunas (Kolektibilitas Sangat Bagus)
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 md:p-5 shadow-xs transition-all duration-200 hover:shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex items-center justify-center p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200/80">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                Status Prima
              </span>
              <span className="text-xs font-medium text-emerald-800">
                {lunas_bulan_ini} dari {total_target || 0} tagihan terbayar
              </span>
            </div>
            <h3 className="text-sm md:text-base font-bold text-slate-900 mt-1">
              Tidak Ada Tunggakan Tertunda
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
              Arus kas berjalan optimal dan seluruh tagihan bulan berjalan berada dalam kondisi terkontrol dengan baik.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link href="/dashboard/billing" className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full sm:w-auto bg-white text-teal-800 border-emerald-300 hover:bg-emerald-50 shadow-2xs gap-1.5 font-semibold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Pusat Penagihan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
