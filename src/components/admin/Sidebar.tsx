'use client';

import React, { useState, useEffect } from 'react';
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
  CalendarCheck,
  MessageSquareWarning,
  CreditCard,
  TrendingUp,
  FileText,
  History,
  ChevronDown,
  Smartphone,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

type NavSingleItem = {
  type: 'item';
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number | null;
};

type NavChildItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number | null;
};

type NavGroupItem = {
  type: 'group';
  id: string;
  label: string;
  icon: React.ElementType;
  children: NavChildItem[];
};

type NavSection = {
  title: string;
  items: (NavSingleItem | NavGroupItem)[];
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navigationSections: NavSection[] = [
    {
      title: 'Utama',
      items: [
        {
          type: 'item',
          href: '/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Manajemen Properti',
      items: [
        {
          type: 'group',
          id: 'property-management',
          label: 'Properti & Unit',
          icon: Building2,
          children: [
            { href: '/dashboard/properties', label: 'Master Properti', icon: Building2 },
            { href: '/dashboard/rooms', label: 'Manajemen Kamar', icon: DoorClosed },
            { href: '/dashboard/facilities', label: 'Master Fasilitas', icon: Sparkles },
          ],
        },
        {
          type: 'group',
          id: 'tenant-management',
          label: 'Penghuni & Sewa',
          icon: Users,
          children: [
            { href: '/dashboard/bookings', label: 'Booking Masuk', icon: CalendarCheck },
            { href: '/dashboard/tenancies', label: 'Penyewa & Sewa', icon: Users },
            { href: '/dashboard/complaints', label: 'Aduan Penghuni', icon: MessageSquareWarning },
          ],
        },
      ],
    },
    {
      title: 'Penagihan & Tagihan',
      items: [
        {
          type: 'group',
          id: 'billing-management',
          label: 'Pusat Penagihan WA',
          icon: Smartphone,
          children: [
            { href: '/dashboard/billing', label: 'Tagih Penghuni', icon: Smartphone },
            { href: '/dashboard/billing/templates', label: 'Template Pesan', icon: FileText },
            { href: '/dashboard/billing/history', label: 'Riwayat Penagihan', icon: History },
          ],
        },
        {
          type: 'group',
          id: 'invoice-management',
          label: 'Tagihan & Laporan',
          icon: Receipt,
          children: [
            { href: '/dashboard/invoices', label: 'Daftar Tagihan', icon: Receipt },
            { href: '/dashboard/reports', label: 'Laporan Keuangan', icon: TrendingUp },
          ],
        },
      ],
    },
  ];

  // Initialize open groups based on active route
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      'property-management': true,
      'tenant-management': true,
      'billing-management': true,
      'invoice-management': true,
    };
    return initial;
  });

  // Automatically expand group containing active route if it was closed
  useEffect(() => {
    setOpenGroups((prev) => {
      let hasChanges = false;
      const updated = { ...prev };

      navigationSections.forEach((section) => {
        section.items.forEach((item) => {
          if (item.type === 'group') {
            const hasActiveChild = item.children.some(
              (child) => pathname === child.href || pathname.startsWith(child.href + '/')
            );
            if (hasActiveChild && !updated[item.id]) {
              updated[item.id] = true;
              hasChanges = true;
            }
          }
        });
      });

      return hasChanges ? updated : prev;
    });
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

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

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-slate-400 select-none">
                {section.title}
              </div>

              {section.items.map((item) => {
                if (item.type === 'item') {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-teal-50/90 text-teal-800 border border-teal-200/70 font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-2xs animate-pulse shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                // Group with Sub-menus
                const GroupIcon = item.icon;
                const isExpanded = !!openGroups[item.id];
                const hasActiveChild = item.children.some(
                  (child) => pathname === child.href || pathname.startsWith(child.href + '/')
                );
                const groupBadgeCount = item.children.reduce((acc, curr) => acc + (curr.badge ?? 0), 0);

                return (
                  <div key={item.id} className="space-y-0.5">
                    {/* Group Header Button */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-left select-none ${
                        hasActiveChild
                          ? 'text-teal-900 font-semibold bg-teal-50/40'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <GroupIcon
                        className={`w-4 h-4 shrink-0 ${hasActiveChild ? 'text-teal-700' : 'text-slate-400'}`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>

                      {/* Parent Badge if collapsed and contains pending count */}
                      {!isExpanded && groupBadgeCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-2xs shrink-0">
                          {groupBadgeCount}
                        </span>
                      )}

                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isExpanded ? 'rotate-180 text-slate-600' : ''
                        }`}
                      />
                    </button>

                    {/* Sub-menu Items */}
                    {isExpanded && (
                      <div className="ml-4 pl-3.5 border-l-2 border-slate-100 space-y-0.5 my-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive =
                            pathname === child.href || pathname.startsWith(child.href + '/');

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
                              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                                isChildActive
                                  ? 'bg-teal-50/90 text-teal-800 border border-teal-200/60 font-semibold shadow-xs'
                                  : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-900'
                              }`}
                            >
                              <ChildIcon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isChildActive ? 'text-teal-700' : 'text-slate-400'
                                }`}
                              />
                              <span className="flex-1 truncate">{child.label}</span>
                              {child.badge !== undefined && child.badge !== null && child.badge > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white shadow-2xs animate-pulse shrink-0">
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
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
