import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Wrench, Clock, MapPin, ArrowRight } from 'lucide-react';

export interface WorkerProfileSummaryCardProps {
  name: string;
  avatarUrl: string;
  isVerified?: boolean;
  rating?: number;
  reviewsCount?: number;
  trade?: string;
  experienceYears?: number | string;
  location?: string;
  profileHref?: string;
  className?: string;
}

export default function WorkerProfileSummaryCard({
  name,
  avatarUrl,
  isVerified = true,
  rating = 4.8,
  reviewsCount = 48,
  trade = 'AC Technician',
  experienceYears = '8 years',
  location = 'Abu Dhabi, UAE',
  profileHref = '/worker/profile',
  className = '',
}: WorkerProfileSummaryCardProps) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all ${className}`}
    >
      {/* Top Gradient Banner with Worker Info */}
      <div className="bg-gradient-to-r from-[#0052d4] via-[#4364f7] to-[#6fb1fc] p-5 text-white relative">
        <div className="flex items-center gap-3.5">
          {/* Avatar with verified ring */}
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white/90 shadow-md"
            />
            {isVerified && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Name & Badges */}
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate leading-tight">
              {name}
            </h3>

            {isVerified && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 backdrop-blur-xs text-white">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Worker</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-white/90 font-semibold mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>
                {rating.toFixed(1)} ({reviewsCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Details & View Profile Link */}
      <div className="p-4 space-y-3 bg-white">
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{trade}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{experienceYears} experience</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{location}</span>
        </div>

        <Link
          href={profileHref}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-[#0062ff] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-100 mt-2"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
