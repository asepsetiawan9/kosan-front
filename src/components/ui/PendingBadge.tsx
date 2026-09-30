'use client';

import React from 'react';
import { clsx } from 'clsx';

interface PendingBadgeProps {
  count: number;
  className?: string;
  showZero?: boolean;
  pulse?: boolean;
}

export const PendingBadge: React.FC<PendingBadgeProps> = ({
  count,
  className = '',
  showZero = false,
  pulse = true,
}) => {
  if (count <= 0 && !showZero) {
    return null;
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none rounded-full',
        count > 0
          ? 'bg-amber-100 text-amber-800 border border-amber-200'
          : 'bg-slate-100 text-slate-500 border border-slate-200',
        pulse && count > 0 && 'animate-pulse',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};
