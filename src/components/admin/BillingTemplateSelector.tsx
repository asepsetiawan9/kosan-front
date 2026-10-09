'use client';

import React from 'react';
import { BillingTemplate } from '@/lib/types';
import { FileText, Check } from 'lucide-react';

interface BillingTemplateSelectorProps {
  templates: BillingTemplate[];
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
}

export const BillingTemplateSelector: React.FC<BillingTemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Pilih Format Pesan WhatsApp
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {templates.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl.id)}
              className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all text-xs ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 ring-1 ring-emerald-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                  isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{tpl.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
                  #{tpl.key}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
