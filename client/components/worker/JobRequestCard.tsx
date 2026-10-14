'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Clock, 
  Check, 
  ArrowRight, 
  AlertCircle,
  Briefcase,
  Zap,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { WorkerJobRequest } from '@/types';
import PriceTag from '@/components/ui/PriceTag';

interface JobRequestCardProps {
  job: WorkerJobRequest;
  viewMode?: 'grid' | 'row';
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export default function JobRequestCard({
  job,
  viewMode = 'grid',
  onAccept,
  onDecline,
}: JobRequestCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(job.expiresInSeconds || 60);

  useEffect(() => {
    if (job.status !== 'PENDING' || job.itemType !== 'DIRECT_HIRE' || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [job.status, job.itemType, secondsLeft]);

  // Determine badge for item type
  const renderItemTypeBadge = () => {
    if (job.itemType === 'DIRECT_HIRE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold font-geist rounded-md bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe]">
          <Zap className="w-3 h-3 text-[#0051d5]" />
          Direct Hire Offer
        </span>
      );
    }
    if (job.itemType === 'APPLICATION') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold font-geist rounded-md bg-[#fdf4ff] text-[#a21caf] border border-[#f5d0fe]">
          <FileText className="w-3 h-3 text-[#a21caf]" />
          Job Application
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold font-geist rounded-md bg-[#ecfdf5] text-[#0d9488] border border-[#a7f3d0]">
        <Briefcase className="w-3 h-3 text-[#0d9488]" />
        Assigned Job {job.role ? `(${job.role})` : ''}
      </span>
    );
  };

  // Determine status badge
  const renderStatusBadge = () => {
    let colorClasses = 'bg-[#eff6ff] text-[#0051d5] border-[#bfdbfe]';
    let label: string = job.status;

    switch (job.status) {
      case 'PENDING':
        colorClasses = 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
        label = job.itemType === 'APPLICATION' ? 'Under Review' : 'Pending Response';
        break;
      case 'ACCEPTED':
      case 'ASSIGNED':
        colorClasses = 'bg-[#ecfdf5] text-[#0d9488] border-[#a7f3d0]';
        label = 'Assigned & Confirmed';
        break;
      case 'ON_THE_WAY':
        colorClasses = 'bg-[#eff6ff] text-[#0051d5] border-[#bfdbfe]';
        label = 'En Route';
        break;
      case 'IN_PROGRESS':
        colorClasses = 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]';
        label = 'In Progress';
        break;
      case 'COMPLETED':
        colorClasses = 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0]';
        label = 'Completed';
        break;
      case 'DECLINED':
        colorClasses = 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';
        label = 'Declined';
        break;
    }

    return (
      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold font-geist rounded-full border ${colorClasses}`}>
        {label}
      </span>
    );
  };

  // RENDER ROW VIEW
  if (viewMode === 'row') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#ffffff] border border-[#e2e8f0] shadow-xs hover:border-[#0051d5] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Avatar, Customer, Badges & Service Info */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={job.customerAvatar}
            alt={job.customerName}
            className="w-12 h-12 rounded-xl object-cover border border-[#e2e8f0] shrink-0"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-[#091426] truncate">{job.customerName}</h4>
              {renderItemTypeBadge()}
              {renderStatusBadge()}
            </div>
            <p className="text-xs font-semibold text-[#334155] mt-0.5 truncate">{job.serviceName}</p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748b] mt-1 font-geist">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0051d5]" />
                <span className="truncate max-w-[200px]">{job.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#0d9488]" />
                <span>{job.date} ({job.timeWindow})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Earnings & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#f1f5f9]">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block font-geist">
              {job.itemType === 'APPLICATION' ? 'Your Proposed Bid' : 'Payout'}
            </span>
            <PriceTag amount={job.earningsAmount} size="md" />
          </div>

          <div className="flex items-center gap-2">
            {job.status === 'PENDING' && job.itemType === 'DIRECT_HIRE' ? (
              <>
                <button
                  onClick={() => onDecline?.(job.id)}
                  className="px-3 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] text-xs font-bold transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => onAccept?.(job.id)}
                  className="px-4 py-2 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Job</span>
                </button>
              </>
            ) : job.itemType === 'APPLICATION' ? (
              <Link
                href={`/jobs/${job.jobId || job.id}`}
                className="px-4 py-2 bg-[#f8f9ff] hover:bg-[#eff6ff] text-[#0051d5] text-xs font-bold rounded-xl border border-[#dbeafe] flex items-center gap-1.5 transition-colors"
              >
                <span>View Job Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href={`/worker/jobs/${job.id}`}
                className="px-4 py-2 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <span>Execution Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

      </div>
    );
  }

  // RENDER GRID VIEW
  return (
    <div className="p-5 rounded-2xl bg-[#ffffff] border border-[#e2e8f0] shadow-xs space-y-4 transition-all hover:border-[#0051d5] hover:shadow-md flex flex-col justify-between">
      
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          {renderItemTypeBadge()}
          {renderStatusBadge()}
        </div>

        {/* Customer Header & Earnings */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={job.customerAvatar}
              alt={job.customerName}
              className="w-12 h-12 rounded-xl object-cover border border-[#e2e8f0] shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#091426] truncate">{job.customerName}</h4>
              <p className="text-xs font-semibold text-[#475569] truncate">{job.serviceName}</p>
              <span className="text-[10px] text-[#64748b] font-geist block">
                Category: {job.serviceCategory}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block font-geist">
              {job.itemType === 'APPLICATION' ? 'Your Bid' : 'Earnings'}
            </span>
            <PriceTag amount={job.earningsAmount} size="md" />
          </div>
        </div>

        {/* Location & Slot details */}
        <div className="space-y-2 p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-xs text-[#334155]">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#0051d5] shrink-0 mt-0.5" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
            <span className="font-geist">{job.date} • {job.timeWindow}</span>
          </div>
        </div>

        {/* Customer note if any */}
        {job.notes && (
          <p className="text-xs text-[#64748b] bg-[#f1f5f9] p-2.5 rounded-lg italic line-clamp-2">
            &ldquo;{job.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Actions & Countdown if Pending */}
      <div className="pt-3 border-t border-[#f1f5f9]">
        {job.status === 'PENDING' && job.itemType === 'DIRECT_HIRE' ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs text-[#b45309] font-geist font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-[#d97706]" />
              <span>Accept within <strong>{secondsLeft}s</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDecline?.(job.id)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] text-xs font-bold transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => onAccept?.(job.id)}
                className="flex-1 px-4 py-2 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept</span>
              </button>
            </div>
          </div>
        ) : job.itemType === 'APPLICATION' ? (
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#64748b]">Marketplace Job</span>
            <Link
              href={`/jobs/${job.jobId || job.id}`}
              className="px-3.5 py-1.5 bg-[#f8f9ff] hover:bg-[#eff6ff] text-[#0051d5] text-xs font-bold rounded-lg border border-[#dbeafe] flex items-center gap-1.5 transition-colors"
            >
              <span>View Job</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0d9488]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{job.status}</span>
            </div>
            <Link
              href={`/worker/jobs/${job.id}`}
              className="px-3.5 py-1.5 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
