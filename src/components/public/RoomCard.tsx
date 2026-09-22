'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface RoomCardProps {
  room: Room;
  onBook?: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onBook }) => {
  const primaryImage =
    room.primary_image ||
    (room.images && room.images[0]?.image_path) ||
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
            Tersedia
          </span>
        </div>
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 bg-white/90 backdrop-blur-xs shadow-xs capitalize">
          Tipe {room.type}
        </div>
      </div>

      {/* Room Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>
              Nomor Unit: <strong className="text-slate-700">{room.room_number}</strong>
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            {room.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {room.description || 'Kamar kos nyaman dan bersih dengan fasilitas lengkap.'}
          </p>

          {/* Facility Preview Tags */}
          {room.facilities && room.facilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {room.facilities.slice(0, 3).map((f) => (
                <span
                  key={f.id}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                >
                  {f.name}
                </span>
              ))}
              {room.facilities.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">
                  +{room.facilities.length - 3} lainnya
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400">Harga Sewa</p>
            <p className="text-base font-extrabold text-teal-800">
              {formatRupiah(room.base_price)}
              <span className="text-xs font-normal text-slate-500"> / bln</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/kamar/${room.id}`}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Detail
            </Link>

            {onBook && (
              <button
                type="button"
                onClick={() => onBook(room)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white gradient-emerald-glow hover:opacity-95 shadow-xs transition-opacity cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sewa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
