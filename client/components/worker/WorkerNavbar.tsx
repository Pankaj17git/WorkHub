'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ArrowLeftRight,
  Menu,
  LogOut,
  User,
  Briefcase
} from 'lucide-react';
import { clearSession, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

interface WorkerNavbarProps {
  onToggleSidebar?: () => void;
}

export default function WorkerNavbar({ onToggleSidebar }: WorkerNavbarProps) {
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const handleLogout = () => {
    clearSession();
    router.push('/login?role=WORKER');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black/5 h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between">

      {/* Left side: Hamburger + Brand Pro Badge */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#2a2a2a] hover:bg-[#f4eee4]"
            aria-label="Toggle worker navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <Link href="/worker/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#f5a623] flex items-center justify-center text-black shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div className="flex flex-col">
              <span
                className="text-base font-extrabold tracking-tight text-[#2a2a2a] leading-none"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                WorkHub
              </span>
              <span className="text-[10px] font-bold text-[#875b13] tracking-wider uppercase">
                Pro Partner Portal
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Center/Right: Online Status Toggle, Notifications, Role Switcher, Logout */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Availability Online/Offline Pill Switch */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4eee4] border border-black/5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? 'bg-[#149343] animate-pulse' : 'bg-[#9c9c9c]'
            }`}
          />
          <span className="text-xs font-bold text-[#2a2a2a]">
            {isOnline ? 'Online (Accepting Jobs)' : 'Offline (Paused)'}
          </span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
              isOnline
                ? 'bg-[rgba(20,147,67,0.12)] text-[#149343] hover:bg-[rgba(20,147,67,0.2)]'
                : 'bg-black/5 text-[#606060] hover:bg-black/10'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Notifications Icon with Badge */}
        <Link
          href="/worker/jobs"
          className="relative p-2 rounded-xl text-[#606060] hover:text-[#2a2a2a] hover:bg-[#f4eee4] transition-colors"
          title="Incoming Job Requests"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#f5a623] border-2 border-white ring-1 ring-[rgba(245,166,35,0.4)]" />
        </Link>

        {/* Role Switcher: Back to Customer Marketplace */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eae4db] hover:bg-black/10 text-[#2a2a2a] text-xs font-semibold transition-colors"
          title="Switch back to Customer Marketplace"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#2f68c5]" />
          <span className="hidden sm:inline">Switch to Customer App</span>
          <span className="sm:hidden">Customer App</span>
        </Link>

        {/* Session info + Logout */}
        {session ? (
          <div className="flex items-center gap-1.5">
            <Link
              href="/worker/profile"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#f4eee4] border border-black/5 text-xs font-bold text-[#2a2a2a] hover:bg-[#eae4db] transition-colors"
              title="Worker Profile"
            >
              <User className="w-3.5 h-3.5 text-[#149343]" />
              <span className="max-w-20 sm:max-w-28 truncate">{session.name || session.email}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#606060] hover:text-[#DC2626] hover:bg-red-50 rounded-xl transition-colors"
              title="Log out from Pro Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login?role=WORKER"
            className="whl-btn whl-btn-primary px-3 py-1.5 text-xs"
          >
            Log In
          </Link>
        )}

      </div>

    </header>
  );
}
