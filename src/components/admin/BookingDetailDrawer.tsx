'use client';

import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Booking } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface BookingDetailDrawerProps {
  booking: Booking | null;
  onClose: () => void;
  onApprove: (booking: Booking) => void;
  onReject: (booking: Booking) => void;
  onOpenKtpModal?: (url: string, name: string) => void;
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  booking,
  onClose,
  onApprove,
  onReject,
  onOpenKtpModal,
}) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Detail Permohonan Booking
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Nama Lengkap</span>
              <span className="font-bold text-slate-800 text-sm">{booking.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Nomor WhatsApp</span>
              <span className="font-semibold text-slate-800">{booking.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Alamat Email</span>
              <span className="text-slate-700">{booking.email || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Rencana Masuk</span>
              <span className="font-semibold text-teal-800">{booking.requested_move_in}</span>
            </div>
          </div>

          {/* Room Info */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-700">Kamar Dipilih</span>
              <p className="font-bold text-slate-900 text-sm">
                Unit {booking.room?.room_number} • {booking.room?.name}
              </p>
              <p className="text-[11px] text-slate-500">
                Tipe {booking.room?.type} ({booking.room ? formatRupiah(booking.room.base_price) : '-'} / bln)
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {/* KTP Document Access */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Dokumen Identitas (KTP)
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Berkas KTP disimpan di storage privat. Akses pratinjau dilindungi signed URL sementara (5 menit).
            </p>

            {booking.ktp_preview_url ? (
              <div className="flex items-center gap-2 pt-1">
                {onOpenKtpModal ? (
                  <button
                    type="button"
                    onClick={() => onOpenKtpModal(booking.ktp_preview_url!, booking.name)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Lihat Pratinjau KTP
                  </button>
                ) : (
                  <a
                    href={booking.ktp_preview_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Berkas KTP Asli
                  </a>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                URL pratinjau tidak tersedia
              </span>
            )}
          </div>

          {booking.rejection_reason && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <strong>Alasan Penolakan:</strong> {booking.rejection_reason}
            </div>
          )}
        </div>

        {booking.status === 'menunggu' && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onReject(booking)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 cursor-pointer"
            >
              Tolak Permohonan
            </button>
            <button
              type="button"
              onClick={() => onApprove(booking)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-emerald-glow shadow-xs cursor-pointer"
            >
              Setujui & Buat Sewa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
