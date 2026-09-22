'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { Facility } from '@/lib/types';

interface FacilityPickerProps {
  facilities: Facility[];
  selectedFacilityIds: string[];
  onToggleFacility: (id: string) => void;
  label?: string;
}

export const FacilityPicker: React.FC<FacilityPickerProps> = ({
  facilities,
  selectedFacilityIds,
  onToggleFacility,
  label = 'Pilih Fasilitas Kamar (Multi-Select)',
}) => {
  return (
    <div>
      {label && (
        <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
        {facilities.length === 0 ? (
          <span className="text-xs text-slate-400 italic">Belum ada data fasilitas</span>
        ) : (
          facilities.map((fac) => {
            const isSelected = selectedFacilityIds.includes(fac.id);
            return (
              <button
                key={fac.id}
                type="button"
                onClick={() => onToggleFacility(fac.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {fac.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
