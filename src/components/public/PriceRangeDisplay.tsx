'use client';

import React from 'react';

interface PriceRangeDisplayProps {
  minPrice?: number | null;
  maxPrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceRangeDisplay({
  minPrice,
  maxPrice,
  size = 'md',
  className = '',
}: PriceRangeDisplayProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base sm:text-lg font-bold',
  };

  if (!minPrice && !maxPrice) {
    return (
      <div className={`inline-flex items-center text-slate-500 font-medium ${sizeClasses[size]} ${className}`}>
        Hubungi Pengelola
      </div>
    );
  }

  if (minPrice && (!maxPrice || minPrice === maxPrice)) {
    return (
      <div className={`inline-flex items-baseline gap-1 ${className}`}>
        <span className="text-xs font-normal text-slate-500">Mulai</span>
        <span className={`text-teal-700 font-bold ${sizeClasses[size]}`}>
          {formatRupiah(minPrice)}
        </span>
        <span className="text-xs font-normal text-slate-400">/bln</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-baseline gap-1 flex-wrap ${className}`}>
      <span className={`text-teal-700 font-bold ${sizeClasses[size]}`}>
        {formatRupiah(minPrice!)}
      </span>
      <span className="text-xs font-medium text-slate-400">—</span>
      <span className={`text-teal-700 font-bold ${sizeClasses[size]}`}>
        {formatRupiah(maxPrice!)}
      </span>
      <span className="text-xs font-normal text-slate-400">/bln</span>
    </div>
  );
}
