'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WaReminderRule, WaReminderLog, WaTemplate, WaReminderDryRunResult } from '@/lib/types';
import { WaReminderRuleModal } from '@/components/admin/WaReminderRuleModal';
import { WaReminderDryRunModal } from '@/components/admin/WaReminderDryRunModal';
import {
  BellRing,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  RotateCw,
  Trash2,
  Edit2,
  History,
  Send,
  Zap,
} from 'lucide-react';

export default function WaRemindersPage() {
  const [rules, setRules] = useState<WaReminderRule[]>([]);
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [logs, setLogs] = useState<WaReminderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  // Modals state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<WaReminderRule | null>(null);

  const [isDryRunModalOpen, setIsDryRunModalOpen] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<WaReminderDryRunResult | null>(null);
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [isExecutingRun, setIsExecutingRun] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, tplRes] = await Promise.all([
        fetch('/api/proxy/admin/wa/reminder-rules'),
        fetch('/api/proxy/admin/wa/templates'),
      ]);

      const rulesJson = await rulesRes.json();
      const tplJson = await tplRes.json();

      if (rulesRes.ok) setRules(rulesJson.data || []);
      if (tplRes.ok) setTemplates(tplJson.data || []);
    } catch (err) {
      console.error('Failed fetching reminder rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/proxy/admin/wa/reminder-logs?per_page=10');
      const json = await res.json();
      if (res.ok) {
        setLogs(json.data || []);
      }
    } catch (err) {
      console.error('Failed fetching reminder logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLogs();
  }, []);

  const handleToggleRule = async (id: string) => {
    try {
      const res = await fetch(`/api/proxy/admin/wa/reminder-rules/${id}/toggle`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        fetchData();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal mengubah status aturan.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteRule = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus aturan "${name}"?`)) return;

    try {
      const res = await fetch(`/api/proxy/admin/wa/reminder-rules/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message });
        fetchData();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menghapus aturan.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleStartDryRun = async (customDate?: string) => {
    setDryRunLoading(true);
    try {
      const url = customDate
        ? `/api/proxy/admin/wa/reminders/dry-run?date=${customDate}`
        : '/api/proxy/admin/wa/reminders/dry-run';

      const res = await fetch(url, { method: 'POST' });
      const json = await res.json();

      if (res.ok) {
        setDryRunResult(json.data);
        setIsDryRunModalOpen(true);
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menjalankan simulasi.' });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setDryRunLoading(false);
    }
  };

  const handleExecuteImmediate = async () => {
    setIsExecutingRun(true);
    try {
      const res = await fetch('/api/proxy/admin/wa/reminders/run', {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: json.message });
        setIsDryRunModalOpen(false);
        fetchLogs();
      } else {
        throw new Error(json.message);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal mengeksekusi pengingat.' });
    } finally {
      setIsExecutingRun(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const getTriggerLabel = (type: string, offset: number) => {
    if (type === 'before_due') {
      return (
        <span className="inline-flex items-center gap-1 text-teal-800 font-semibold">
          <Clock className="w-3 h-3 text-teal-600" /> H-{offset} (Sebelum Jatuh Tempo)
        </span>
      );
    }
    if (type === 'on_due') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hari H Jatuh Tempo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-amber-800 font-semibold">
        <AlertCircle className="w-3 h-3 text-amber-600" /> H+{offset} (Keterlambatan)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Aturan Pengingat WhatsApp
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {rules.filter((r) => r.is_active).length} Aktif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi jadwal pengingat bertingkat otomatis via WhatsApp (H-1, Hari H, H+5, H+10, H+15) dengan idempotensi anti-duplikat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleStartDryRun()}
            isLoading={dryRunLoading}
            className="text-xs border-teal-200 text-teal-800 hover:bg-teal-50"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
            Simulasi Hari Ini (Dry Run)
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setSelectedRule(null);
              setIsRuleModalOpen(true);
            }}
            className="text-xs gradient-emerald-glow text-white shadow-emerald-glow"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Tambah Aturan
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
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
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Aturan
            </span>
            <BellRing className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{rules.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Konfigurasi tersimpan</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Aturan Aktif
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">
            {rules.filter((r) => r.is_active).length}
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Diproses otomatis</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Frekuensi Cron
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-1">Tiap 15 Menit</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Scheduler tanpa tumpang tindih</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Log Terakhir
            </span>
            <History className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{logs.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pengingat tercatat</p>
        </Card>
      </div>

      {/* Rules Table Card */}
      <Card className="border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-700" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Aturan Pengingat Jatuh Tempo
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">{rules.length} Aturan</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-teal-600" /> Memuat daftar aturan...
          </div>
        ) : rules.length === 0 ? (
          <div className="p-10 text-center">
            <BellRing className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Belum ada aturan pengingat</p>
            <p className="text-xs text-slate-400 mt-1">
              Tambahkan aturan pengingat baru agar sistem dapat mengirim notifikasi otomatis.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nama Aturan</th>
                  <th className="py-3 px-4">Pemicu & Offset</th>
                  <th className="py-3 px-4">Jam Kirim</th>
                  <th className="py-3 px-4">Template Terhubung</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-sm">{rule.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {rule.logs_count || 0} kali terkirim
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {getTriggerLabel(rule.trigger_type, rule.offset_days)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {rule.send_time} WIB
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-[11px] font-mono bg-teal-50 text-teal-900 px-1.5 py-0.5 rounded border border-teal-200/80">
                        {rule.template_key}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          rule.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rule.is_active ? 'bg-emerald-600' : 'bg-slate-500'
                          }`}
                        />
                        {rule.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRule(rule);
                            setIsRuleModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit Aturan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id, rule.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Aturan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Activity Logs Table */}
      <Card className="border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-700" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Log Pengingat WhatsApp Otomatis Terbaru
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={fetchLogs}
            isLoading={logsLoading}
            className="text-[11px] py-1 px-2.5 h-auto"
          >
            <RotateCw className="w-3 h-3 mr-1" /> Segarkan
          </Button>
        </div>

        {logsLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Memuat log pengingat...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada riwayat pengingat tagihan otomatis yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Tanggal Eksekusi</th>
                  <th className="py-2.5 px-4">No. Tagihan</th>
                  <th className="py-2.5 px-4">Penghuni & Kamar</th>
                  <th className="py-2.5 px-4">Aturan Terpicu</th>
                  <th className="py-2.5 px-4">Status Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-700">{log.sent_for_date}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {log.invoice_number || '-'}
                    </td>
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-slate-800">{log.tenant_name || '-'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {log.tenant_phone} {log.room_number ? `(Kamar ${log.room_number})` : ''}
                      </p>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-slate-800">{log.rule_name || '-'}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {log.template_key}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {log.wa_message_status === 'sent' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Terkirim
                        </span>
                      )}
                      {log.wa_message_status === 'queued' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Antrean
                        </span>
                      )}
                      {log.wa_message_status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertCircle className="w-3 h-3" /> Gagal
                        </span>
                      )}
                      {!log.wa_message_status && (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Rule Form Modal */}
      <WaReminderRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => {
          setIsRuleModalOpen(false);
          setSelectedRule(null);
        }}
        rule={selectedRule}
        templates={templates}
        onSaved={fetchData}
      />

      {/* Dry Run Simulation Modal */}
      <WaReminderDryRunModal
        isOpen={isDryRunModalOpen}
        onClose={() => {
          setIsDryRunModalOpen(false);
          setDryRunResult(null);
        }}
        result={dryRunResult}
        onRunImmediate={handleExecuteImmediate}
        isExecuting={isExecutingRun}
        onRefreshSimulation={handleStartDryRun}
      />
    </div>
  );
}
