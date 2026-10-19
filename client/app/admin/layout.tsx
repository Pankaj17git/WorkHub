'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If this is the standalone Admin Login page, render directly without the dashboard chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex flex-row text-[#0b1329] h-screen overflow-hidden">
      {/* 1. Desktop Fixed Dark Executive Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        <AdminSidebar />
      </div>

      {/* 2. Mobile Responsive Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-68 bg-[#0b0f19] h-full shadow-2xl">
            <AdminSidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Column: Sticky Top Navbar + Scrollable Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen h-[100vh] overflow-y-auto">
        <AdminNavbar onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
