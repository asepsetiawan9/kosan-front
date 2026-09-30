'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WaTemplate } from '@/lib/types';
import { FileText, Eye, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface WaTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: WaTemplate | null;
  placeholders: Record<string, string>;
  onSaved: () => void;
}

export const WaTemplateEditorModal: React.FC<WaTemplateEditorModalProps> = ({
  isOpen,
  onClose,
  template,
  placeholders,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [previewText, setPreviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setBody(template.body);
      setIsActive(template.is_active);
      setError(null);
      setSuccess(null);
      fetchPreview(template.body);
    }
  }, [template]);

  const fetchPreview = async (textToPreview: string) => {
    if (!textToPreview) {
      setPreviewText('');
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/proxy/admin/wa/templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: textToPreview }),
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewText(data.rendered || '');
      }
    } catch {
      // Fallback client replace
      let fallback = textToPreview;
      fallback = fallback
        .replace(/\{\{\s*nama\s*\}\}/g, 'Budi Santoso')
        .replace(/\{\{\s*kamar\s*\}\}/g, '102 (Deluxe)')
        .replace(/\{\{\s*periode\s*\}\}/g, 'Oktober 2026')
        .replace(/\{\{\s*nominal\s*\}\}/g, 'Rp 1.500.000')
        .replace(/\{\{\s*jatuh_tempo\s*\}\}/g, '05/10/2026')
        .replace(/\{\{\s*sisa_hari\s*\}\}/g, '1')
        .replace(/\{\{\s*nama_kos\s*\}\}/g, 'Kos Melati Residence')
        .replace(/\{\{\s*no_rekening\s*\}\}/g, 'BCA 1234567890 a/n Haji Asep');
      setPreviewText(fallback);
    } finally {
      setPreviewLoading(false);
    }
  };

  const insertPlaceholder = (tag: string) => {
    const textarea = textareaRef.current;
    const tagFormatted = `{{${tag}}}`;

    if (!textarea) {
      const newBody = body + ' ' + tagFormatted;
      setBody(newBody);
      fetchPreview(newBody);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = body.substring(0, start) + tagFormatted + body.substring(end);
    setBody(newBody);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagFormatted.length, start + tagFormatted.length);
    }, 50);

    fetchPreview(newBody);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setBody(val);
    fetchPreview(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/proxy/admin/wa/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          is_active: isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan template.');
      }

      setSuccess('Template pesan WhatsApp berhasil diperbarui.');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  if (!template) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Template Pesan WhatsApp"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Key Badge & Status Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Kunci Template (Sistem)</p>
              <code className="text-xs font-mono font-bold text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                {template.key}
              </code>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-semibold text-slate-700">Status Aktif:</span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
              {isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </label>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama / Judul Template <span className="text-rose-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Pengingat Tagihan H-1"
            required
            className="w-full"
          />
        </div>

        {/* Placeholder Tag Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Placeholder Dinamis (Klik untuk menyisipkan)
            </label>
            <span className="text-[11px] text-slate-400">Variabel data otomatis</span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl max-h-28 overflow-y-auto">
            {Object.entries(placeholders).map(([tag, desc]) => (
              <button
                key={tag}
                type="button"
                onClick={() => insertPlaceholder(tag)}
                title={desc}
                className="group inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-mono font-medium text-slate-700 hover:text-teal-800 shadow-2xs transition-all"
              >
                <span>{`{{${tag}}}`}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-teal-600 font-sans">
                  ({desc})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Isi Pesan Template <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400">{body.length} karakter</span>
          </div>
          <textarea
            ref={textareaRef}
            rows={5}
            value={body}
            onChange={handleBodyChange}
            placeholder="Tulis format pesan WhatsApp..."
            required
            className="w-full text-sm font-sans px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-y shadow-2xs"
          />
        </div>

        {/* Live Preview Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              Pratinjau Hasil Pesan WhatsApp (Data Sampel)
            </label>
            {previewLoading && (
              <span className="text-xs text-teal-600 flex items-center gap-1 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" /> Merender...
              </span>
            )}
          </div>

          <div className="p-4 bg-[#EFEAE2] rounded-xl border border-slate-300 shadow-inner">
            <div className="max-w-md ml-auto bg-[#DCF8C6] text-slate-900 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tr-xs shadow-xs space-y-1 relative">
              <p className="whitespace-pre-wrap font-sans leading-relaxed">
                {previewText || <span className="text-slate-400 italic">Pesan kosong...</span>}
              </p>
              <div className="text-[10px] text-slate-500 text-right mt-1 font-mono">
                09:00 WIB ✓✓
              </div>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
