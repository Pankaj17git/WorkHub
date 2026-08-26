'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  Clock,
  MapPin,
  CheckCircle2,
  Filter,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import JobRequestCard from '@/components/worker/JobRequestCard';
import { MOCK_INCOMING_REQUESTS } from '@/data/mockWorkerData';
import { WorkerJobRequest } from '@/types';

export default function WorkerJobRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<WorkerJobRequest[]>(MOCK_INCOMING_REQUESTS);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED'>('ALL');

  const handleAcceptJob = (id: string) => {
    setRequests((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'ACCEPTED' } : j))
    );
    router.push(`/worker/jobs/${id}`);
  };

  const handleDeclineJob = (id: string) => {
    setRequests((prev) => prev.filter((j) => j.id !== id));
  };

  const displayedRequests = requests.filter((r) => {
    if (filterTab === 'PENDING') return r.status === 'PENDING';
    if (filterTab === 'ACCEPTED') return r.status === 'ACCEPTED';
    return true;
  });

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl font-extrabold text-[#2a2a2a] tracking-tight"
              style={{ fontFamily: 'var(--gesso-font-display)' }}
            >
              Job Requests & Inbound Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[rgba(59,130,246,0.12)] text-[#2f68c5] text-xs font-bold">
              {requests.filter((r) => r.status === 'PENDING').length} New
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#606060] mt-1">
            Real-time incoming job offers matched to your skill profile in Chandigarh.
          </p>
        </div>

        {/* Filter Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#eae4db] rounded-xl">
          {(['ALL', 'PENDING', 'ACCEPTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === tab
                  ? 'bg-white text-[#2a2a2a] shadow-sm'
                  : 'text-[#606060] hover:text-[#2a2a2a]'
              }`}
            >
              {tab === 'ALL' ? 'All Requests' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {displayedRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f4eee4] text-[#606060] flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3
              className="text-base font-bold text-[#2a2a2a]"
              style={{ fontFamily: 'var(--gesso-font-display)' }}
            >
              No job requests in this tab
            </h3>
            <p className="text-xs text-[#606060] max-w-sm mx-auto">
              Keep your availability status online. New requests appear automatically as customers book.
            </p>
          </div>
        ) : (
          displayedRequests.map((job) => (
            <JobRequestCard
              key={job.id}
              job={job}
              onAccept={handleAcceptJob}
              onDecline={handleDeclineJob}
            />
          ))
        )}
      </div>

    </div>
  );
}
