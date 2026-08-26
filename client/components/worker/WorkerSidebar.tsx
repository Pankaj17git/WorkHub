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
    <aside className="w-64 bg-[#ffffff] border-r border-[#e2e8f0] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 p-4">
      
      {/* Navigation Links */}
      <div className="space-y-6">
        
        {/* Worker Mini Profile Badge */}
        <div className="p-3.5 rounded-2xl bg-[#f8f9ff] border border-[#e2e8f0] flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80"
            alt="Rahul Sharma"
            className="w-10 h-10 rounded-xl object-cover border border-[#e2e8f0]"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#091426] truncate">
              {session?.name || session?.email || 'Rahul Sharma'}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-[#0d9488] font-medium mt-0.5">
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0051d5] text-white shadow-sm font-bold'
                    : 'text-[#475569] hover:bg-[#f8f9ff] hover:text-[#091426]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#64748b]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-geist ${
                      isActive
                        ? 'bg-white text-[#0051d5]'
                        : 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
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
      <div className="pt-4 border-t border-[#f1f5f9] space-y-2">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-semibold text-[#091426] transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#0051d5]" />
          <span>Switch to Customer App</span>
        </Link>
      </div>

    </aside>
  );
}
