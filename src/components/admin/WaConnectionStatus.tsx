'use client';

import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  Smartphone,
  Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { WaConnectionStatus as IWaConnectionStatus } from '@/lib/types';

interface WaConnectionStatusProps {
  status: IWaConnectionStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenTestModal: () => void;
}

export const WaConnectionStatus: React.FC<WaConnectionStatusProps> = ({
  status,
  isLoading,
  onRefresh,
  onOpenTestModal,
}) => {
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const isConnected = status?.status === 'connected';
  const isFake = status?.provider === 'fake';

  const handleCopyWebhook = () => {
    if (!status?.webhook_url) return;
    navigator.clipboard.writeText(status.webhook_url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* High Failure Rate Warning Banner */}
      {status?.has_high_failure_rate && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-900">
              Peringatan Tingkat Kegagalan Tinggi ({status.failed_last_24h} pesan gagal dalam 24 jam)
            </h4>
            <p className="text-xs text-rose-700 mt-1">
              Beberapa pesan WhatsApp gagal terkirim. Periksa koneksi device WhatsApp di Fonnte atau pastikan nomor tujuan berformat aktif.
            </p>
          </div>
        </div>
      )}

      {/* Main Connection Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all',
                isConnected
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              )}
            >
              {isConnected ? (
                <Wifi className="w-6 h-6 animate-pulse" />
              ) : (
                <WifiOff className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {isFake ? 'Gateway WhatsApp (Mode Simulasi / Testing)' : 'Gateway Fonnte WhatsApp'}
                </h2>
                <span
                  className={clsx(
                    'px-2.5 py-0.5 text-xs font-semibold rounded-full border',
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  )}
                >
                  {isConnected ? 'Terhubung' : 'Terputus'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Provider aktif: <span className="font-semibold uppercase text-slate-700">{status?.provider || 'Unknown'}</span>
                {status?.device && ` • Device: ${status.device}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', isLoading && 'animate-spin')} />
              Periksa Status
            </button>
            <button
              onClick={onOpenTestModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim Pesan Uji
            </button>
          </div>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Nomor Pengirim</span>
              <Smartphone className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-900 mt-2">
              {status?.phone || status?.device || '-'}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {isConnected ? 'Device Terdaftar' : 'Belum Sinkron'}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Terkirim 24 Jam</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-emerald-700 mt-2">
              {status?.sent_last_24h ?? 0}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Pesan berhasil diproses
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Gagal 24 Jam</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-rose-600 mt-2">
              {status?.failed_last_24h ?? 0}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Kegagalan transmisi
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Jeda Anti-Ban</span>
              <Info className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-slate-900 mt-2">
              {status?.send_delay ? `${status.send_delay.min}-${status.send_delay.max} Detik` : '3-10 Detik'}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Jeda acak worker queue
            </span>
          </div>
        </div>

        {/* Webhook Configuration Preview */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/80 rounded-xl p-4 border border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-800">
                  URL Webhook Masuk (Webhook Receiver)
                </span>
                {status?.webhook_secret_set && (
                  <span className="bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-teal-200">
                    Secret Terproteksi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono break-all">
                {status?.webhook_url || '-'}
              </p>
            </div>
            <button
              onClick={handleCopyWebhook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-all shrink-0"
            >
              {copiedWebhook ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin URL
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
