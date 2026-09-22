'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  MessageSquare,
  Users,
  Star,
  Wallet,
  Settings,
  ArrowRight,
  ChevronRight,
  X,
} from 'lucide-react';
import WorkHubBrand from '@/components/ui/WorkHubBrand';

interface WorkerSidebarProps {
  onClose?: () => void;
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export default function WorkerSidebar({ onClose, className = '' }: WorkerSidebarProps) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Find Jobs', href: '/worker/search', icon: Search },
    { label: 'My Jobs', href: '/worker/jobs', icon: Briefcase, badge: 3 },
    { label: 'Messages', href: '/worker/message', icon: MessageSquare, badge: 5 },
    { label: 'My Network', href: '/worker/network', icon: Users },
    { label: 'Reviews & Ratings', href: '/worker/reviews', icon: Star },
    { label: 'Earnings & Payouts', href: '/worker/earnings', icon: Wallet },
    { label: 'Profile & Settings', href: '/worker/profile', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 bg-[#0A1128] text-white flex flex-col justify-between h-full min-h-screen p-5 border-r border-slate-800/80 select-none ${className}`}
    >
      {/* Top Section: Logo Brand + Navigation Menu */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <WorkHubBrand
            theme="dark"
            size={34}
            href="/worker/dashboard"
            tagline="Skilled People. Real Work."
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

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/worker/dashboard'
                ? pathname === '/worker/dashboard' || pathname === '/worker'
                : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0062ff] text-white shadow-md shadow-blue-500/25 font-bold'
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

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-500 text-white leading-none shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Team Promo Card & Online Status Toggle */}
      <div className="space-y-4 pt-6 mt-4 border-t border-slate-800/60">
        {/* Team Builder Banner Card */}
        <div className="p-4 rounded-2xl bg-[#121c38] border border-blue-900/40 relative overflow-hidden shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3">
            <Users className="w-4 h-4" />
          </div>

          <h4 className="text-xs font-bold text-white tracking-tight">
            Need extra hands?
          </h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Invite your trusted workers and build your team.
          </p>

          <Link
            href="/worker/network"
            onClick={onClose}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Build Your Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Worker Availability Online/Offline Status */}
        <div
          onClick={() => setIsOnline(!isOnline)}
          role="button"
          tabIndex={0}
          title="Click to toggle availability"
          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-tight">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {isOnline ? 'Available for new jobs' : 'Not accepting requests'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </aside>
  );
}
