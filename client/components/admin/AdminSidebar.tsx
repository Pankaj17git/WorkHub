'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Wrench,
  HardHat,
  UserCheck,
  ShoppingBag,
  Briefcase,
  Search,
  LogOut,
  X,
  ShieldCheck,
  ArrowUpRight,
  Database,
  Activity,
} from 'lucide-react';
import WorkHubBrand from '@/components/ui/WorkHubBrand';
import { clearSession, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

interface AdminSidebarProps {
  onClose?: () => void;
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export default function AdminSidebar({ onClose, className = '' }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const navItems: NavItem[] = [
    { label: 'Dashboard & Stats', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users & Clients', href: '/admin/users', icon: Users },
    { label: 'Skills Database', href: '/admin/skills', icon: Wrench },
    { label: 'Workers Directory', href: '/admin/workers', icon: HardHat },
    { label: 'Customers Directory', href: '/admin/customers', icon: UserCheck },
  ];

  const handleLogout = () => {
    clearSession();
    router.push('/admin/login');
  };

  return (
    <aside
      className={`w-68 bg-[#0b0f19] text-white flex flex-col justify-between h-full min-h-screen p-4 border-r border-slate-800/80 select-none ${className}`}
    >
      {/* Top Section: Brand + Admin Badge + Nav Menu */}
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="pb-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <WorkHubBrand
              theme="dark"
              size={32}
              href="/admin/dashboard"
              tagline="Central Command"
            />
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/20 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Admin Operations
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
        </div>

        {/* Primary Management Navigation */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 block">
            Platform Management
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin/dashboard'
                  ? pathname === '/admin/dashboard' || pathname === '/admin'
                  : pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Portal Switching / Cross-Visiting Section */}
        <div className="space-y-1 pt-3 border-t border-slate-800/60">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 block">
            Inspect Portals
          </span>
          <div className="space-y-1">
            <Link
              href="/worker/dashboard"
              onClick={onClose}
              className="group flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-teal-950/40 border border-transparent hover:border-teal-500/30 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>Visit Worker Portal</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </Link>

            <Link
              href="/dashboard"
              onClick={onClose}
              className="group flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-blue-950/40 border border-transparent hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Visit Customer Portal</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </Link>

            <Link
              href="/search"
              onClick={onClose}
              className="group flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Public Marketplace</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Admin User Card + Sign Out */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
            {session?.name ? session.name[0].toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-white block truncate">
              {session?.name || 'Administrator'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {session?.email || 'admin@workhub.com'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
}
