'use client';

import React from 'react';
import { AlertCircle, CalendarClock, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface BillingStatCardsProps {
  summary: {
    jatuh_tempo_hari_ini: number;
    mendekati: number;
    tunggakan: number;
    lunas_bulan_ini: number;
    total_target: number;
  };
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const BillingStatCards: React.FC<BillingStatCardsProps> = ({
  summary,
  activeFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: 'jatuh_tempo_hari_ini',
      label: 'Jatuh Tempo Hari Ini',
      value: summary.jatuh_tempo_hari_ini,
      subtext: 'Batas bayar per hari ini',
      icon: CalendarClock,
      bgActive: 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20',
      iconBg: 'bg-amber-100 text-amber-700',
      textColor: 'text-amber-900',
    },
    {
      id: 'mendekati',
      label: 'Mendekati Tempo (H-3)',
      value: summary.mendekati,
      subtext: 'Jatuh tempo 1 - 3 hari lagi',
      icon: Clock,
      bgActive: 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20',
      iconBg: 'bg-blue-100 text-blue-700',
      textColor: 'text-blue-900',
    },
    {
      id: 'tunggakan',
      label: 'Tunggakan Tagihan',
      value: summary.tunggakan,
      subtext: 'Melewati tanggal jatuh tempo',
      icon: AlertCircle,
      bgActive: 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20',
      iconBg: 'bg-rose-100 text-rose-700',
      textColor: 'text-rose-900',
    },
    {
      id: 'lunas',
      label: 'Lunas Bulan Ini',
      value: summary.lunas_bulan_ini,
      subtext: 'Pembayaran terkonfirmasi',
      icon: CheckCircle2,
      bgActive: 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20',
      iconBg: 'bg-emerald-100 text-emerald-700',
      textColor: 'text-emerald-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(isSelected ? 'all' : card.id)}
            className="text-left w-full focus:outline-hidden transition"
          >
            <Card
              hoverEffect
              className={`p-4.5 cursor-pointer transition-all border ${
                isSelected
                  ? card.bgActive
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-2xl font-bold tracking-tight ${card.textColor}`}>
                  {card.value}
                </span>
                <span className="text-xs text-slate-400">penghuni</span>
              </div>

              <p className="mt-1 text-xs text-slate-500 line-clamp-1">{card.subtext}</p>
            </Card>
          </button>
        );
      })}
    </div>
  );
};
