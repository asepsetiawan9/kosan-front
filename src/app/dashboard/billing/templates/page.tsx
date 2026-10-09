'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BillingTemplate } from '@/lib/types';
import { apiRequest } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  FileText,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Eye,
  Check,
  Sparkles,
  Smartphone,
  Copy,
  AlertCircle,
} from 'lucide-react';

export default function BillingTemplatesPage() {
  const [templates, setTemplates] = useState<BillingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<BillingTemplate | null>(null);

  // Form states
  const [formKey, setFormKey] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formBody, setFormBody] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Preview state
  const [previewText, setPreviewText] = useState<string>('');
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholders = [
    { tag: '{{nama}}', label: 'Nama Penghuni' },
    { tag: '{{kamar}}', label: 'Nomor Kamar' },
    { tag: '{{periode}}', label: 'Periode Tagihan' },
    { tag: '{{nominal}}', label: 'Nominal Rupiah' },
    { tag: '{{jatuh_tempo}}', label: 'Tgl Jatuh Tempo' },
    { tag: '{{sisa_hari}}', label: 'Sisa Hari' },
    { tag: '{{no_rekening}}', label: 'No Rekening Bank' },
    { tag: '{{nama_kos}}', label: 'Nama Kosan' },
  ];

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ data: BillingTemplate[] }>('admin/billing/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to load billing templates', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormKey('');
    setFormTitle('');
    setFormBody('');
    setFormIsActive(true);
    setFormError(null);
    setPreviewText('');
    setIsModalOpen(true);
  };

  const openEditModal = (tpl: BillingTemplate) => {
    setEditingTemplate(tpl);
    setFormKey(tpl.key);
    setFormTitle(tpl.title);
    setFormBody(tpl.body);
    setFormIsActive(tpl.is_active);
    setFormError(null);
    updatePreview(tpl.body);
    setIsModalOpen(true);
  };

  const updatePreview = async (bodyContent: string) => {
    if (!bodyContent.trim()) {
      setPreviewText('');
      return;
    }
    setIsPreviewLoading(true);
    try {
      const res = await apiRequest<{ data: { rendered_msg: string } }>(
        'admin/billing/templates/preview',
        {
          method: 'POST',
          body: JSON.stringify({ body: bodyContent }),
        }
      );
      setPreviewText(res.data.rendered_msg);
    } catch (err) {
      console.error('Failed to preview template', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const insertPlaceholder = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = formBody;
    const nextVal = currentVal.substring(0, start) + tag + currentVal.substring(end);

    setFormBody(nextVal);
    updatePreview(nextVal);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingTemplate) {
        await apiRequest(`admin/billing/templates/${editingTemplate.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            key: formKey,
            title: formTitle,
            body: formBody,
            is_active: formIsActive,
          }),
        });
      } else {
        await apiRequest('admin/billing/templates', {
          method: 'POST',
          body: JSON.stringify({
            key: formKey,
            title: formTitle,
            body: formBody,
            is_active: formIsActive,
          }),
        });
      }

      setIsModalOpen(false);
      await loadTemplates();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan template.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) return;

    try {
      await apiRequest(`admin/billing/templates/${id}`, { method: 'DELETE' });
      await loadTemplates();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus template.');
    }
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
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Template Pesan Penagihan
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Atur template teks WhatsApp yang akan diisi otomatis dengan data sewa penghuni
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={openCreateModal}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Buat Template Baru
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse p-5">
              <div className="h-5 bg-slate-100 rounded-md w-1/2 mb-3"></div>
              <div className="h-20 bg-slate-100 rounded-md w-full"></div>
            </Card>
          ))
        ) : templates.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/90">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">Belum ada template pesan</p>
            <p className="text-xs text-slate-400 mt-1">
              Klik tombol &quot;Buat Template Baru&quot; di atas untuk menambahkan
            </p>
          </div>
        ) : (
          templates.map((tpl) => (
            <Card
              key={tpl.id}
              className="p-5 flex flex-col justify-between border border-slate-200/90 hover:border-slate-300 transition-all shadow-soft-card"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{tpl.title}</h3>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                      #{tpl.key}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(tpl)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preformatted Message Body */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs font-sans text-slate-700 whitespace-pre-wrap leading-relaxed mt-3 max-h-48 overflow-y-auto">
                  {tpl.body}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                <span>
                  Status:{' '}
                  <strong className={tpl.is_active ? 'text-emerald-600' : 'text-slate-400'}>
                    {tpl.is_active ? 'Aktif' : 'Non-Aktif'}
                  </strong>
                </span>
                <span>Diperbarui {new Date(tpl.updated_at).toLocaleDateString('id-ID')}</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Edit Template Tagihan' : 'Buat Template Tagihan Baru'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Judul Template
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pengingat Tagihan Bulanan"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Key / Kunci Template
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: tagihan_bulanan"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Placeholders Toolbar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Sisipkan Variabel Otomatis (Klik untuk menyisipkan)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
              {placeholders.map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => insertPlaceholder(item.tag)}
                  className="px-2 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-mono transition"
                >
                  <strong>{item.tag}</strong> ({item.label})
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Isi Template Pesan
            </label>
            <textarea
              ref={textareaRef}
              rows={7}
              required
              value={formBody}
              onChange={(e) => {
                setFormBody(e.target.value);
                updatePreview(e.target.value);
              }}
              placeholder="Tuliskan format pesan di sini..."
              className="w-full text-xs font-sans bg-white border border-slate-200 rounded-xl p-3 text-slate-800 leading-relaxed focus:outline-hidden focus:border-emerald-500 shadow-2xs resize-none"
            />
          </div>

          {/* Live Preview Card */}
          {previewText && (
            <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                👁️ Preview dengan Contoh Data Aktual:
              </span>
              <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-emerald-100">
                {previewText}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Template'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
