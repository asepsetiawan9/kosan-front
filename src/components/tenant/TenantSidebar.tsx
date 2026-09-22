'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  MessageSquareWarning, 
  Home, 
  ShieldCheck,
  Building,
  FileText
} from 'lucide-react';
import { clsx } from 'clsx';

interface TenantSidebarProps {
  roomNumber?: string;
}

export const TenantSidebar: React.FC<TenantSidebarProps> = ({ roomNumber }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
    { name: 'Tagihan Saya', href: '/portal/invoices', icon: Receipt },
    { name: 'Kontrak Sewa', href: '/portal/contract', icon: FileText },
    { name: 'Aduan Fasilitas', href: '/portal/complaints', icon: MessageSquareWarning },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col shrink-0 shadow-soft-card">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md">
          <Building className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-base leading-tight">Portal Penghuni</h1>
          <p className="text-xs text-indigo-600 font-semibold tracking-wide">KOSAN MANDIRI</p>
        </div>
      </div>

      {/* Room Active Card Badge */}
      {roomNumber && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium">Kamar Aktif Anda</p>
            <p className="text-sm font-bold text-slate-900 truncate">Kamar {roomNumber}</p>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 p-4 space-y-1.5 mt-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-white' : 'text-slate-400')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Security & Support Footer */}
      <div className="p-4 border-t border-slate-100 m-4 rounded-xl bg-slate-50/80 border text-xs text-slate-500">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Hunian Terpercaya</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Hubungi pengelola kos jika butuh bantuan darurat.
        </p>
      </div>
    </aside>
  );
};
