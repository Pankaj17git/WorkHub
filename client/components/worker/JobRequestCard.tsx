'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Clock, 
  Check, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Phone
} from 'lucide-react';
import { WorkerJobRequest } from '@/types';
import PriceTag from '@/components/ui/PriceTag';

interface JobRequestCardProps {
  job: WorkerJobRequest;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export default function JobRequestCard({
  job,
  onAccept,
  onDecline,
}: JobRequestCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(job.expiresInSeconds || 60);

  useEffect(() => {
    if (job.status !== 'PENDING' || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [job.status, secondsLeft]);

  return (
    <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#e2e8f0] shadow-sm space-y-4 transition-all hover:border-[#0051d5]">
      
      {/* Top Header: Customer info & Payout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={job.customerAvatar}
            alt={job.customerName}
            className="w-12 h-12 rounded-full object-cover border border-[#e2e8f0]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-[#091426]">{job.customerName}</h4>
              <span className="px-2 py-0.5 text-[10px] font-bold font-geist rounded-full bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe]">
                {job.serviceCategory}
              </span>
            </div>
            <p className="text-xs text-[#475569] font-medium">{job.serviceName}</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-[#64748b] block">Your Earnings</span>
          <PriceTag amount={job.earningsAmount} size="lg" />
        </div>
      </div>

      {/* Location & Slot details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-xs text-[#334155]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#0051d5] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#091426] block">{job.location}</strong>
            <span className="text-[#64748b] font-geist">({job.distanceKm} km away from your location)</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-[#0051d5] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#091426] block">{job.date}</strong>
            <span className="text-[#64748b] font-geist">{job.timeWindow}</span>
          </div>
        </div>
      </div>

      {/* Customer note if any */}
      {job.notes && (
        <p className="text-xs text-[#64748b] bg-[#f1f5f9] p-2.5 rounded-lg italic">
          &ldquo;{job.notes}&rdquo;
        </p>
      )}

      {/* Actions & Countdown if Pending */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#f1f5f9]">
        {job.status === 'PENDING' ? (
          <>
            <div className="flex items-center gap-1.5 text-xs text-[#b45309] font-geist font-semibold">
              <AlertCircle className="w-4 h-4 text-[#d97706]" />
              <span>Accept within <strong>{secondsLeft}s</strong> before reassignment</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDecline?.(job.id)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] text-xs font-bold transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => onAccept?.(job.id)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Accept Job</span>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold font-geist text-[#0d9488] bg-[#ecfdf5] px-3 py-1 rounded-full border border-[#a7f3d0]">
              ✓ {job.status}
            </span>
            <Link
              href={`/worker/jobs/${job.id}`}
              className="px-4 py-2 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Open Job Execution</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
