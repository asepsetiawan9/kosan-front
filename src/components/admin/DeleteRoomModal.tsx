'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/api';
import { 
  AlertTriangle, 
  Trash2, 
  Users, 
  Building2, 
  Tag, 
  DollarSign, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface DeleteRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onConfirmDelete: () => Promise<void> | void;
  isDeleting: boolean;
  errorMessage: string | null;
}

export const DeleteRoomModal: React.FC<DeleteRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  onConfirmDelete,
  isDeleting,
  errorMessage,
}) => {
  if (!room) return null;

  const hasActiveTenancy = room.status === 'terisi' || Boolean(room.active_tenancy);

  return (
    <Modal
      isOpen={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      title={hasActiveTenancy ? 'Unit Kamar Tidak Dapat Dihapus' : 'Hapus Unit Kamar'}
      description={
        hasActiveTenancy
          ? 'Kamar ini sedang dalam masa sewa aktif oleh penghuni'
          : 'Tindakan ini memerlukan konfirmasi Anda'
      }
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Error Message Inside Modal */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {hasActiveTenancy ? (
          /* State: Room is currently occupied */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-sm text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Kamar Sedang Berstatus Terisi</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Unit <strong>Kamar {room.room_number} ({room.name})</strong> tidak dapat dihapus karena tercatat masih memiliki penyewa aktif. Menghapus kamar aktif dapat merusak konsistensi data invoice, pembayaran, dan kontrak sewa.
              </p>

              {room.active_tenancy && (
                <div className="pt-2 border-t border-amber-200/70 text-xs space-y-1.5">
                  <div className="flex justify-between text-amber-800">
                    <span className="text-amber-600">Nama Penyewa:</span>
                    <span className="font-semibold">{room.active_tenancy.tenant_name}</span>
                  </div>
                  {room.active_tenancy.tenant_phone && (
                    <div className="flex justify-between text-amber-800">
                      <span className="text-amber-600">Kontak:</span>
                      <span className="font-semibold">{room.active_tenancy.tenant_phone}</span>
                    </div>
                  )}
                  {room.active_tenancy.start_date && (
                    <div className="flex justify-between text-amber-800">
                      <span className="text-amber-600">Mulai Sewa:</span>
                      <span className="font-semibold">{room.active_tenancy.start_date}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
              💡 <strong>Solusi:</strong> Jika masa tinggal penghuni telah selesai, silakan lakukan proses <em>Checkout</em> terlebih dahulu di Manajemen Penyewa agar status kamar kembali kosong.
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto text-xs"
              >
                Tutup
              </Button>
              <Link href="/dashboard/tenancies" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-xs bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Buka Manajemen Penyewa
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* State: Room is vacant, safe to delete */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-sm text-rose-800">
                <Trash2 className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Peringatan Penghapusan Unit</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>Kamar {room.room_number}</strong>? Unit kamar ini akan dihapus dari sistem operasional kos.
              </p>
            </div>

            {/* Room Info Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Properti
                </span>
                <span className="font-semibold text-slate-700">
                  {room.property?.name || 'Kosan Pusat'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Tipe Kamar
                </span>
                <span className="font-semibold text-slate-700 capitalize">
                  {room.type} ({room.name})
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Tarif Bulanan
                </span>
                <span className="font-bold text-teal-700">
                  {formatRupiah(room.base_price)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
                className="w-full sm:w-auto text-xs"
              >
                Batal
              </Button>
              <button
                type="button"
                id="confirm-delete-room-btn"
                onClick={() => onConfirmDelete()}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Hapus Kamar Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
