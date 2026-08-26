'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  Wallet,
  UserCheck,
  ShieldCheck,
  ArrowLeftRight
} from 'lucide-react';
import { getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

interface WorkerSidebarProps {
  onClose?: () => void;
}

export default function WorkerSidebar({ onClose }: WorkerSidebarProps) {
  const pathname = usePathname();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const navItems = [
    { label: 'Dashboard', href: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Job Requests', href: '/worker/jobs', icon: Inbox, badge: '2 New' },
    { label: 'My Services & Rates', href: '/worker/services', icon: Wrench },
    { label: 'Earnings & Payouts', href: '/worker/earnings', icon: Wallet },
    { label: 'Manage Profile', href: '/worker/profile', icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-black/5 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 p-4">

      {/* Navigation Links */}
      <div className="space-y-6">

        {/* Worker Mini Profile Badge */}
        <div className="p-3.5 rounded-xl bg-[#f4eee4] flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80"
            alt="Rahul Sharma"
            className="w-10 h-10 rounded-lg object-cover border border-black/5"
          />
          <div className="overflow-hidden">
            <h4
              className="text-xs font-bold text-[#2a2a2a] truncate"
              style={{ fontFamily: 'var(--gesso-font-body)' }}
            >
              {session?.name || session?.email || 'Rahul Sharma'}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-[#149343] font-medium mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Pro Partner</span>
            </div>
          </div>
        </div>

        {/* Links list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/worker/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-[#eae4db] text-[#2a2a2a] font-bold'
                    : 'text-[#606060] hover:bg-[#f4eee4] hover:text-[#2a2a2a] font-semibold'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#f5a623]" />
                )}
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#875b13]' : 'text-[#9c9c9c]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-[#2f68c5]'
                        : 'bg-[rgba(59,130,246,0.12)] text-[#2f68c5]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      </div>

      {/* Bottom Section: Role Switch + Help */}
      <div className="pt-4 border-t border-black/5 space-y-2">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#f4eee4] hover:bg-[#eae4db] text-xs font-semibold text-[#2a2a2a] transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#2f68c5]" />
          <span>Switch to Customer App</span>
        </Link>
      </div>

    </aside>
  );
}
