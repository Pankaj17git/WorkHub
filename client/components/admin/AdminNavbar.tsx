'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  ShieldCheck,
  ShoppingBag,
  Briefcase,
  LogOut,
  ExternalLink,
  Search,
  Bell,
  Sparkles,
  Database,
  Layers,
} from 'lucide-react';
import { clearSession, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
  className?: string;
}

export default function AdminNavbar({ onToggleSidebar, className = '' }: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.push('/admin/login');
  };

  const getPageTitle = () => {
    if (pathname.includes('/admin/users')) return 'Users & Clients Directory';
    if (pathname.includes('/admin/skills')) return 'Skills Database Management';
    if (pathname.includes('/admin/workers')) return 'Service Workers Directory';
    if (pathname.includes('/admin/customers')) return 'Customers & Clients Directory';
    return 'Admin Dashboard & Platform Stats';
  };

  return (
    <header
      className={`bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 select-none ${className}`}
    >
      {/* Left side: Hamburger (Mobile) + Current Page Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
              Admin Console
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">Live Workspace</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side: Quick Cross-Portal Switchers + Live Pill + Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Portal Switchers */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
          <Link
            href="/worker/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-white transition-all shadow-2xs"
            title="Inspect platform as a Service Professional"
          >
            <Briefcase className="w-3.5 h-3.5 text-teal-600" />
            <span>Worker Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-white transition-all shadow-2xs"
            title="Inspect platform as a Customer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Customer Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {/* Database indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-[11px] font-medium text-emerald-800">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>MariaDB Connected</span>
        </div>

        {/* Profile Avatar / Trigger */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
            aria-expanded={profileDropdownOpen}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {session?.name ? session.name[0].toUpperCase() : 'A'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-none">
              <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                {session?.name || 'Admin'}
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                SUPERADMIN
              </span>
            </div>
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{session?.name || 'Administrator'}</p>
                <p className="text-[11px] text-slate-500 truncate">{session?.email || 'admin@workhub.com'}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  Full System Privileges
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  href="/worker/dashboard"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-600"
                >
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span>Switch to Worker Portal</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <span>Switch to Customer Portal</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
