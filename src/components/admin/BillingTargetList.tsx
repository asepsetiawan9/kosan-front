'use client';

import React, { useState } from 'react';
import { BillingTarget } from '@/lib/types';
import { formatRupiah } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import {
  Send,
  Search,
  ExternalLink,
  Smartphone,
  CheckSquare,
  Square,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface BillingTargetListProps {
  targets: BillingTarget[];
  isLoading: boolean;
  onOpenPreview: (target: BillingTarget) => void;
  onBulkSend: (selectedTenancyIds: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const BillingTargetList: React.FC<BillingTargetListProps> = ({
  targets,
  isLoading,
  onOpenPreview,
  onBulkSend,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedIds.length === targets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(targets.map((t) => t.tenancy_id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getDueBadge = (target: BillingTarget) => {
    if (target.invoice_status === 'lunas') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Lunas
        </span>
      );
    }

    if (target.days_until_due === null) {
      return <span className="text-slate-400 text-xs">-</span>;
    }

    if (target.days_until_due === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Hari Ini
        </span>
      );
    }

    if (target.days_until_due < 0) {
      const lateDays = Math.abs(target.days_until_due);
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Lewat {lateDays} hari
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {target.days_until_due} hari lagi
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari penghuni, kamar, atau HP..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Selected count info */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-medium justify-between sm:justify-start">
            <span>
              <strong>{selectedIds.length}</strong> dipilih
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => onBulkSend(selectedIds)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 h-7 px-2.5 flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                Tagih Sekaligus
              </Button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-emerald-700 hover:underline px-1"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Target Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-soft-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={targets.length === 0}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    {selectedIds.length === targets.length && targets.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Kamar & Properti</th>
                <th className="py-3 px-3">Penyewa & Kontak</th>
                <th className="py-3 px-3">Periode</th>
                <th className="py-3 px-3">Nominal Tagihan</th>
                <th className="py-3 px-3">Jatuh Tempo</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded-md w-full"></div>
                    </td>
                  </tr>
                ))
              ) : targets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600 text-sm">
                      Tidak ada data penagihan ditemukan
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba ganti filter atau kata kunci pencarian Anda
                    </p>
                  </td>
                </tr>
              ) : (
                targets.map((target) => {
                  const isChecked = selectedIds.includes(target.tenancy_id);

                  return (
                    <tr
                      key={target.tenancy_id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isChecked ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(target.tenancy_id)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Kamar & Properti */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800 text-sm">
                          Kamar {target.room_number}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[140px]">
                          <Building className="w-3 h-3 shrink-0" />
                          {target.location}
                        </div>
                      </td>

                      {/* Penyewa & Kontak */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">
                          {target.tenant_name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {target.tenant_phone || (
                            <span className="text-amber-500">Belum ada HP</span>
                          )}
                        </div>
                      </td>

                      {/* Periode */}
                      <td className="py-3.5 px-3 text-slate-600">
                        {target.invoice_period || '-'}
                      </td>

                      {/* Nominal */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatRupiah(target.invoice_amount)}
                        </span>
                      </td>

                      {/* Jatuh Tempo & Countdown */}
                      <td className="py-3.5 px-3">
                        <div>{getDueBadge(target)}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {target.due_date || '-'}
                        </div>
                      </td>

                      {/* Status Tagihan */}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={target.invoice_status} />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenPreview(target)}
                          disabled={!target.tenant_phone}
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/90 hover:border-emerald-300 font-semibold inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Send className="w-3 h-3 text-emerald-600" />
                          Tagih WA
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
