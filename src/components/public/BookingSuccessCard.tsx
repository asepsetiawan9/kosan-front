'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface BookingSuccessCardProps {
  room: Room;
  name: string;
  phone: string;
  moveInDate: string;
  onClose: () => void;
}

export const BookingSuccessCard: React.FC<BookingSuccessCardProps> = ({
  room,
  name,
  phone,
  moveInDate,
  onClose,
}) => {
  return (
    <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h4 className="text-lg font-bold text-slate-900">
          Permohonan Booking Terkirim!
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Terima kasih, <strong className="text-slate-800">{name}</strong>. Permohonan sewa kamar{' '}
          <strong className="text-slate-800">{room.room_number}</strong> telah berhasil kami catat.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-500">Nomor Kamar:</span>
          <span className="font-semibold text-slate-800">{room.room_number} ({room.type})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Rencana Masuk:</span>
          <span className="font-semibold text-slate-800">{moveInDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Nomor Kontak:</span>
          <span className="font-semibold text-slate-800">{phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Biaya Sewa:</span>
          <span className="font-semibold text-teal-800">{formatRupiah(room.base_price)} / bulan</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs text-left leading-relaxed">
        ℹ️ <strong>Langkah Berikutnya:</strong> Pengelola kos akan memvalidasi data Anda dan mengirimkan konfirmasi persetujuan serta rincian pembayaran sewa via WhatsApp ke nomor <strong>{phone}</strong>.
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
      >
        Selesai & Tutup
      </button>
    </div>
  );
};
