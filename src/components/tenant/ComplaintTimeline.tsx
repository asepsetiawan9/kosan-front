'use client';

import React from 'react';
import { Clock, Wrench, CheckCircle2, MessageSquare } from 'lucide-react';
import { ComplaintStatus } from '@/lib/types';

interface ComplaintTimelineProps {
  status: ComplaintStatus;
  createdAt?: string;
  resolvedAt?: string | null;
  adminResponse?: string | null;
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({
  status,
  createdAt,
  resolvedAt,
  adminResponse,
}) => {
  const steps = [
    {
      id: 'baru',
      label: 'Tiket Masuk',
      desc: createdAt
        ? new Date(createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Diterima sistem',
      icon: Clock,
      isDone: true,
      isActive: status === 'baru',
    },
    {
      id: 'diproses',
      label: 'Sedang Ditangani',
      desc: status === 'baru' ? 'Menunggu tindak lanjut pengelola' : 'Dalam penanganan tim teknisi/kebersihan',
      icon: Wrench,
      isDone: status === 'diproses' || status === 'selesai',
      isActive: status === 'diproses',
    },
    {
      id: 'selesai',
      label: 'Selesai Ditindaklanjuti',
      desc:
        resolvedAt
          ? new Date(resolvedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : status === 'selesai'
          ? 'Masalah teratasi'
          : 'Belum selesai',
      icon: CheckCircle2,
      isDone: status === 'selesai',
      isActive: status === 'selesai',
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between relative">
        {/* Connection Bar */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.isDone
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-bold mt-1.5 ${
                  step.isDone ? 'text-indigo-950' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 max-w-[100px] truncate mt-0.5">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {adminResponse && (
        <div className="mt-3 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-indigo-900 block">Tanggapan Pengelola:</span>
            <p className="text-slate-700 mt-0.5 leading-relaxed">{adminResponse}</p>
          </div>
        </div>
      )}
    </div>
  );
};
