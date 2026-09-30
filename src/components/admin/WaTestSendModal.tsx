'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  FileText, 
  Edit3,
  Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import { WaTemplate } from '@/lib/types';
import { WaNumberInput } from '@/lib/../components/ui/WaNumberInput';

interface WaTestSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: WaTemplate[];
  placeholders?: Record<string, string>;
  onSendSuccess?: () => void;
}

export const WaTestSendModal: React.FC<WaTestSendModalProps> = ({
  isOpen,
  onClose,
  templates,
  placeholders = {},
  onSendSuccess,
}) => {
  const [phone, setPhone] = useState('');
  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('');
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({
    nama: 'Budi Santoso',
    kamar: 'VIP-01',
    periode: 'Oktober 2026',
    nominal: 'Rp 1.500.000',
    jatuh_tempo: '10 Oktober 2026',
    sisa_hari: '3',
    nama_kos: 'Kosan Harmoni Residence',
    no_rekening: 'BCA 1234567890 a/n Kosan Harmoni',
  });
  const [customMessage, setCustomMessage] = useState(
    'Halo! Ini adalah pesan uji coba integrasi WhatsApp resmi dari sistem manajemen kosan.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Set default template
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateKey) {
      setSelectedTemplateKey(templates[0].key);
    }
  }, [templates, selectedTemplateKey]);

  if (!isOpen) return null;

  // Selected template object
  const activeTemplate = templates.find((t) => t.key === selectedTemplateKey);

  // Calculate live rendered preview
  const getRenderedPreview = (): string => {
    if (mode === 'custom') {
      return customMessage;
    }
    if (!activeTemplate) return '';

    let text = activeTemplate.body;
    for (const [key, val] of Object.entries(templateParams)) {
      text = text.replaceAll(`{{${key}}}`, val || `[${key}]`);
      text = text.replaceAll(`{{ ${key} }}`, val || `[${key}]`);
    }
    return text;
  };

  const previewText = getRenderedPreview();

  const handleParamChange = (key: string, val: string) => {
    setTemplateParams((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Nomor tujuan WhatsApp wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        phone,
        ...(mode === 'template'
          ? {
              template_key: selectedTemplateKey,
              template_params: templateParams,
            }
          : {
              message: customMessage,
            }),
      };

      const res = await fetch('/api/proxy/admin/wa/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengirim pesan uji WhatsApp.');
      }

      setSuccessMsg(
        'Pesan uji berhasil dimasukkan ke antrean transmisi WhatsApp! Status tercatat di log.'
      );
      if (onSendSuccess) {
        onSendSuccess();
      }

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kirim Pesan Uji WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Uji coba transmisi pesan ke nomor tujuan melalui gateway aktif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Destination Phone Input */}
          <WaNumberInput
            value={phone}
            onChange={(norm) => setPhone(norm)}
            label="Nomor WhatsApp Penerima"
            placeholder="Contoh: 081234567890"
            required
          />

          {/* Mode Switcher Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Jenis Pesan Uji
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('template')}
                className={clsx(
                  'flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all',
                  mode === 'template'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                Template Sistem ({templates.length})
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={clsx(
                  'flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all',
                  mode === 'custom'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Teks Kustom Bebas
              </button>
            </div>
          </div>

          {/* Template Selection */}
          {mode === 'template' ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Pilih Template Notifikasi
                </label>
                <select
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {templates.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.title} ({t.key})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Parameter Inputs */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Parameter Variabel Pesan
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Nama Penghuni ({'{{nama}}'})
                    </label>
                    <input
                      type="text"
                      value={templateParams.nama || ''}
                      onChange={(e) => handleParamChange('nama', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Kamar ({'{{kamar}}'})
                    </label>
                    <input
                      type="text"
                      value={templateParams.kamar || ''}
                      onChange={(e) => handleParamChange('kamar', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Periode ({'{{periode}}'})
                    </label>
                    <input
                      type="text"
                      value={templateParams.periode || ''}
                      onChange={(e) => handleParamChange('periode', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      Nominal ({'{{nominal}}'})
                    </label>
                    <input
                      type="text"
                      value={templateParams.nominal || ''}
                      onChange={(e) => handleParamChange('nominal', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Isi Pesan Kustom
              </label>
              <textarea
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Tuliskan pesan WhatsApp..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          )}

          {/* WhatsApp Chat Bubble Live Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Pratinjau Tampilan Pesan WhatsApp
            </label>
            <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-[#D1D7DB] relative overflow-hidden">
              <div className="max-w-[85%] bg-[#D9FDD3] text-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm text-xs leading-relaxed whitespace-pre-wrap font-sans border border-[#c4eec0]">
                {previewText || <span className="italic text-slate-400">Pesan kosong</span>}
                <div className="text-[10px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1 font-sans">
                  <span>14:30</span>
                  <span className="text-emerald-600 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !phone}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim Pesan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Pesan Uji
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
