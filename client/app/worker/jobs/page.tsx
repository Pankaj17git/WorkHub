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
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#091426] tracking-tight">
              Job Requests & Inbound Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#0051d5] text-xs font-bold font-geist border border-[#bfdbfe]">
              {requests.filter((r) => r.status === 'PENDING').length} New
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Real-time incoming job offers matched to your skill profile in Chandigarh.
          </p>
        </div>

        {/* Filter Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f1f5f9] rounded-xl border border-[#e2e8f0]">
          {(['ALL', 'PENDING', 'ACCEPTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-geist transition-all ${
                filterTab === tab
                  ? 'bg-[#0051d5] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#091426]'
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
          <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#091426]">No job requests in this tab</h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
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
