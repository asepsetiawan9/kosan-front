'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Edit, Trash2, MapPin, ExternalLink, Phone, Mail, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Property } from '@/lib/types';

interface PropertyTableProps {
  properties: Property[];
  isLoading: boolean;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (property: Property) => void;
}

export const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  isLoading,
  onEditProperty,
  onDeleteProperty,
}) => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 md:px-6">Nama Properti & Alamat</th>
              <th className="py-3.5 px-4">Pemilik & Kontak</th>
              <th className="py-3.5 px-4 text-center">Unit Kamar</th>
              <th className="py-3.5 px-4">Peta Lokasi</th>
              <th className="py-3.5 px-4 md:px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Memuat data properti...
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Belum ada properti kosan terdaftar. Klik tombol Tambah Properti.
                </td>
              </tr>
            ) : (
              properties.map((prop) => {
                const mapsUrl =
                  prop.google_maps_url ||
                  (prop.latitude && prop.longitude
                    ? `https://maps.google.com/?q=${prop.latitude},${prop.longitude}`
                    : `https://maps.google.com/?q=${encodeURIComponent(prop.address)}`);

                return (
                  <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Nama & Alamat */}
                    <td className="py-3.5 px-4 md:px-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/70 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-5 h-5 text-teal-700" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{prop.name}</span>
                            {prop.city && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                {prop.city}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 max-w-sm leading-relaxed">
                            {prop.address}
                            {prop.province ? `, ${prop.province}` : ''}
                            {prop.postal_code ? ` ${prop.postal_code}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Pemilik */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-xs">{prop.owner_name}</p>
                        {prop.owner_phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{prop.owner_phone}</span>
                          </div>
                        )}
                        {prop.owner_email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[160px]">{prop.owner_email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Unit Kamar Stats */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                          <span className="font-bold">{prop.total_rooms ?? 0}</span>
                          <span className="text-[10px] text-slate-500 ml-1">Total</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                          <span className="font-bold">{prop.available_rooms ?? 0}</span>
                          <span className="text-[10px] text-emerald-600 ml-1">Kosong</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs">
                          <span className="font-bold">{prop.occupied_rooms ?? 0}</span>
                          <span className="text-[10px] text-indigo-600 ml-1">Terisi</span>
                        </div>
                      </div>
                    </td>

                    {/* Peta Lokasi */}
                    <td className="py-3.5 px-4">
                      {mapsUrl ? (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tanpa koordinat</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 md:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/properties/${prop.id}/media`}
                          className="p-2 rounded-xl text-teal-600 hover:text-teal-800 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition"
                          title="Kelola Media & Iklan"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => onEditProperty(prop)}
                          className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition cursor-pointer"
                          title="Edit Properti"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProperty(prop)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                          title="Hapus Properti"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
