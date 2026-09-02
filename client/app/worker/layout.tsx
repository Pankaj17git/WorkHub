'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WorkerNavbar from '@/components/worker/WorkerNavbar';
import WorkerSidebar from '@/components/worker/WorkerSidebar';
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
        <header className="bg-[#ffffff] border-b border-[#e2e8f0] h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#091426] to-[#0051d5] flex items-center justify-center text-white font-bold text-base shadow-sm">
              W<span className="text-[#38bdf8]">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-[#091426] leading-none">
                Work<span className="text-[#0051d5]">Hub</span>
              </span>
              <span className="text-[10px] font-bold text-[#0d9488] font-geist tracking-wider uppercase">
                Pro Onboarding
              </span>
            </div>
          </Link>

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

        {/* Full-width Centered Content without Sidebar */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="w-full">{children}</div>
        </main>
      </div>
    );
  }

  // Standard Authenticated Worker Portal with Sidebar
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col text-[#0d1c2e]">
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
            <div className="relative z-10 w-64 bg-white h-full shadow-2xl">
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
