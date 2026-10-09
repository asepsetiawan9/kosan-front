'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  History,
  ArrowLeft,
  Smartphone,
  Calendar,
  Building,
  User,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface BillingLogItem {
  id: string;
  tenancy_id: string;
  invoice_id: string | null;
  template_id: string | null;
  rendered_msg: string;
  phone_target: string;
  channel: string;
  admin_id: string;
  created_at: string;
  tenancy?: {
    tenant_name: string;
    room?: {
      room_number: string;
      property?: {
        name: string;
      };
    };
  };
  template?: {
    title: string;
    key: string;
  };
  admin?: {
    name: string;
    email: string;
  };
}

interface PaginationData {
  current_page: number;
  last_page: number;
  total: number;
  data: BillingLogItem[];
}

export default function BillingHistoryPage() {
  const [logs, setLogs] = useState<BillingLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<BillingLogItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const loadHistory = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<PaginationData>(`admin/billing/history?page=${page}`);
      setLogs(res.data);
      setPagination(res);
      setCurrentPage(res.current_page);
    } catch (err) {
      console.error('Failed to load billing history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  const handleCopyMessage = async (msg: string) => {
    await navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/billing"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Riwayat Penagihan WhatsApp
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Catatan pengingat tagihan yang telah dikirimkan oleh administrator
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-soft-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Waktu & Tanggal</th>
                <th className="py-3 px-3">Kamar & Properti</th>
                <th className="py-3 px-3">Penghuni & No. HP</th>
                <th className="py-3 px-3">Format Pesan</th>
                <th className="py-3 px-3">Cuplikan Pesan</th>
                <th className="py-3 px-3">Petugas</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded-md w-full"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700 text-sm">
                      Belum ada riwayat penagihan
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Catatan akan otomatis tersimpan setiap kali Anda menekan tombol &quot;Buka di WhatsApp&quot;
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const date = new Date(log.created_at);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Tanggal & Waktu */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {date.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {date.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WIB
                        </div>
                      </td>

                      {/* Kamar & Properti */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-900">
                          Kamar {log.tenancy?.room?.room_number ?? '-'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                          {log.tenancy?.room?.property?.name ?? 'Kosan'}
                        </div>
                      </td>

                      {/* Penghuni & HP */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">
                          {log.tenancy?.tenant_name ?? 'Penghuni'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {log.phone_target}
                        </div>
                      </td>

                      {/* Format Pesan */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                          {log.template?.title ?? 'Kustom'}
                        </span>
                      </td>

                      {/* Cuplikan Pesan */}
                      <td className="py-3.5 px-3 max-w-[220px]">
                        <p className="text-slate-600 truncate text-[11px] bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          {log.rendered_msg}
                        </p>
                      </td>

                      {/* Petugas */}
                      <td className="py-3.5 px-3 text-slate-600">
                        <div className="font-medium">{log.admin?.name ?? 'Admin'}</div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLog(log)}
                          className="text-xs h-7 px-2.5 text-slate-600 hover:text-slate-900"
                        >
                          Lihat Pesan
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Halaman {pagination.current_page} dari {pagination.last_page} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => loadHistory(currentPage - 1)}
                className="text-xs h-7"
              >
                Sebelumnya
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= pagination.last_page}
                onClick={() => loadHistory(currentPage + 1)}
                className="text-xs h-7"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Message Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Detail Pesan Penagihan"
          description={`Terkirim ke ${selectedLog.tenancy?.tenant_name ?? 'Penghuni'} (${selectedLog.phone_target})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal Kirim:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedLog.created_at).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Saluran:</span>
                <span className="font-semibold text-emerald-700 uppercase">
                  {selectedLog.channel.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dicatat Oleh:</span>
                <span className="font-semibold text-slate-800">
                  {selectedLog.admin?.name ?? 'Admin'}
                </span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block mb-1">
                Isi Pesan Lengkap:
              </span>
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-sans whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedLog.rendered_msg}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyMessage(selectedLog.rendered_msg)}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Salin Pesan
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedLog(null)}
                className="text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
