'use client';

import React from 'react';
import { CreditCard, Building2, ShieldCheck, Zap } from 'lucide-react';

interface PaymentMethodSelectorProps {
  activeTab: 'gateway' | 'manual';
  onTabChange: (tab: 'gateway' | 'manual') => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Option 1: Gateway Otomatis */}
      <button
        type="button"
        onClick={() => onTabChange('gateway')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
          activeTab === 'gateway'
            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500/20'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            activeTab === 'gateway'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Zap className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm">Pembayaran Otomatis</h4>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Instan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            QRIS (Semua E-Wallet/BCA/Mandiri), Virtual Account Bank, dan GoPay.
          </p>
        </div>
      </button>

      {/* Option 2: Transfer Bank Manual */}
      <button
        type="button"
        onClick={() => onTabChange('manual')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
          activeTab === 'manual'
            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500/20'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            activeTab === 'manual'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm">Transfer Bank Manual</h4>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Verifikasi Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Transfer via rekening BCA/Mandiri pemilik & unggah bukti transfer.
          </p>
        </div>
      </button>
    </div>
  );
};
