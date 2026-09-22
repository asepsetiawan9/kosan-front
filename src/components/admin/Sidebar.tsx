'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  DoorClosed,
  Users,
  Receipt,
  Sparkles,
  LogOut,
  X,
  CalendarCheck,
  MessageSquareWarning,
  CreditCard,
  TrendingUp,
} from 'lucide-react';


interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/bookings', label: 'Booking Masuk', icon: CalendarCheck },
    { href: '/dashboard/rooms', label: 'Manajemen Kamar', icon: DoorClosed },
    { href: '/dashboard/tenancies', label: 'Penyewa & Sewa', icon: Users },
    { href: '/dashboard/invoices', label: 'Tagihan & Keuangan', icon: Receipt },
    { href: '/dashboard/payments', label: 'Verifikasi Pembayaran', icon: CreditCard },
    { href: '/dashboard/reports', label: 'Laporan Keuangan', icon: TrendingUp },
    { href: '/dashboard/complaints', label: 'Aduan Penghuni', icon: MessageSquareWarning },
    { href: '/dashboard/facilities', label: 'Master Fasilitas', icon: Sparkles },
  ];


  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center gap-3 px-6 border-b border-slate-100 gradient-fresh-horizon">
          <div className="w-10 h-10 rounded-xl gradient-emerald-glow text-white shadow-emerald-glow flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">KosanKu</h2>
            <p className="text-xs text-emerald-700 font-medium">Core Admin Panel</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-50/80 text-teal-800 border border-teal-200/60 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-semibold text-xs flex items-center justify-center">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Administrator</p>
              <p className="text-[11px] text-slate-500 truncate">admin@kosan.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Sistem
          </button>
        </div>
      </aside>
    </>
  );
};
