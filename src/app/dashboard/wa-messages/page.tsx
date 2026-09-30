'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { WaMessage } from '@/lib/types';
import { WaMessageDetailModal } from '@/components/admin/WaMessageDetailModal';
import {
  MessageSquare,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Phone,
  Eye,
  Calendar,
} from 'lucide-react';

export default function WaMessagesPage() {
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedMessage, setSelectedMessage] = useState<WaMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMessages = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', '15');
      if (search) params.append('search', search);
      if (direction) params.append('direction', direction);
      if (status) params.append('status', status);

      const res = await fetch(`/api/proxy/admin/wa/messages?${params.toString()}`);
      const json = await res.json();

      if (res.ok) {
        setMessages(json.data || []);
        if (json.meta) {
          setCurrentPage(json.meta.current_page || 1);
          setTotalPages(json.meta.last_page || 1);
          setTotalCount(json.meta.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed fetching WA messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(1);
  }, [direction, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages(1);
  };

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      const res = await fetch(`/api/proxy/admin/wa/messages/${id}/resend`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback({ type: 'success', message: 'Pesan berhasil dijadwalkan ulang untuk dikirim.' });
        fetchMessages(currentPage);
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(data.data);
        }
      } else {
        throw new Error(data.message || 'Gagal mengirim ulang pesan.');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setResendingId(null);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Riwayat Pesan WhatsApp
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {totalCount} Total Log
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau seluruh log transmisi pesan WhatsApp masuk dan keluar beserta status pengiriman dan audit error.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => fetchMessages(currentPage)}
          isLoading={loading}
          className="self-start sm:self-auto text-xs"
        >
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          Segarkan Log
        </Button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor telepon atau isi pesan..."
              className="pl-9 text-xs w-full"
            />
          </div>

          <div>
            <Select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              options={[
                { value: '', label: 'Semua Arah Pesan' },
                { value: 'out', label: 'Pesan Keluar (Sistem)' },
                { value: 'in', label: 'Pesan Masuk (Penghuni)' },
              ]}
              className="text-xs w-full"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'sent', label: 'Terkirim (Sent)' },
                { value: 'queued', label: 'Antrean (Queued)' },
                { value: 'failed', label: 'Gagal (Failed)' },
                { value: 'ignored', label: 'Dilewati (Ignored)' },
              ]}
              className="text-xs w-full"
            />
            <Button type="submit" variant="primary" className="text-xs shrink-0">
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Messages Table Card */}
      <Card className="border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-teal-600" /> Memuat data pesan WhatsApp...
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada riwayat pesan</p>
            <p className="text-xs text-slate-400 mt-1">
              Belum ada pesan yang tercatat dengan kriteria pencarian ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Arah</th>
                  <th className="py-3 px-4">Nomor & Penerima</th>
                  <th className="py-3 px-4">Tipe / Template</th>
                  <th className="py-3 px-4">Cuplikan Pesan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      {msg.direction === 'out' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60">
                          <ArrowUpRight className="w-3 h-3 text-teal-600" /> Keluar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
                          <ArrowDownLeft className="w-3 h-3 text-blue-600" /> Masuk
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 font-mono flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-teal-600" /> {msg.phone_display || msg.phone}
                      </p>
                      {msg.tenant && (
                        <p className="text-[11px] text-slate-500 font-sans">
                          {msg.tenant.name} {msg.tenant.room_number ? `(Kamar ${msg.tenant.room_number})` : ''}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {msg.template_key ? (
                        <code className="text-[11px] font-mono bg-teal-50 text-teal-900 px-1.5 py-0.5 rounded border border-teal-200/80 font-bold">
                          {msg.template_key}
                        </code>
                      ) : (
                        <span className="text-[11px] text-slate-500 capitalize">{msg.type}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="truncate text-slate-700 font-sans">
                        {msg.body || <span className="italic text-slate-400">(Pesan Kosong)</span>}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      {msg.status === 'sent' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Terkirim
                        </span>
                      )}
                      {msg.status === 'queued' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Antrean
                        </span>
                      )}
                      {msg.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" /> Gagal ({msg.attempts}x)
                        </span>
                      )}
                      {msg.status === 'ignored' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          Opt-Out
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMessage(msg);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Lihat Detail Pesan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {msg.status === 'failed' && (
                          <button
                            type="button"
                            onClick={() => handleResend(msg.id)}
                            disabled={resendingId === msg.id}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Kirim Ulang Pesan"
                          >
                            <RotateCw
                              className={`w-3.5 h-3.5 ${resendingId === msg.id ? 'animate-spin' : ''}`}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari{' '}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => fetchMessages(currentPage - 1)}
                className="text-xs py-1 px-2.5 h-auto"
              >
                Sebelumnya
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => fetchMessages(currentPage + 1)}
                className="text-xs py-1 px-2.5 h-auto"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <WaMessageDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedMessage(null);
        }}
        message={selectedMessage}
        onResend={handleResend}
        isResending={resendingId === selectedMessage?.id}
      />
    </div>
  );
}
