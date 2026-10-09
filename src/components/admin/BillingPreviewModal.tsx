'use client';

import React, { useState, useEffect } from 'react';
import { BillingTarget, BillingTemplate } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatRupiah, apiRequest } from '@/lib/api';
import { Copy, ExternalLink, Check, Send, Sparkles, MessageSquare } from 'lucide-react';

interface BillingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: BillingTarget | null;
  templates: BillingTemplate[];
  onBillingSent?: () => void;
}

export const BillingPreviewModal: React.FC<BillingPreviewModalProps> = ({
  isOpen,
  onClose,
  target,
  templates,
  onBillingSent,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Initialize selected template and fetch rendered link
  useEffect(() => {
    if (isOpen && target) {
      const defaultTpl =
        templates.find((t) => t.key === 'tagihan_bulanan') || templates[0];
      if (defaultTpl) {
        setSelectedTemplateId(defaultTpl.id);
        fetchRenderedMessage(defaultTpl.id);
      }
    }
  }, [isOpen, target, templates]);

  const fetchRenderedMessage = async (templateId: string) => {
    if (!target) return;
    setIsLoading(true);
    try {
      const res = await apiRequest<{
        data: {
          rendered_msg: string;
          wa_link: string;
        };
      }>('admin/billing/generate-link', {
        method: 'POST',
        body: JSON.stringify({
          tenancy_id: target.tenancy_id,
          template_id: templateId,
          invoice_id: target.invoice_id,
        }),
      });

      setMessage(res.data.rendered_msg);
    } catch (err) {
      console.error('Failed to generate template text', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tplId = e.target.value;
    setSelectedTemplateId(tplId);
    fetchRenderedMessage(tplId);
  };

  const handleCopy = async () => {
    if (!message) return;
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = async () => {
    if (!target || !message) return;
    setIsSending(true);

    try {
      // 1. Log the billing action in database
      await apiRequest('admin/billing/log', {
        method: 'POST',
        body: JSON.stringify({
          tenancy_id: target.tenancy_id,
          invoice_id: target.invoice_id,
          template_id: selectedTemplateId || null,
          rendered_msg: message,
          phone_target: target.tenant_phone,
          channel: 'wa_web',
        }),
      }).catch((e) => {
        console.warn('Logging billing action warning:', e);
      });

      // 2. Open WhatsApp Web URL
      const cleanPhone = target.tenant_phone.replace(/\D/g, '');
      const normalizedPhone = cleanPhone.startsWith('0')
        ? '62' + cleanPhone.slice(1)
        : cleanPhone.startsWith('8')
        ? '62' + cleanPhone
        : cleanPhone;

      const waUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      if (onBillingSent) {
        onBillingSent();
      }
      onClose();
    } catch (err) {
      console.error('Failed to open WhatsApp', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!target) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kirim Tagihan via WhatsApp"
      description={`Kamar ${target.room_number} • ${target.tenant_name}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Ringkasan Target */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Penerima</span>
            <span className="font-semibold text-slate-800 text-sm">
              {target.tenant_name}
            </span>
            <span className="text-slate-500 block font-mono text-[11px] mt-0.5">
              {target.tenant_phone || 'Nomor HP belum diisi'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 block font-medium">Nominal Tagihan</span>
            <span className="font-bold text-slate-900 text-sm">
              {formatRupiah(target.invoice_amount)}
            </span>
            <span className="text-slate-500 block text-[11px] mt-0.5">
              Periode {target.invoice_period || '-'}
            </span>
          </div>
        </div>

        {/* Pemilihan Template */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Pilih Template Pesan
          </label>
          <div className="relative">
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              disabled={isLoading}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.title} ({tpl.key})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Textarea Pesan */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              Isi Pesan WhatsApp (Dapat Diedit)
            </label>
            <span className="text-[11px] text-slate-400">
              {message.length} karakter
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              placeholder="Memuat draf pesan..."
              className="w-full text-xs font-sans bg-white border border-slate-200 rounded-xl p-3.5 text-slate-800 leading-relaxed focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs resize-none"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center rounded-xl text-xs text-slate-500">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-600 mr-2" />
                Merender template...
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            💡 Teks di atas akan otomatis dimuat di chat WhatsApp Web saat Anda menekan tombol di bawah.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
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

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenWhatsApp}
              disabled={!message || isSending || !target.tenant_phone}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Buka di WhatsApp
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
