'use client';

import React from 'react';
import { Search, RotateCcw, Check } from 'lucide-react';
import { Facility } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface RoomFilterBarProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  facilities: Facility[];
  selectedFacilities: string[];
  onToggleFacility: (facilityId: string) => void;
  onResetFilters: () => void;
}

export const RoomFilterBar: React.FC<RoomFilterBarProps> = ({
  selectedType,
  onSelectType,
  searchQuery,
  onSearchChange,
  maxPrice,
  onMaxPriceChange,
  facilities,
  selectedFacilities,
  onToggleFacility,
  onResetFilters,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 mb-8 shadow-xs space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor atau nama kamar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Room Type */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => onSelectType(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
          >
            <option value="all">Semua Tipe Kamar</option>
            <option value="standar">Standar</option>
            <option value="deluxe">Deluxe</option>
            <option value="vip">VIP</option>
            <option value="paviliun">Paviliun</option>
          </select>
        </div>

        {/* Price Range Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Maks. Budget:</span>
            <span className="font-bold text-teal-800">{formatRupiah(maxPrice)}</span>
          </div>
          <input
            type="range"
            min={1000000}
            max={5000000}
            step={100000}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            className="w-full accent-teal-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Reset Filter Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Facility Chips */}
      {facilities.length > 0 && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">Fasilitas:</span>
          {facilities.map((fac) => {
            const isSelected = selectedFacilities.includes(fac.id);
            return (
              <button
                key={fac.id}
                type="button"
                onClick={() => onToggleFacility(fac.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {fac.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
