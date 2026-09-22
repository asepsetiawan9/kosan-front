'use client';

import React from 'react';
import { DoorClosed, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface RoomTableProps {
  rooms: Room[];
  isLoading: boolean;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
}

export const RoomTable: React.FC<RoomTableProps> = ({
  rooms,
  isLoading,
  onEditRoom,
  onDeleteRoom,
}) => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 md:px-6">Kamar & Foto</th>
              <th className="py-3.5 px-4">Tipe</th>
              <th className="py-3.5 px-4">Harga / Bulan</th>
              <th className="py-3.5 px-4">Fasilitas Utama</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 md:px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Memuat data kamar...
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <DoorClosed className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Tidak ada data kamar yang sesuai kriteria filter.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Kamar & Foto */}
                  <td className="py-3.5 px-4 md:px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                        {room.primary_image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={room.primary_image}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <DoorClosed className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>Unit {room.room_number}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{room.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Tipe */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700 capitalize text-xs">
                      {room.type}
                    </span>
                  </td>

                  {/* Harga */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-teal-800 text-sm">
                      {formatRupiah(room.base_price)}
                    </span>
                  </td>

                  {/* Fasilitas */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {room.facilities && room.facilities.length > 0 ? (
                        room.facilities.slice(0, 3).map((f) => (
                          <span
                            key={f.id}
                            className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            {f.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tanpa fasilitas</span>
                      )}
                      {room.facilities && room.facilities.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-semibold px-1 py-0.5">
                          +{room.facilities.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={room.status} />
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 px-4 md:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEditRoom(room)}
                        className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition cursor-pointer"
                        title="Edit Kamar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRoom(room)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                        title="Hapus Kamar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
