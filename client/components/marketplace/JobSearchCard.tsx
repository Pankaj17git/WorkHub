'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Users,
  Briefcase,
  Heart,
  ArrowRight,
  Sparkles,
  Zap,
  Wrench,
  Wind,
  Hammer,
  Paintbrush,
  ShieldCheck,
} from 'lucide-react';
import { MockJobPosting } from '@/data/mockData';

interface JobSearchCardProps {
  job: MockJobPosting;
  viewMode?: 'list' | 'grid';
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Electricians: <Zap className="w-5 h-5 text-[#0051d5]" />,
  Plumbers: <Wrench className="w-5 h-5 text-[#0284c7]" />,
  'AC & Appliance Repair': <Wind className="w-5 h-5 text-[#06b6d4]" />,
  Carpenters: <Hammer className="w-5 h-5 text-[#d97706]" />,
  Painters: <Paintbrush className="w-5 h-5 text-[#8b5cf6]" />,
  'Deep Cleaning': <Sparkles className="w-5 h-5 text-[#10b981]" />,
};

export default function JobSearchCard({
  job,
  viewMode = 'list',
}: JobSearchCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const isUrgent = job.status === 'URGENT';
  const minPrice = job.minBudget || job.minAmount || 500;
  const maxPrice = job.maxBudget || job.maxAmount || 1500;
  const city = job.location || job.address?.city || 'Chandigarh';
  const distance = job.distanceKm || 2.5;
  const workers = job.requiredWorkers || 1;
  const postedTime = job.postedAt || 'Recently';

  if (viewMode === 'grid') {
    return (
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 hover:border-[#0051d5] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative group">
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 border border-[#e2e8f0] text-[#94a3b8] hover:text-[#ef4444] transition-colors"
          title={isFavorite ? 'Remove from saved' : 'Save job'}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-[#ef4444] text-[#ef4444]' : ''
            }`}
          />
        </button>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-geist border ${
                isUrgent
                  ? 'bg-[#fef2f2] text-[#ef4444] border-[#fecaca]'
                  : 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
              }`}
            >
              {isUrgent ? 'URGENT BID' : 'OPEN FOR BIDS'}
            </span>
            <span className="text-[11px] text-[#94a3b8]">{postedTime}</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#091426] group-hover:text-[#0051d5] transition-colors line-clamp-2">
              <Link href={`/jobs/${job.id}`}>{job.title}</Link>
            </h3>
            <p className="text-xs font-semibold text-[#0051d5] mt-0.5">
              {job.category || job.serviceName || 'General Trade'}
            </p>
          </div>

          <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">
            {job.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-[#64748b]">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
              <span className="truncate">{city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#059669]" />
              <span>
                {workers} Worker{workers > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#f1f5f9] space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
              Budget Range
            </span>
            <span className="font-geist font-extrabold text-base text-[#091426]">
              ₹{minPrice} – ₹{maxPrice}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className="py-2 px-3 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors"
            >
              <span>Apply / Bid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/jobs/${job.id}`}
              className="py-2 px-3 bg-white hover:bg-[#f8f9ff] text-[#091426] text-xs font-semibold rounded-xl border border-[#e2e8f0] text-center transition-colors"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // List View (Matches Search Page Card Style)
  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 md:p-6 transition-all duration-200 hover:border-[#0051d5] hover:shadow-md flex flex-col md:flex-row gap-5 items-start justify-between relative group">
      {/* 1. Left Icon / Category Badge Container */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-[#eff6ff] border border-[#dbeafe] flex items-center justify-center">
        {CATEGORY_ICON_MAP[job.category] || (
          <Briefcase className="w-8 h-8 text-[#0051d5]" />
        )}
        <div
          className={`absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold border whitespace-nowrap ${
            isUrgent
              ? 'bg-[#fef2f2] text-[#ef4444] border-[#fecaca]'
              : 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
          }`}
        >
          {isUrgent ? 'Urgent' : 'Open Bid'}
        </div>
      </div>

      {/* 2. Middle Content (Title, Category, Meta, Description, Skills) */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className="text-base sm:text-lg font-bold text-[#091426] hover:text-[#0051d5] transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5] mt-0.5">
            <span>{job.category || job.serviceName || 'General Maintenance'}</span>
            {job.customerName && (
              <>
                <span className="text-[#cbd5e1]">•</span>
                <span className="text-[#64748b]">Posted by {job.customerName}</span>
              </>
            )}
          </div>
        </div>

        {/* Meta Line */}
        <div className="flex items-center gap-3 text-xs text-[#64748b] flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#0051d5]" />
            {postedTime}
          </span>
          <span className="text-[#cbd5e1]">•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#64748b]" />
            {city} ({distance} km away)
          </span>
          <span className="text-[#cbd5e1]">•</span>
          <span className="flex items-center gap-1 text-[#059669] font-medium">
            <Users className="w-3.5 h-3.5" />
            {workers} Worker{workers > 1 ? 's' : ''} Needed
          </span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs sm:text-sm text-[#64748b] line-clamp-2 leading-relaxed pt-0.5">
          {job.description}
        </p>

        {/* Required Skills Chips */}
        {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
            {job.skills.slice(0, 4).map((s: any, idx: number) => {
              const name = typeof s === 'string' ? s : s.name;
              return (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs rounded-lg bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0]"
                >
                  {name}
                </span>
              );
            })}
            {job.skills.length > 4 && (
              <span className="text-xs text-[#0051d5] font-semibold pl-1">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Right Column: Bookmark, Budget & Actions */}
      <div className="w-full md:w-48 shrink-0 flex flex-col justify-between items-start md:items-end self-stretch pt-3 md:pt-0 border-t md:border-t-0 border-[#f1f5f9]">
        {/* Bookmark Heart */}
        <div className="flex items-center justify-between w-full md:justify-end">
          <div className="md:hidden">
            <span className="text-[10px] text-[#94a3b8] block uppercase tracking-wider font-semibold">
              Budget Range
            </span>
            <span className="font-geist font-extrabold text-lg text-[#091426]">
              ₹{minPrice} – ₹{maxPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-1.5 rounded-full text-[#94a3b8] hover:text-[#ef4444] transition-colors"
            title={isFavorite ? 'Remove from saved' : 'Save job'}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-[#ef4444] text-[#ef4444]' : ''
              }`}
            />
          </button>
        </div>

        {/* Desktop Budget */}
        <div className="hidden md:block text-right my-auto">
          <span className="text-[10px] text-[#94a3b8] block uppercase tracking-wider font-semibold">
            Budget Range
          </span>
          <div className="font-geist font-extrabold text-xl text-[#091426]">
            ₹{minPrice} – ₹{maxPrice}
          </div>
          <div className="text-[11px] text-[#059669] font-medium mt-0.5">
            ✓ Escrow Verified
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2 pt-2 md:pt-0">
          <Link
            href={`/jobs/${job.id}`}
            className="w-full py-2.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Apply / Bid Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/jobs/${job.id}`}
            className="w-full py-2 px-4 bg-white hover:bg-[#f8f9ff] text-[#091426] text-xs font-semibold rounded-xl border border-[#e2e8f0] text-center block transition-colors"
          >
            View Job Details
          </Link>
        </div>
      </div>
    </div>
  );
}
