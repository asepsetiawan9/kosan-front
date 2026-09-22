import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeType =
  | 'kosong'
  | 'dipesan'
  | 'terisi'
  | 'maintenance'
  | 'lunas'
  | 'belum_bayar'
  | 'sebagian_dibayar'
  | 'menunggu_verifikasi'
  | 'terlambat'
  | 'dibatalkan'
  | 'aktif'
  | 'selesai';

interface StatusBadgeProps {
  status: BadgeType | string;
  label?: string;
  className?: string;
}

const statusConfigs: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  // Status Kamar (Sesuai Section 5.3)
  kosong: {
    label: 'Kosong',
    bg: 'bg-emerald-50 border-emerald-200/80',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  dipesan: {
    label: 'Dipesan',
    bg: 'bg-amber-50 border-amber-200/80',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  terisi: {
    label: 'Terisi',
    bg: 'bg-sky-50 border-sky-200/80',
    text: 'text-sky-800',
    dot: 'bg-sky-500',
  },
  maintenance: {
    label: 'Perbaikan',
    bg: 'bg-rose-50 border-rose-200/80',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
  },

  // Status Invoices & Tenancies
  lunas: {
    label: 'Lunas',
    bg: 'bg-emerald-50 border-emerald-200/80',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  belum_bayar: {
    label: 'Belum Bayar',
    bg: 'bg-amber-50 border-amber-200/80',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  sebagian_dibayar: {
    label: 'Sebagian Dibayar',
    bg: 'bg-orange-50 border-orange-200/80',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
  },
  menunggu_verifikasi: {
    label: 'Verifikasi',
    bg: 'bg-indigo-50 border-indigo-200/80',
    text: 'text-indigo-800',
    dot: 'bg-indigo-500',
  },
  terlambat: {
    label: 'Terlambat',
    bg: 'bg-rose-50 border-rose-200/80',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
  },
  dibatalkan: {
    label: 'Dibatalkan',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  },
  aktif: {
    label: 'Sewa Aktif',
    bg: 'bg-teal-50 border-teal-200/80',
    text: 'text-teal-800',
    dot: 'bg-teal-500',
  },
  selesai: {
    label: 'Selesai',
    bg: 'bg-emerald-50 border-emerald-200/80',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },

  // Status Aduan & Booking
  baru: {
    label: 'Baru Masuk',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  },
  diproses: {
    label: 'Sedang Diproses',
    bg: 'bg-amber-50 border-amber-200/80',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  menunggu: {
    label: 'Menunggu',
    bg: 'bg-amber-50 border-amber-200/80',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  disetujui: {
    label: 'Disetujui',
    bg: 'bg-emerald-50 border-emerald-200/80',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  ditolak: {
    label: 'Ditolak',
    bg: 'bg-rose-50 border-rose-200/80',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
}) => {
  const config = statusConfigs[status.toLowerCase()] || {
    label: status,
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };

  const displayLabel = label || config.label;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
          config.bg,
          config.text,
          className
        )
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
      {displayLabel}
    </span>
  );
};
