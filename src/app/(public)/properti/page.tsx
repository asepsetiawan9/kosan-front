'use client';

import React, { useState, useEffect } from 'react';
import { Search, Building2, MapPin, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { Property } from '@/lib/types';
import { PropertyCard } from '@/components/public/PropertyCard';

export default function PublicPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [cities, setCities] = useState<string[]>([]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/proxy/public/properties');
      if (res.ok) {
        const json = await res.json();
        const data: Property[] = json.data || [];
        setProperties(data);

        // Extract unique cities
        const uniqueCities = Array.from(
          new Set(data.map((p) => p.city).filter((c): c is string => Boolean(c)))
        );
        setCities(uniqueCities);
      }
    } catch (err) {
      console.error('Failed to fetch public properties', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCity = selectedCity === 'all' || p.city === selectedCity;

    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8 sm:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-teal-700/40">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold backdrop-blur-md border border-teal-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jaringan Hunian Kosan Terpercaya</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Pilihan Gedung & Lokasi Strategis
            </h1>
            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed">
              Jelajahi berbagai pilihan properti kosan kami dengan fasilitas lengkap, akses mudah ke kampus dan perkantoran, serta lingkungan aman & nyaman.
            </p>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute right-40 bottom-0 -mb-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama kosan, jalan, atau area..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Kota:
            </span>

            <button
              type="button"
              onClick={() => setSelectedCity('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCity === 'all'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kota
            </button>

            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCity === city
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse space-y-4">
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center rounded-3xl bg-white border border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak Ada Properti yang Sesuai</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              Coba sesuaikan kata kunci pencarian atau pilih kota lainnya.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
