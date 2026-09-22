'use client';

import React, { useState, useEffect } from 'react';
import { BookingModalForm } from '@/components/public/BookingModalForm';
import { RoomCard } from '@/components/public/RoomCard';
import { RoomFilterBar } from '@/components/public/RoomFilterBar';
import { Room, Facility } from '@/lib/types';
import { DoorClosed } from 'lucide-react';

export default function RoomCatalogPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  // Filters State
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  // Fetch facilities master for filter
  useEffect(() => {
    async function loadFacilities() {
      try {
        const res = await fetch('/api/proxy/public/rooms');
        if (res.ok) {
          const json = await res.json();
          const allFacs: Facility[] = [];
          const seen = new Set<string>();
          (json.data || []).forEach((r: Room) => {
            (r.facilities || []).forEach((f: Facility) => {
              if (!seen.has(f.id)) {
                seen.add(f.id);
                allFacs.push(f);
              }
            });
          });
          setFacilities(allFacs);
        }
      } catch (e) {
        console.error('Gagal mengambil master fasilitas:', e);
      }
    }
    loadFacilities();
  }, []);

  // Fetch rooms with filters
  useEffect(() => {
    async function fetchRooms() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedType !== 'all') params.append('type', selectedType);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (maxPrice < 5000000) params.append('max_price', maxPrice.toString());
        if (selectedFacilities.length > 0) {
          params.append('facilities', selectedFacilities.join(','));
        }

        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`/api/proxy/public/rooms${query}`);

        if (res.ok) {
          const json = await res.json();
          setRooms(json.data || []);
        }
      } catch (err) {
        console.error('Gagal mengambil daftar kamar:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchRooms();
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedType, searchQuery, maxPrice, selectedFacilities]);

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const resetFilters = () => {
    setSelectedType('all');
    setSearchQuery('');
    setMaxPrice(5000000);
    setSelectedFacilities([]);
  };

  return (
    <div className="py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="mb-8 p-8 rounded-3xl gradient-fresh-horizon border border-slate-200/90 shadow-xs">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
              Katalog Properti Kos
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pilihan Kamar Tersedia Siap Huni
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pilih kamar yang sesuai dengan kebutuhan anggaran dan gaya hidup Anda. Semua kamar telah diverifikasi kebersihan dan kelayakan fasilitasnya.
            </p>
          </div>
        </div>

        {/* Filter Bar Component */}
        <RoomFilterBar
          selectedType={selectedType}
          onSelectType={setSelectedType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          facilities={facilities}
          selectedFacilities={selectedFacilities}
          onToggleFacility={toggleFacility}
          onResetFilters={resetFilters}
        />

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-84 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <DoorClosed className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              Tidak Ada Kamar yang Cocok
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Coba sesuaikan filter pencarian, rentang harga, atau reset filter untuk melihat seluruh kamar yang tersedia.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={(r) => setSelectedRoomForBooking(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModalForm
          room={selectedRoomForBooking}
          isOpen={!!selectedRoomForBooking}
          onClose={() => setSelectedRoomForBooking(null)}
        />
      )}
    </div>
  );
}
