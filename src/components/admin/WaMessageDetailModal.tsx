'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { WaMessage } from '@/lib/types';
import {
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Phone,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';

interface WaMessageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: WaMessage | null;
  onResend?: (id: string) => Promise<void>;
  isResending?: boolean;
}

export const WaMessageDetailModal: React.FC<WaMessageDetailModalProps> = ({
  isOpen,
  onClose,
  message,
  onResend,
  isResending = false,
}) => {
  if (!message) return null;

  const isIncoming = message.direction === 'in';
  const isFailed = message.status === 'failed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Riwayat Pesan WhatsApp"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                isIncoming ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
              }`}
            >
              {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {isIncoming ? 'Pesan Masuk (Penghuni → Sistem)' : 'Pesan Keluar (Sistem → Penghuni)'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Provider: {message.provider.toUpperCase()}
              </p>
            </div>
          </div>

          <div>
            {message.status === 'sent' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terkirim
              </span>
            )}
            {message.status === 'queued' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                <Clock className="w-3.5 h-3.5" /> Antrean
              </span>
            )}
            {message.status === 'failed' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5" /> Gagal ({message.attempts}x)
              </span>
            )}
            {message.status === 'ignored' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                Dilewati (Opt-Out)
              </span>
            )}
          </div>
        </div>

        {/* Recipient & Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Penerima / Nomor Ponsel
            </span>
            <p className="font-bold text-slate-900 font-mono flex items-center gap-1.5 text-sm">
              <Phone className="w-3.5 h-3.5 text-teal-600" /> {message.phone_display || message.phone}
            </p>
            {message.tenant && (
              <p className="text-slate-600 flex items-center gap-1 mt-1 font-medium">
                <User className="w-3 h-3 text-slate-400" />
                {message.tenant.name} {message.tenant.room_number ? `(Kamar ${message.tenant.room_number})` : ''}
              </p>
            )}
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Waktu Transmisi
            </span>
            <p className="font-medium text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(message.created_at).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })} WIB
            </p>
            {message.template_key && (
              <p className="text-[11px] text-teal-700 font-mono mt-1 font-semibold">
                Template: {message.template_key}
              </p>
            )}
          </div>
        </div>

        {/* Message Bubble */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Konten Pesan WhatsApp
          </label>
          <div className="p-4 bg-[#EFEAE2] rounded-xl border border-slate-300 shadow-inner">
            <div
              className={`max-w-md ${
                isIncoming ? 'mr-auto bg-white' : 'ml-auto bg-[#DCF8C6]'
              } text-slate-900 text-xs sm:text-sm p-3.5 rounded-2xl ${
                isIncoming ? 'rounded-tl-xs' : 'rounded-tr-xs'
              } shadow-xs space-y-1`}
            >
              <p className="whitespace-pre-wrap font-sans leading-relaxed">{message.body || '-'}</p>
              <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                {message.sent_at
                  ? new Date(message.sent_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}{' '}
                WIB {message.status === 'sent' ? '✓✓' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Failure reason if failed */}
        {isFailed && message.error_message && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Penyebab Kegagalan Kirim:
            </p>
            <p className="font-mono text-rose-700 bg-white/60 p-2 rounded border border-rose-200/60 whitespace-pre-wrap">
              {message.error_message}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>

          {isFailed && onResend && (
            <Button
              type="button"
              variant="primary"
              onClick={() => onResend(message.id)}
              isLoading={isResending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RotateCw className="w-3.5 h-3.5 mr-1.5" />
              Kirim Ulang Pesan Ini
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
