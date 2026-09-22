'use client';

import React from 'react';
import { CalendarCheck, Loader2, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Booking } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  error?: any;
  onSelectBooking: (booking: Booking) => void;
  onApprove: (booking: Booking) => void;
  onReject: (booking: Booking) => void;
}

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  isLoading,
  error,
  onSelectBooking,
  onApprove,
  onReject,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-700 mb-2" />
          Memuat daftar booking masuk...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-rose-600">
          Gagal memuat data booking. Silakan coba lagi.
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center">
          <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">Belum ada permohonan booking</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Permohonan sewa yang diajukan oleh tamu publik akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Calon Penghuni</th>
                <th className="px-5 py-3.5">Kamar Incaran</th>
                <th className="px-5 py-3.5">Rencana Masuk</th>
                <th className="px-5 py-3.5">Tgl Pengajuan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{b.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{b.phone}</span>
                      {b.email && <span>• {b.email}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-800">
                      Unit {b.room?.room_number || '-'} ({b.room?.type || '-'})
                    </div>
                    <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                      {b.room ? formatRupiah(b.room.base_price) : '-'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">
                    {b.requested_move_in}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectBooking(b)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-teal-800 hover:bg-teal-50 border border-slate-200 transition-colors cursor-pointer"
                        title="Lihat Detail & KTP"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {b.status === 'menunggu' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove(b)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white gradient-emerald-glow hover:opacity-95 shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(b)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
