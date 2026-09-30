'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { WaReminderDryRunResult } from '@/lib/types';
import {
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface WaReminderDryRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: WaReminderDryRunResult | null;
  onRunImmediate: () => void;
  isExecuting: boolean;
  onRefreshSimulation: (date?: string) => void;
}

export const WaReminderDryRunModal: React.FC<WaReminderDryRunModalProps> = ({
  isOpen,
  onClose,
  result,
  onRunImmediate,
  isExecuting,
  onRefreshSimulation,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  if (!result) return null;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    onRefreshSimulation(val || undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulasi Jadwal Pengingat WhatsApp (Dry-Run)"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Top Bar: Target Date & Quick Date Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold text-slate-700">Tanggal Simulasi:</span>
            <input
              type="date"
              value={selectedDate || result.target_date}
              onChange={handleDateChange}
              className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Waktu acuan: <span className="font-bold text-slate-700">Asia/Jakarta (WIB)</span>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl">
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Aturan Aktif</p>
            <p className="text-xl font-extrabold text-teal-950 mt-0.5">{result.rules_evaluated}</p>
            <p className="text-[10px] text-teal-700 mt-0.5">Sesuai jadwal kirim</p>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl">
            <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Tagihan Terdeteksi</p>
            <p className="text-xl font-extrabold text-blue-950 mt-0.5">{result.invoices_checked}</p>
            <p className="text-[10px] text-blue-700 mt-0.5">Belum lunas / terlambat</p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200/70 rounded-xl">
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Siap Dikirim</p>
            <p className="text-xl font-extrabold text-emerald-900 mt-0.5">
              {result.items.filter((i) => i.status === 'ready').length}
            </p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Akan masuk antrean</p>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Dilewati (Skip)</p>
            <p className="text-xl font-extrabold text-amber-950 mt-0.5">
              {result.skipped.already_sent + result.skipped.pending_payment + result.skipped.opted_out}
            </p>
            <p className="text-[10px] text-amber-700 mt-0.5">
              {result.skipped.pending_payment > 0 ? `${result.skipped.pending_payment} bukti pending` : 'Aman & idempotent'}
            </p>
          </div>
        </div>

        {/* Skipped Details Legend */}
        {(result.skipped.already_sent > 0 ||
          result.skipped.pending_payment > 0 ||
          result.skipped.opted_out > 0) && (
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg text-xs text-slate-600">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">Rincian filter pengaman:</span>
            {result.skipped.already_sent > 0 && (
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[11px]">
                {result.skipped.already_sent} sudah pernah dikirim
              </span>
            )}
            {result.skipped.pending_payment > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[11px]">
                {result.skipped.pending_payment} bukti transfer sedang diverifikasi
              </span>
            )}
            {result.skipped.opted_out > 0 && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[11px]">
                {result.skipped.opted_out} penghuni opt-out
              </span>
            )}
          </div>
        )}

        {/* Candidate List Table */}
        <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="p-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-teal-700" />
              Daftar Tagihan & Status Simulasi Pengingat
            </p>
            <span className="text-xs text-slate-500 font-medium">
              {result.items.length} entri ditemukan
            </span>
          </div>

          {result.items.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-800">Tidak ada pengingat yang perlu dikirim</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Semua tagihan untuk tanggal ini sudah lunas, sudah terkirim pengingatnya, atau belum ada yang memasuki kriteria aturan aktif.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/60 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">No. Tagihan</th>
                    <th className="py-2.5 px-3">Penghuni</th>
                    <th className="py-2.5 px-3">Aturan / Jadwal</th>
                    <th className="py-2.5 px-3">Jatuh Tempo</th>
                    <th className="py-2.5 px-3">Nominal</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {result.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {item.invoice_number}
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-800">{item.tenant_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {item.phone}
                        </p>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-700">{item.rule_name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {item.template_key}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{item.due_date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.nominal || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.status === 'ready' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <Send className="w-3 h-3" /> Siap Kirim
                          </span>
                        )}
                        {item.status === 'skipped' && item.skip_reason === 'pending_payment' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" /> Bukti Pending
                          </span>
                        )}
                        {item.status === 'skipped' && item.skip_reason === 'already_sent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                            Sudah Terkirim
                          </span>
                        )}
                        {item.status === 'skipped' && item.skip_reason === 'opted_out' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
                            Opt-Out
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.preview_body ? (
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-md text-[11px] font-semibold transition-colors"
                          >
                            <Eye className="w-3 h-3" /> Pratinjau
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview message drawer modal if clicked */}
        {previewItem && (
          <div className="p-3.5 bg-[#EFEAE2] border border-slate-300 rounded-xl shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                Pesan WhatsApp untuk {previewItem.tenant_name} ({previewItem.invoice_number})
              </span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold px-1.5 py-0.5 bg-white/80 rounded"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="max-w-md ml-auto bg-[#DCF8C6] text-slate-900 text-xs p-3 rounded-xl rounded-tr-xs shadow-xs space-y-1">
              <p className="whitespace-pre-wrap font-sans leading-relaxed">{previewItem.preview_body}</p>
              <div className="text-[10px] text-slate-500 text-right mt-1 font-mono">
                09:00 WIB ✓✓
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isExecuting}>
            Tutup
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onRunImmediate}
            isLoading={isExecuting}
            disabled={result.items.filter((i) => i.status === 'ready').length === 0}
            className="gradient-emerald-glow text-white shadow-emerald-glow"
          >
            <Send className="w-4 h-4 mr-2" />
            Jalankan Pengingat Sekarang ({result.items.filter((i) => i.status === 'ready').length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};
