'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ArrowRight, Eye } from 'lucide-react';
import { getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

export default function AdminReturnBanner() {
  const pathname = usePathname();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  // Only display when user is logged in as ADMIN and currently outside of /admin
  if (session?.role !== 'ADMIN' || pathname.startsWith('/admin') || pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const currentView = pathname.startsWith('/worker')
    ? 'Worker Experience'
    : pathname.startsWith('/dashboard') || pathname.startsWith('/bookings') || pathname.startsWith('/book')
    ? 'Customer Experience'
    : 'Public Marketplace';

  return (
    <aside
      aria-label="Admin Preview Mode"
      className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs py-2 px-4 border-b border-indigo-500/30 sticky top-0 z-50 shadow-md backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[11px] border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            ADMIN PREVIEW
          </span>
          <span className="hidden sm:inline text-slate-300">
            Viewing platform in <strong className="text-white font-semibold">{currentView}</strong> mode
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-xs hover:shadow-indigo-500/25"
          >
            <span>Return to Admin Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
