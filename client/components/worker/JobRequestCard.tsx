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
    <div className="p-6 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4 transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">

      {/* Top Header: Customer info & Payout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={job.customerAvatar}
            alt={job.customerName}
            className="w-12 h-12 rounded-full object-cover border border-black/5"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4
                className="text-base font-bold text-[#2a2a2a]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                {job.customerName}
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[rgba(59,130,246,0.12)] text-[#2f68c5]">
                {job.serviceCategory}
              </span>
            </div>
            <p className="text-xs text-[#606060] font-medium">{job.serviceName}</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-[#606060] block">Your Earnings</span>
          <PriceTag amount={job.earningsAmount} size="lg" />
        </div>
      </div>

      {/* Location & Slot details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#f4eee4] text-xs text-[#2a2a2a]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#2f68c5] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#2a2a2a] block">{job.location}</strong>
            <span className="text-[#606060]">({job.distanceKm} km away from your location)</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-[#2f68c5] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#2a2a2a] block">{job.date}</strong>
            <span className="text-[#606060]">{job.timeWindow}</span>
          </div>
        </div>
      </div>

      {/* Customer note if any */}
      {job.notes && (
        <p className="text-xs text-[#606060] bg-[#f4eee4] p-2.5 rounded-lg italic">
          &ldquo;{job.notes}&rdquo;
        </p>
      )}

      {/* Actions & Countdown if Pending */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-black/5">
        {job.status === 'PENDING' ? (
          <>
            <div className="flex items-center gap-1.5 text-xs text-[#c36b05] font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>Accept within <strong>{secondsLeft}s</strong> before reassignment</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDecline?.(job.id)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#f4eee4] hover:bg-[#eae4db] text-[#606060] hover:text-[#2a2a2a] text-xs font-bold transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => onAccept?.(job.id)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Accept Job</span>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold text-[#149343] bg-[rgba(20,147,67,0.12)] px-3 py-1 rounded-full">
              ✓ {job.status}
            </span>
            <Link
              href={`/worker/jobs/${job.id}`}
              className="px-4 py-2 bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold rounded-xl flex items-center gap-1.5"
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
