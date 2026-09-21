import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Heart, ArrowRight } from 'lucide-react';

export interface WorkerJobCardProps {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  distanceKm?: number | string;
  date: string;
  timeWindow: string;
  tags: string[];
  budget: number | string;
  budgetLabel?: string;
  spotsLeft?: number;
  badge?: {
    text: string;
    variant?: 'demand' | 'new' | 'info';
  };
  detailsHref?: string;
  onApply?: () => void;
  className?: string;
}

export default function WorkerJobCard({
  id,
  title,
  imageUrl,
  location,
  distanceKm,
  date,
  timeWindow,
  tags,
  budget,
  budgetLabel = '(Total Budget)',
  spotsLeft,
  badge,
  detailsHref,
  className = '',
}: WorkerJobCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const href = detailsHref || `/jobs/${id}`;

  const formattedBudget =
    typeof budget === 'number'
      ? `₹ ${budget.toLocaleString('en-IN')}`
      : budget.startsWith('₹')
      ? budget
      : `₹ ${budget}`;

  const badgeStyles =
    badge?.variant === 'demand'
      ? 'bg-amber-100 text-amber-900 border-amber-200'
      : badge?.variant === 'new'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
      : 'bg-blue-100 text-blue-900 border-blue-200';

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative group ${className}`}
    >
      {/* Left side: Thumbnail + Info */}
      <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
        {/* Job Thumbnail */}
        <div className="w-full sm:w-28 sm:h-24 h-40 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Badge */}
          {badge && (
            <div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${badgeStyles}`}
              >
                {badge.text}
              </span>
            </div>
          )}

          {/* Title */}
          <Link href={href} className="block">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#0062ff] transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Location & Time info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {location}
                {distanceKm ? ` • ${distanceKm} km away` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {date} • {timeWindow}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Budget + CTA button */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0 sm:min-w-[150px] sm:pr-8">
        {/* Heart bookmark button */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className="hidden sm:block absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors"
          aria-label="Save job"
        >
          <Heart
            className={`w-4 h-4 ${
              isSaved ? 'fill-red-500 text-red-500' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Pricing */}
        <div className="text-left sm:text-right">
          <div className="text-xl font-extrabold text-slate-900 font-geist">
            {formattedBudget}
          </div>
          <span className="text-[10px] text-slate-400 block font-normal">
            {budgetLabel}
          </span>
        </div>

        {/* View Details Button & spots */}
        <div className="flex flex-col items-end gap-1 mt-2">
          <Link
            href={href}
            className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs font-bold shadow-xs hover:shadow-sm inline-flex items-center gap-1.5 transition-all"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {spotsLeft !== undefined && (
            <span className="text-[11px] font-medium text-slate-500">
              {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
