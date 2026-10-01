'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Info,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';
import { WaAntiBanStatus } from '@/lib/types';

interface WaAntiBanWidgetProps {
  antiban?: WaAntiBanStatus;
  isLoading: boolean;
  onRefresh: () => void;
}

export const WaAntiBanWidget: React.FC<WaAntiBanWidgetProps> = ({
  antiban,
  isLoading,
  onRefresh,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!antiban && isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft-card animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-100 rounded-xl"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!antiban) {
    return null;
  }

  const handleResetCircuit = async () => {
    try {
      setIsResetting(true);
      setFeedback(null);
      const res = await fetch('/api/proxy/admin/wa/antiban/reset-circuit', {
        method: 'POST',
      });

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: 'Circuit breaker berhasil di-reset. Antrean WhatsApp kembali normal.',
        });
        onRefresh();
      } else {
        const json = await res.json().catch(() => ({}));
        setFeedback({
          type: 'error',
          message: json.message || 'Gagal me-reset circuit breaker.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Koneksi ke server gagal saat me-reset circuit breaker.',
      });
    } finally {
      setIsResetting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const hourlyPct = Math.min(100, Math.round((antiban.hourly_count / Math.max(1, antiban.hourly_max)) * 100));
  const dailyPct = Math.min(100, Math.round((antiban.daily_count / Math.max(1, antiban.daily_max)) * 100));

  const isCircuitOpen = antiban.circuit_breaker_open;
  const isBusinessHours = antiban.is_within_business_hours;
  const isSendingAllowed = antiban.is_sending_allowed;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft-card space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={clsx(
            'p-4 rounded-xl flex items-center justify-between text-xs font-semibold border transition-all',
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Circuit Breaker Alert Banner */}
      {isCircuitOpen && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Circuit Breaker Terpicu (Pengiriman Dihentikan Sementara)
              </h4>
              <p className="text-xs text-rose-700 mt-1">
                Terdeteksi kegagalan berturut-turut pada gateway WhatsApp. Antrean ditahan selama 30 menit demi mencegah pemblokiran nomor oleh WhatsApp.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetCircuit}
            disabled={isResetting}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm shrink-0 disabled:opacity-50"
          >
            <RotateCcw className={clsx('w-3.5 h-3.5', isResetting && 'animate-spin')} />
            Reset Circuit Breaker
          </button>
        </div>
      )}

      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div
            className={clsx(
              'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all',
              isCircuitOpen
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : !isBusinessHours
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            )}
          >
            {isCircuitOpen ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Perisai Anti-Ban & Rate Limiter WhatsApp
              </h3>
              <span
                className={clsx(
                  'px-2.5 py-0.5 text-[11px] font-bold rounded-full border',
                  isCircuitOpen
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : !isBusinessHours
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                )}
              >
                {isCircuitOpen
                  ? 'Circuit Breaker Aktif'
                  : !isBusinessHours
                  ? 'Di Luar Jam Kerja (Pesan Ditahan)'
                  : 'Proteksi Berjalan Normal'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-layer rate limiting, random delay jitter, dan diversifikasi hash pesan otomatis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {antiban.consecutive_failures > 0 && !isCircuitOpen && (
            <button
              onClick={handleResetCircuit}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all disabled:opacity-50"
              title="Reset penghitung kegagalan beruntun"
            >
              <RotateCcw className={clsx('w-3 h-3', isResetting && 'animate-spin')} />
              Reset Fail Counter ({antiban.consecutive_failures})
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="Segarkan Metrik Anti-Ban"
          >
            <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Grid Status Metrik Anti-Ban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Hourly Cap */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Batas Per Jam</span>
            <span className="text-[11px] font-bold text-slate-700 font-mono">
              {antiban.hourly_count}/{antiban.hourly_max}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                hourlyPct >= 100
                  ? 'bg-rose-500'
                  : hourlyPct >= 70
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              )}
              style={{ width: `${hourlyPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Maks 10 pesan/jam</span>
            <span>{hourlyPct}%</span>
          </div>
        </div>

        {/* Metric 2: Daily Cap */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Batas Harian</span>
            <span className="text-[11px] font-bold text-slate-700 font-mono">
              {antiban.daily_count}/{antiban.daily_max}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                dailyPct >= 100
                  ? 'bg-rose-500'
                  : dailyPct >= 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              )}
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Zona aman harian</span>
            <span>{dailyPct}%</span>
          </div>
        </div>

        {/* Metric 3: Business Hours */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jam Operasional</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-900">
            {antiban.business_hours}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={clsx(
                'w-2 h-2 rounded-full',
                isBusinessHours ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              )}
            />
            <span className="text-[11px] font-medium text-slate-600">
              {isBusinessHours ? 'Jendela Aktif' : 'Ditahan hingga 08:00 WIB'}
            </span>
          </div>
        </div>

        {/* Metric 4: Pacing & Hash Masking */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jeda & Diversifikasi</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-sm font-bold text-slate-900">
            {antiban.delay_range}
          </p>
          <span className="text-[11px] text-slate-500 block truncate" title="Zero-width hash masking & salam adaptif">
            Jitter + Hash Masking Aktif
          </span>
        </div>
      </div>

      {/* Feature Badges Footer */}
      <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium text-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Circuit Threshold: {antiban.circuit_breaker_threshold}x Gagal
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium text-slate-700">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            Throttle Nomor Asing: Maks 2x/hari
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Chatbot Direct Reply: Selalu Aktif (Bypass)
          </span>
        </div>

        <div className="text-[11px] text-slate-400 italic">
          {isSendingAllowed
            ? '✓ Siap memproses pengiriman antrean otomatis'
            : '⏸ Pengiriman antrean ditunda demi keselamatan akun'}
        </div>
      </div>
    </div>
  );
};
