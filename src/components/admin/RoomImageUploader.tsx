'use client';

import React from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface RoomImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export const RoomImageUploader: React.FC<RoomImageUploaderProps> = ({
  value = '',
  onChange,
  error,
  label = 'URL Foto Utama Kamar',
}) => {
  return (
    <div className="space-y-2">
      <Input
        label={label}
        placeholder="https://images.unsplash.com/..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />

      {value && (
        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
          <img
            src={value}
            alt="Pratinjau Foto Kamar"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors cursor-pointer"
            title="Hapus foto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white flex items-center gap-1 font-medium">
            <ImageIcon className="w-3 h-3" />
            <span>Pratinjau Foto</span>
          </div>
        </div>
      )}
    </div>
  );
};
