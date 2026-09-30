'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { WaReminderRule, WaTemplate, WaTriggerType } from '@/lib/types';
import { Clock, BellRing, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WaReminderRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: WaReminderRule | null;
  templates: WaTemplate[];
  onSaved: () => void;
}

export const WaReminderRuleModal: React.FC<WaReminderRuleModalProps> = ({
  isOpen,
  onClose,
  rule,
  templates,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<WaTriggerType>('before_due');
  const [offsetDays, setOffsetDays] = useState(1);
  const [sendTime, setSendTime] = useState('09:00');
  const [templateKey, setTemplateKey] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEdit = !!rule;

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setTriggerType(rule.trigger_type);
      setOffsetDays(rule.offset_days);
      setSendTime(rule.send_time ? rule.send_time.substring(0, 5) : '09:00');
      setTemplateKey(rule.template_key);
      setIsActive(rule.is_active);
    } else {
      setName('');
      setTriggerType('before_due');
      setOffsetDays(1);
      setSendTime('09:00');
      setTemplateKey(templates.length > 0 ? templates[0].key : '');
      setIsActive(true);
    }
    setError(null);
    setSuccess(null);
  }, [rule, templates, isOpen]);

  // Adjust default offset based on trigger type change
  const handleTriggerTypeChange = (newType: WaTriggerType) => {
    setTriggerType(newType);
    if (newType === 'on_due') {
      setOffsetDays(0);
    } else if (offsetDays === 0) {
      setOffsetDays(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      name,
      trigger_type: triggerType,
      offset_days: Number(offsetDays),
      send_time: sendTime.length === 5 ? `${sendTime}:00` : sendTime,
      template_key: templateKey,
      is_active: isActive,
    };

    try {
      const url = isEdit
        ? `/api/proxy/admin/wa/reminder-rules/${rule.id}`
        : '/api/proxy/admin/wa/reminder-rules';

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan aturan pengingat.');
      }

      setSuccess(
        isEdit
          ? 'Aturan pengingat berhasil diperbarui.'
          : 'Aturan pengingat baru berhasil ditambahkan.'
      );

      setTimeout(() => {
        onSaved();
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Aturan Pengingat WhatsApp' : 'Tambah Aturan Pengingat WhatsApp'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Aturan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama Aturan <span className="text-rose-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Pengingat H-1 Jatuh Tempo"
            required
            className="w-full"
          />
        </div>

        {/* Trigger Type & Offset Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Waktu Pemicu <span className="text-rose-500">*</span>
            </label>
            <Select
              value={triggerType}
              onChange={(e) => handleTriggerTypeChange(e.target.value as WaTriggerType)}
              options={[
                { value: 'before_due', label: 'Sebelum Jatuh Tempo (H-N)' },
                { value: 'on_due', label: 'Hari Jatuh Tempo (H-0)' },
                { value: 'after_due', label: 'Setelah Jatuh Tempo (H+N)' },
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Offset (Jumlah Hari) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min={0}
              max={365}
              value={offsetDays}
              onChange={(e) => setOffsetDays(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={triggerType === 'on_due'}
              required
              className="w-full"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {triggerType === 'before_due' && `${offsetDays} hari SEBELUM tanggal jatuh tempo`}
              {triggerType === 'on_due' && 'Tepat pada hari H tanggal jatuh tempo'}
              {triggerType === 'after_due' && `${offsetDays} hari SETELAH jatuh tempo (keterlambatan)`}
            </p>
          </div>
        </div>

        {/* Send Time & Template */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Jam Kirim Harian (WIB) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="time"
              value={sendTime}
              onChange={(e) => setSendTime(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Template Pesan <span className="text-rose-500">*</span>
            </label>
            <Select
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
              options={templates.map((tpl) => ({
                value: tpl.key,
                label: `${tpl.title} (${tpl.key})`,
              }))}
              className="w-full"
            />
          </div>
        </div>

        {/* Status Switch */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-teal-600" />
            <div>
              <p className="text-xs font-bold text-slate-800">Status Aturan Pengingat</p>
              <p className="text-[11px] text-slate-500">
                Aturan yang aktif akan otomatis diproses oleh background scheduler
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </label>
        </div>

        {/* Error / Success Feedback */}
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
            {isEdit ? 'Simpan Perubahan' : 'Buat Aturan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
