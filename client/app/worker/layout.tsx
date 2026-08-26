'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WorkerNavbar from '@/components/worker/WorkerNavbar';
import WorkerSidebar from '@/components/worker/WorkerSidebar';
import { ArrowLeftRight, Briefcase } from 'lucide-react';

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
      <div className="min-h-screen bg-[#f4eee4] flex flex-col text-[#2a2a2a]">
        {/* Clean Onboarding Header without Dashboard Sidebar */}
        <header className="bg-[#f4eee4] h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between">
          <Link href="/" className="flex items-center gap-2 group">
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
                Pro Onboarding
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`whl-btn whl-btn-outline px-3.5 py-1.5 text-xs ${
                pathname.includes('login') ? 'bg-black/5' : ''
              }`}
            >
              Log In
            </Link>

            <Link
              href="/signup"
              className={`whl-btn whl-btn-primary px-4 py-1.5 text-xs ${
                pathname.includes('signup') ? 'brightness-95' : ''
              }`}
            >
              Sign Up
            </Link>

            <span className="w-px h-5 bg-black/10 hidden sm:inline-block" />

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#606060] hover:text-[#2a2a2a] hover:bg-black/5 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#2f68c5]" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </header>

        {/* Full-width Centered Content without Sidebar */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="w-full">{children}</div>
        </main>
      </div>
    );
  }

  // Standard Authenticated Worker Portal with Sidebar
  return (
    <div className="min-h-screen bg-[#f4eee4] flex flex-col text-[#2a2a2a]">
      {/* Worker Sticky Header */}
      <WorkerNavbar onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      {/* Main body: Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">

        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <WorkerSidebar />
        </div>

        {/* Mobile Sidebar Modal */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-64 bg-white h-full rounded-r-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <WorkerSidebar onClose={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Worker View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
