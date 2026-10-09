'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatRupiah } from '@/lib/api';
import { BillingTarget } from '@/lib/types';
import {
  Smartphone,
  ArrowUpRight,
  Clock,
  AlertCircle,
  CalendarClock,
  Send,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface QuickBillingCardProps {
  urgentTargets: BillingTarget[];
  isLoading?: boolean;
  onSelectTarget: (target: BillingTarget) => void;
  summary: {
    jatuh_tempo_hari_ini: number;
    tunggakan: number;
  };
}

export const QuickBillingCard: React.FC<QuickBillingCardProps> = ({
  urgentTargets,
  isLoading,
  onSelectTarget,
  summary,
}) => {
  const renderDueBadge = (days: number | null) => {
    if (days === null) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          <Clock className="w-3 h-3" /> Belum ada info
        </span>
      );
    }

    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md animate-pulse">
          <AlertCircle className="w-3 h-3 text-rose-600" /> Lewat {Math.abs(days)} hari
        </span>
      );
    }

    if (days === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
          <CalendarClock className="w-3 h-3 text-amber-600" /> Jatuh tempo hari ini
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
        <Clock className="w-3 h-3 text-blue-600" /> {days} hari lagi
      </span>
    );
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
              <Zap className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Aksi Cepat Penagihan</h3>
          </div>
          <Link href="/dashboard/billing">
            <Button size="sm" variant="ghost" className="text-teal-700 gap-1 text-xs font-semibold hover:bg-teal-50">
              Buka Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Penyewa paling mendesak yang membutuhkan pengingat tagihan sewa
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100/70 animate-pulse" />
            ))}
          </div>
        ) : urgentTargets.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Tidak ada penagihan mendesak</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh penyewa telah melunasi sewa atau belum mendekati tanggal tempo
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {urgentTargets.map((target) => (
              <div
                key={target.tenancy_id}
                className="p-3 md:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 hover:border-teal-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {target.room_number}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {target.tenant_name}
                      </h4>
                      {renderDueBadge(target.days_until_due)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{target.tenant_phone}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        {formatRupiah(target.invoice_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <Button
                    size="sm"
                    onClick={() => onSelectTarget(target)}
                    className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white shadow-2xs gap-1.5 text-xs font-semibold py-1.5 px-3"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Tagih WA
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
        {summary.jatuh_tempo_hari_ini > 0 && (
          <Link href="/dashboard/billing?status=jatuh_tempo_hari_ini">
            <Button size="sm" variant="outline" className="text-xs bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100">
              <CalendarClock className="w-3.5 h-3.5 text-amber-700 mr-1" />
              Jatuh Tempo ({summary.jatuh_tempo_hari_ini})
            </Button>
          </Link>
        )}

        {summary.tunggakan > 0 && (
          <Link href="/dashboard/billing?status=tunggakan">
            <Button size="sm" variant="outline" className="text-xs bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100">
              <AlertCircle className="w-3.5 h-3.5 text-rose-700 mr-1" />
              Tunggakan ({summary.tunggakan})
            </Button>
          </Link>
        )}

        <Link href="/dashboard/billing" className="ml-auto">
          <Button size="sm" variant="ghost" className="text-xs text-slate-600 hover:text-slate-900">
            Pusat Penagihan Lengkap
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
