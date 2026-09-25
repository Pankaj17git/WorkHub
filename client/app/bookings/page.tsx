'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/jobs/my-jobs');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#0066f5] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Loading bookings...</span>
      </div>
    </div>
  );
}
