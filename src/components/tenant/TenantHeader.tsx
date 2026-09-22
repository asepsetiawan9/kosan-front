'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';
import { TenantProfile } from '@/lib/types';

interface TenantHeaderProps {
  profile?: TenantProfile | null;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({ profile }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore error
    } finally {
      router.push('/portal/login');
      router.refresh();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500">Selamat Datang,</span>
        <span className="text-sm font-bold text-slate-900">{profile?.name || 'Penghuni'}</span>
        {profile?.active_tenancy?.room?.room_number && (
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700">
            Kamar {profile.active_tenancy.room.room_number}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* User Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
            {getInitials(profile?.name)}
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-semibold text-slate-800 leading-none">{profile?.name || 'Penghuni'}</p>
            <p className="text-slate-400 mt-0.5">{profile?.phone || profile?.email || 'Penyewa Aktif'}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Keluar Akun"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
