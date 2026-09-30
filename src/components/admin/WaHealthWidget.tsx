'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Wifi,
  WifiOff,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { WaHealthCheckResponse } from '@/lib/types';

interface WaHealthWidgetProps {
  compact?: boolean;
  onOpenTestModal?: () => void;
}

export const WaHealthWidget: React.FC<WaHealthWidgetProps> = ({
  compact = false,
  onOpenTestModal,
}) => {
  const [health, setHealth] = useState<WaHealthCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/proxy/admin/wa/health');
      const json = await res.json().catch(() => null);
      if (json && json.data) {
        setHealth(json.data);
        setLastChecked(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp health diagnostics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const isHealthy = health?.status === 'healthy';
  const isDegraded = health?.status === 'degraded';
  const isUnhealthy = health?.status === 'unhealthy';

  const providerConnected = health?.checks?.provider?.connected ?? false;
  const dbOk = health?.checks?.database?.status === 'ok';
  const queueOk = health?.checks?.queue?.status === 'ok';
  const metricsOk = health?.checks?.messages?.status === 'ok';

  if (!health && isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-card p-6 flex items-center justify-center gap-3 text-slate-500 py-12">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
        <span className="text-sm font-medium">Memeriksa status diagnostik WhatsApp...</span>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-card p-6 flex flex-col items-center justify-center gap-3 text-slate-500 py-10">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-sm font-semibold text-slate-800">Tidak dapat memuat data diagnostik WhatsApp</p>
        <p className="text-xs text-slate-500">Periksa koneksi jaringan atau otentikasi sesi Anda.</p>
        <button
          onClick={fetchHealth}
          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft-card hover:shadow-md transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all',
                isHealthy
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80 shadow-2xs'
                  : isDegraded
                  ? 'bg-amber-50 text-amber-600 border-amber-200/80'
                  : 'bg-rose-50 text-rose-600 border-rose-200/80'
              )}
            >
              <Activity className={clsx('w-5 h-5', isHealthy && 'animate-pulse')} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">WhatsApp Subsystem</h4>
                <span
                  className={clsx(
                    'px-2 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1',
                    isHealthy
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isDegraded
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  )}
                >
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full',
                      isHealthy
                        ? 'bg-emerald-500 animate-ping'
                        : isDegraded
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    )}
                  />
                  {isHealthy ? 'Operasional' : isDegraded ? 'Perhatian' : 'Kendala'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Provider: <span className="font-semibold text-slate-700 uppercase">{health?.checks?.provider?.provider || 'Unknown'}</span>
                {health?.checks?.provider?.device && ` • ${health.checks.provider.device}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchHealth}
              disabled={isLoading}
              title="Perbarui Diagnostik"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
            <Link
              href="/dashboard/wa-settings/connection"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl border border-emerald-200/60 transition-all"
            >
              <span>Kelola</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Quick Micro Badges */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            {providerConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
            <span className="truncate">Gateway {providerConnected ? 'Online' : 'Offline'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            {queueOk ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className="truncate">Queue {health?.checks?.queue?.failed_jobs ?? 0} gagal</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            {metricsOk ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className="truncate">{health?.checks?.messages?.sent_last_24h ?? 0} terkirim 24j</span>
          </div>
        </div>
      </div>
    );
  }

  // Full Diagnostic Panel View
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-card p-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div
            className={clsx(
              'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all',
              isHealthy
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/80 shadow-2xs'
                : isDegraded
                ? 'bg-amber-50 text-amber-600 border-amber-200/80'
                : 'bg-rose-50 text-rose-600 border-rose-200/80'
            )}
          >
            <Activity className={clsx('w-6 h-6', isHealthy && 'animate-pulse')} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Pusat Diagnostik & Kesehatan WhatsApp
              </h3>
              <span
                className={clsx(
                  'px-2.5 py-0.5 text-xs font-bold rounded-full border flex items-center gap-1.5',
                  isHealthy
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isDegraded
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                )}
              >
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    isHealthy
                      ? 'bg-emerald-500 animate-ping'
                      : isDegraded
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  )}
                />
                {isHealthy ? 'Semua Sistem Sehat' : isDegraded ? 'Kinerja Terdegradasi' : 'Gangguan Sistem'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemantauan real-time gateway provider, antrean background worker, dan keandalan transmisi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {health?.execution_time_ms !== undefined && (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {health.execution_time_ms} ms
            </span>
          )}
          <button
            onClick={fetchHealth}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            Uji Diagnostik
          </button>
          {onOpenTestModal && (
            <button
              onClick={onOpenTestModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-2xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Pesan Uji
            </button>
          )}
        </div>
      </div>

      {/* 4 Cards Subsystem Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Gateway Provider */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-slate-500" />
              Gateway Provider
            </span>
            {providerConnected ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                Online
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                Offline
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 uppercase">
              {health?.checks?.provider?.provider || 'Unknown'}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {health?.checks?.provider?.phone || health?.checks?.provider?.device || 'Tidak ada nomor'}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 line-clamp-1">
            {health?.checks?.provider?.message}
          </p>
        </div>

        {/* 2. Database Connectivity */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-slate-500" />
              Basis Data
            </span>
            {dbOk ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                Lancar
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                Gangguan
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 uppercase">
              {health?.checks?.database?.driver || 'SQL'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Respon Latency: <span className="font-semibold text-slate-700">{health?.checks?.database?.latency_ms ?? '-'} ms</span>
            </p>
          </div>
          <p className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 line-clamp-1">
            {health?.checks?.database?.message}
          </p>
        </div>

        {/* 3. Queue Worker & Antrean */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" />
              Antrean & Worker
            </span>
            {queueOk ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                Normal
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                Peringatan
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {health?.checks?.queue?.pending_jobs ?? 0} Tertunda
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Gagal: <span className={clsx('font-semibold', (health?.checks?.queue?.failed_jobs ?? 0) > 0 ? 'text-rose-600' : 'text-slate-700')}>{health?.checks?.queue?.failed_jobs ?? 0}</span> • Antre WA: {health?.checks?.queue?.queued_messages ?? 0}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 line-clamp-1">
            {health?.checks?.queue?.message}
          </p>
        </div>

        {/* 4. Keandalan 24 Jam & Scheduler */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Pengiriman 24 Jam
            </span>
            {metricsOk ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                Baik
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                Tinggi
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {health?.checks?.messages?.sent_last_24h ?? 0} Terkirim
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Gagal: <span className={clsx('font-semibold', (health?.checks?.messages?.failed_last_24h ?? 0) > 0 ? 'text-rose-600' : 'text-slate-700')}>{health?.checks?.messages?.failed_last_24h ?? 0}</span> ({health?.checks?.messages?.failure_rate_percent ?? 0}%)
            </p>
          </div>
          <p className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 line-clamp-1">
            {health?.checks?.scheduler?.message}
          </p>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2">
        <div className="flex items-center gap-3">
          <span>Env: <strong className="text-slate-600 uppercase">{health?.system?.app_env}</strong></span>
          <span>•</span>
          <span>Timezone: <strong className="text-slate-600">{health?.system?.timezone}</strong></span>
          <span>•</span>
          <span>PHP: <strong className="text-slate-600">{health?.system?.php_version}</strong></span>
          <span>•</span>
          <span>Laravel: <strong className="text-slate-600">{health?.system?.laravel_version}</strong></span>
        </div>
        {lastChecked && (
          <div className="text-[11px] text-slate-400">
            Terakhir diperiksa: {lastChecked.toLocaleTimeString('id-ID')}
          </div>
        )}
      </div>
    </div>
  );
};
