'use client';

import React from 'react';
import { Menu, Bell, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  title = 'Dashboard',
  subtitle = 'Ringkasan operasional dan metrik properti kosan Anda',
}) => {
  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 gradient-fresh-horizon">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-white/80 border border-slate-200 lg:hidden shadow-xs"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-bold text-slate-900 leading-tight">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Online Status Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 border border-emerald-200 text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sistem Siap Operasi</span>
        </div>

        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
          <Bell className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
