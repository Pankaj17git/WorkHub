'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WorkerNavbar from '@/components/worker/WorkerNavbar';
import WorkerSidebar from '@/components/worker/WorkerSidebar';
import WorkHubBrand from '@/components/ui/WorkHubBrand';
import { ArrowLeftRight } from 'lucide-react';

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Determine if current page is onboarding
  const isOnboarding = pathname.startsWith('/worker/onboarding');

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col text-[#0d1c2e]">
        {/* Clean Onboarding Header without Dashboard Sidebar */}
        <header className="bg-white border-b border-[#e2e8f0] h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between">
          <WorkHubBrand theme="light" size={34} href="/" tagline="Pro Onboarding" />

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                pathname.includes('login')
                  ? 'bg-[#f1f5f9] text-[#091426]'
                  : 'text-[#64748b] hover:text-[#091426]'
              }`}
            >
              Log In
            </Link>

            <Link
              href="/signup"
              className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all ${
                pathname.includes('signup')
                  ? 'bg-[#0051d5] text-white shadow-md'
                  : 'bg-[#eff6ff] text-[#0051d5] hover:bg-[#dbeafe]'
              }`}
            >
              Sign Up
            </Link>

            <span className="w-px h-5 bg-[#e2e8f0] hidden sm:inline-block" />

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-semibold text-[#091426] transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Back to Customer App</span>
            </Link>
          </div>
        </header>

        {/* Centered Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="w-full">{children}</div>
        </main>
      </div>
    );
  }

  // Unified Full-Height Dark Sidebar + Clean Canvas Layout for all Worker Pages
  return (
    <div className="min-h-screen bg-[#f4f7fc] flex flex-row text-[#0d1c2e] h-screen overflow-hidden">
      {/* 1. Desktop Fixed Dark Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        <WorkerSidebar />
      </div>

      {/* 2. Mobile Responsive Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-[#0A1128] h-full shadow-2xl">
            <WorkerSidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Column: Top Navbar + Scrollable Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen h-100vh overflow-y-auto">
        {/* Sticky Topbar */}
        <WorkerNavbar onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto max-h-calc(100vh - 73px)">
          {children}
        </main>
      </div>
    </div>
  );
}
