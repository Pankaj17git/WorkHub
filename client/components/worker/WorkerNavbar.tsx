'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  MapPin, 
  ShieldCheck, 
  ArrowLeftRight, 
  Menu, 
  X,
  Zap,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface WorkerNavbarProps {
  onToggleSidebar?: () => void;
}

export default function WorkerNavbar({ onToggleSidebar }: WorkerNavbarProps) {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <header className="sticky top-0 z-40 bg-[#ffffff] border-b border-[#e2e8f0] h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between">
      
      {/* Left side: Hamburger + Brand Pro Badge */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#0d1c2e] hover:bg-[#f1f5f9]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <Link href="/worker/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#091426] to-[#0051d5] flex items-center justify-center text-white font-bold text-base shadow-sm">
              W<span className="text-[#38bdf8]">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-[#091426] leading-none">
                Work<span className="text-[#0051d5]">Hub</span>
              </span>
              <span className="text-[10px] font-bold text-[#0d9488] font-geist tracking-wider uppercase">
                Pro Partner
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Center/Right: Online Status Toggle, Notifications, Role Switcher */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Availability Online/Offline Pill Switch */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8f9ff] border border-[#e2e8f0]">
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
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091426] hover:bg-[#1e293b] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Switch to Customer App</span>
        </Link>

        {/* Worker Avatar */}
        <Link href="/worker/profile" className="relative group shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[#e2e8f0] group-hover:border-[#0051d5] transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80"
              alt="Rahul Sharma"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

      </div>

    </header>
  );
}
