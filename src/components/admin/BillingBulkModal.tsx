'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { BillingTemplate } from '@/lib/types';
import { ExternalLink, Check, Copy, Send, Sparkles, AlertCircle } from 'lucide-react';

interface BulkLinkItem {
  tenancy_id: string;
  tenant_name: string;
  room_number: string;
  phone: string;
  invoice_id: string | null;
  rendered_msg: string;
  wa_link: string;
}

interface BillingBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTenancyIds: string[];
  templates: BillingTemplate[];
  onFinished?: () => void;
}

export const BillingBulkModal: React.FC<BillingBulkModalProps> = ({
  isOpen,
  onClose,
  selectedTenancyIds,
  templates,
  onFinished,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [links, setLinks] = useState<BulkLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openedIds, setOpenedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedTenancyIds.length > 0) {
      const defaultTpl =
        templates.find((t) => t.key === 'tagihan_bulanan') || templates[0];
      if (defaultTpl) {
        setSelectedTemplateId(defaultTpl.id);
        fetchBulkLinks(defaultTpl.id);
      }
    }
  }, [isOpen, selectedTenancyIds, templates]);

  const fetchBulkLinks = async (templateId: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ data: BulkLinkItem[] }>('admin/billing/bulk-links', {
        method: 'POST',
        body: JSON.stringify({
          tenancy_ids: selectedTenancyIds,
          template_id: templateId,
        }),
      });
      setLinks(res.data);
    } catch (err) {
      console.error('Failed to generate bulk links', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tplId = e.target.value;
    setSelectedTemplateId(tplId);
    fetchBulkLinks(tplId);
  };

  const handleOpenLink = async (item: BulkLinkItem) => {
    // 1. Log billing in database
    await apiRequest('admin/billing/log', {
      method: 'POST',
      body: JSON.stringify({
        tenancy_id: item.tenancy_id,
        invoice_id: item.invoice_id,
        template_id: selectedTemplateId || null,
        rendered_msg: item.rendered_msg,
        phone_target: item.phone,
        channel: 'wa_web',
      }),
    }).catch((e) => console.warn('Logging bulk billing action warning:', e));

    // 2. Open WhatsApp Web tab
    window.open(item.wa_link, '_blank', 'noopener,noreferrer');

    // 3. Mark as opened
    if (!openedIds.includes(item.tenancy_id)) {
      setOpenedIds((prev) => [...prev, item.tenancy_id]);
    }

    if (onFinished) {
      onFinished();
    }
  };

  const handleCopy = async (item: BulkLinkItem) => {
    await navigator.clipboard.writeText(item.rendered_msg);
    setCopiedId(item.tenancy_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Penagihan Massal via WhatsApp"
      description={`${selectedTenancyIds.length} penerima tagihan dipilih`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Template Selector */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <label className="font-semibold text-slate-700 whitespace-nowrap">
            Template Pesan:
          </label>
          <select
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            disabled={isLoading}
            className="w-full sm:w-auto flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500"
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.title} ({tpl.key})
              </option>
            ))}
          </select>
        </div>

        {/* Progress Info */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-500">
            Kemajuan:{' '}
            <strong className="text-slate-800">
              {openedIds.length} dari {links.length}
            </strong>{' '}
            telah dibuka
          </span>
          <span className="text-slate-400 text-[11px]">
            💡 Buka pesan satu per satu agar WhatsApp tidak membatasi akun Anda
          </span>
        </div>

        {/* Target Cards List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <Sparkles className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
              Menyiapkan link WhatsApp...
            </div>
          ) : links.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <AlertCircle className="w-5 h-5 mx-auto mb-1 text-slate-300" />
              Tidak ada link yang dapat dibuat
            </div>
          ) : (
            links.map((item) => {
              const isOpened = openedIds.includes(item.tenancy_id);
              const isCopied = copiedId === item.tenancy_id;

              return (
                <div
                  key={item.tenancy_id}
                  className={`p-3 rounded-xl border transition-all text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isOpened
                      ? 'bg-emerald-50/30 border-emerald-200 text-slate-700'
                      : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        Kamar {item.room_number}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-800 truncate">
                        {item.tenant_name}
                      </span>
                      {isOpened && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                          <Check className="w-2.5 h-2.5" /> Dibuka
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {item.phone}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      {item.rendered_msg}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(item)}
                      className="text-xs h-7 px-2 text-slate-600 hover:text-slate-900"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant={isOpened ? 'outline' : 'primary'}
                      onClick={() => handleOpenLink(item)}
                      className={`text-xs h-7 px-2.5 flex items-center gap-1 ${
                        isOpened
                          ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      {isOpened ? 'Buka Lagi' : 'Buka WA'}
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Action */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
            Selesai
          </Button>
        </div>
      </div>
    </Modal>
  );
};
