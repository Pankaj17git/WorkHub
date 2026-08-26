'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  ArrowLeftRight, 
  Menu, 
  LogOut,
  User
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
    <header className="sticky top-0 z-40 bg-[#ffffff] border-b border-[#e2e8f0] h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between">
      
      {/* Left side: Hamburger + Brand Pro Badge */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#0d1c2e] hover:bg-[#f1f5f9]"
            aria-label="Toggle worker navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <Link href="/worker/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#091426] to-[#0051d5] flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              W<span className="text-[#38bdf8]">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-[#091426] leading-none">
                Work<span className="text-[#0051d5]">Hub</span>
              </span>
              <span className="text-[10px] font-bold text-[#0d9488] font-geist tracking-wider uppercase">
                Pro Partner Portal
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Center/Right: Online Status Toggle, Notifications, Role Switcher, Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Availability Online/Offline Pill Switch */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8f9ff] border border-[#e2e8f0]">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? 'bg-[#16a34a] animate-pulse' : 'bg-[#94a3b8]'
            }`}
          />
          <span className="text-xs font-bold font-geist text-[#091426]">
            {isOnline ? 'Online (Accepting Jobs)' : 'Offline (Paused)'}
          </span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
              isOnline
                ? 'bg-[#ecfdf5] text-[#0d9488] hover:bg-[#d1fae5]'
                : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Notifications Icon with Badge */}
        <Link
          href="/worker/jobs"
          className="relative p-2 rounded-xl text-[#475569] hover:text-[#091426] hover:bg-[#f1f5f9] transition-colors"
          title="Incoming Job Requests"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#d97706] border-2 border-white ring-1 ring-[#d97706]/40" />
        </Link>

        {/* Role Switcher: Back to Customer Marketplace */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091426] hover:bg-[#1e293b] text-white text-xs font-semibold shadow-xs transition-colors"
          title="Switch back to Customer Marketplace"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="hidden sm:inline">Switch to Customer App</span>
          <span className="sm:hidden">Customer App</span>
        </Link>

        {/* Session info + Logout */}
        {session ? (
          <div className="flex items-center gap-1.5">
            <Link
              href="/worker/profile"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#f1f5f9] border border-[#e2e8f0] text-xs font-bold text-[#091426] hover:bg-[#e2e8f0] transition-colors"
              title="Worker Profile"
            >
              <User className="w-3.5 h-3.5 text-[#0d9488]" />
              <span className="max-w-20 sm:max-w-28 truncate">{session.name || session.email}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#64748b] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Log out from Pro Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login?role=WORKER"
            className="px-3 py-1.5 rounded-xl bg-[#0051d5] text-white text-xs font-bold shadow-xs hover:bg-[#0042b0] transition-colors"
          >
            Log In
          </Link>
        )}

      </div>

    </header>
  );
}
