'use client';

import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User as UserIcon,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { WaMessage, WaMessageStatus } from '@/lib/types';

interface WaMessageTableProps {
  messages: WaMessage[];
  isLoading: boolean;
  onResend: (id: string) => Promise<void>;
  resendingId: string | null;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  directionFilter: string;
  onDirectionFilterChange: (val: string) => void;
}

export const WaMessageTable: React.FC<WaMessageTableProps> = ({
  messages,
  isLoading,
  onResend,
  resendingId,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  directionFilter,
  onDirectionFilterChange,
}) => {
  const getStatusBadge = (status: WaMessageStatus) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Terkirim
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Antrean
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            Gagal
          </span>
        );
      case 'received':
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3 h-3" />
            Diterima
          </span>
        );
      case 'ignored':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Dilewati (Opt-out)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-card overflow-hidden">
      {/* Table Filter Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nomor, nama, atau isi pesan..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={directionFilter}
              onChange={(e) => onDirectionFilterChange(e.target.value)}
              className="text-xs bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="">Semua Arah</option>
              <option value="out">Keluar (Out)</option>
              <option value="in">Masuk (In)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="text-xs bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="">Semua Status</option>
              <option value="sent">Terkirim</option>
              <option value="queued">Antrean</option>
              <option value="failed">Gagal</option>
              <option value="ignored">Dilewati</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Arah</th>
              <th className="py-3 px-4">Penerima / Pengirim</th>
              <th className="py-3 px-4">Isi Pesan</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                  Memuat riwayat pesan WhatsApp...
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Tidak ada pesan WhatsApp yang sesuai dengan kriteria filter.
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    {msg.direction === 'out' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        Keluar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        <ArrowDownLeft className="w-3 h-3 text-teal-600" />
                        Masuk
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">
                      {msg.phone_display || msg.phone}
                    </div>
                    {msg.tenant ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <UserIcon className="w-3 h-3" />
                        <span>{msg.tenant.name}</span>
                        {msg.tenant.room_number && (
                          <span className="bg-slate-100 px-1 py-0.2 rounded text-slate-600">
                            Kamar {msg.tenant.room_number}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">Non-penghuni</span>
                    )}
                  </td>

                  <td className="py-3 px-4 max-w-md">
                    <p className="line-clamp-2 text-slate-700 font-sans text-xs">
                      {msg.body || <span className="italic text-slate-400">Pesan media tanpa teks</span>}
                    </p>
                    {msg.template_key && (
                      <span className="inline-block mt-1 text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        template: {msg.template_key}
                      </span>
                    )}
                    {msg.error_message && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {msg.error_message}
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {getStatusBadge(msg.status)}
                    {msg.attempts > 1 && (
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {msg.attempts} kali percobaan
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    <div>{new Date(msg.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="text-slate-400">{new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {msg.status === 'failed' && (
                      <button
                        onClick={() => onResend(msg.id)}
                        disabled={resendingId === msg.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all disabled:opacity-50"
                      >
                        <RotateCcw className={clsx('w-3 h-3', resendingId === msg.id && 'animate-spin')} />
                        Kirim Ulang
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
