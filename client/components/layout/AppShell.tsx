'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkerRoute = pathname.startsWith('/worker');
  const isApiDocsRoute = pathname.startsWith('/api-docs');
  const isLandingRoute = pathname === '/';

  if (isWorkerRoute || isApiDocsRoute || isLandingRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
