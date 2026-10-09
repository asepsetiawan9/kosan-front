'use client';

import React from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle2, ListFilter } from 'lucide-react';

interface BillingDueTimelineProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: {
    all: number;
    jatuh_tempo_hari_ini: number;
    mendekati: number;
    tunggakan: number;
    lunas: number;
  };
}

export const BillingDueTimeline: React.FC<BillingDueTimelineProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const tabs = [
    { id: 'all', label: 'Semua Target', count: counts.all, icon: ListFilter },
    { id: 'jatuh_tempo_hari_ini', label: 'Hari Ini', count: counts.jatuh_tempo_hari_ini, icon: Calendar, color: 'amber' },
    { id: 'mendekati', label: 'Mendekati (H-3)', count: counts.mendekati, icon: Clock, color: 'blue' },
    { id: 'tunggakan', label: 'Tunggakan', count: counts.tunggakan, icon: AlertCircle, color: 'rose' },
    { id: 'lunas', label: 'Lunas', count: counts.lunas, icon: CheckCircle2, color: 'emerald' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto border border-slate-200/80 text-xs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeFilter === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-150 ${
              isActive
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
