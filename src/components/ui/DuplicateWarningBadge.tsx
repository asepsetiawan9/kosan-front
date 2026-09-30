'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DuplicateWarningBadgeProps {
  className?: string;
  showTooltip?: boolean;
}

export const DuplicateWarningBadge: React.FC<DuplicateWarningBadgeProps> = ({
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs ${className}`}
      title="Hash berkas bukti transfer ini (SHA256) identik dengan berkas pembayaran sebelumnya. Harap periksa lebih teliti!"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
      <span>Suspect Duplikat</span>
    </span>
  );
};
