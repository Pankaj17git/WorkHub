'use client';

import React, { useState } from 'react';
import WorkerNavbar from '@/components/worker/WorkerNavbar';
import WorkerSidebar from '@/components/worker/WorkerSidebar';

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
