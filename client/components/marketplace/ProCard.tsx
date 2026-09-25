'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Calendar,
  Heart,
  Check,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Professional } from '@/types';

interface ProCardProps {
  pro: Professional;
  viewMode?: 'list' | 'grid';
}

export default function ProCard({ pro, viewMode = 'list' }: ProCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (viewMode === 'grid') {
    return (
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 hover:border-[#0051d5] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group relative">
        {/* Top Favorite */}
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs border border-[#e2e8f0] text-[#94a3b8] hover:text-[#ef4444] transition-colors"
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-[#ef4444] text-[#ef4444]' : ''
            }`}
          />
        </button>

        {/* Worker Header / Avatar */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#f1f5f9] border border-[#e2e8f0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pro.avatar}
              alt={pro.name}
              className="w-full h-full object-cover"
            />
            {pro.verified && (
              <span className="absolute bottom-0 inset-x-0 bg-[#059669] text-white text-[8px] font-bold text-center py-0.5">
                Verified
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Link
                href={`/pro/${pro.id}`}
                className="font-bold text-sm text-[#091426] hover:text-[#0051d5] truncate"
              >
                {pro.name}
              </Link>
              {pro.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0051d5] fill-[#0051d5] text-white shrink-0" />
              )}
            </div>
            <p className="text-xs text-[#475569] font-medium truncate mt-0.5">
              {pro.title}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#64748b] mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-bold text-[#091426]">{pro.rating}</span>
              <span className="text-[#94a3b8]">({pro.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Meta Line */}
        <div className="text-xs text-[#64748b] space-y-1">
          <div className="flex items-center gap-1 truncate">
            <Award className="w-3.5 h-3.5 text-[#0051d5] shrink-0" />
            <span>{pro.experienceYears}+ yrs exp</span>
            <span className="text-[#cbd5e1]">•</span>
            <MapPin className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
            <span className="truncate">{pro.location}</span>
          </div>
          <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed pt-1">
            {pro.about}
          </p>
        </div>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {pro.skills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[11px] rounded-md bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0]"
            >
              {skill}
            </span>
          ))}
          {pro.skills.length > 3 && (
            <span className="text-[11px] text-[#0051d5] font-semibold self-center">
              +{pro.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-[#f1f5f9] space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-geist font-extrabold text-base text-[#091426]">
                ₹{pro.hourlyRate}
              </span>
              <span className="text-xs text-[#64748b]"> / visit</span>
            </div>
            <span className="text-[10px] text-[#059669] font-semibold flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Fixed price
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/book/${pro.id}`}
              className="py-2 px-3 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book</span>
            </Link>
            <Link
              href={`/pro/${pro.id}`}
              className="py-2 px-3 bg-white hover:bg-[#f8f9ff] text-[#091426] text-xs font-semibold rounded-xl border border-[#e2e8f0] text-center transition-colors"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // List View (Matches Reference Screenshot)
  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 md:p-6 transition-all duration-200 hover:border-[#0051d5] hover:shadow-md flex flex-col md:flex-row gap-5 items-start justify-between relative group">
      {/* 1. Left Avatar with Verified Pill */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-[#f1f5f9] border border-[#e2e8f0] shadow-2xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pro.avatar}
          alt={pro.name}
          className="w-full h-full object-cover"
        />
        {pro.verified && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-[#059669] text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm whitespace-nowrap">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* 2. Middle Content (Name, Spec, Rating, Location, Bio, Skills) */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Name & Title */}
        <div>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/pro/${pro.id}`}
              className="text-base sm:text-lg font-bold text-[#091426] hover:text-[#0051d5] transition-colors"
            >
              {pro.name}
            </Link>
            {pro.verified && (
              <span title="Verified Professional">
                <CheckCircle2 className="w-4 h-4 text-[#0051d5] fill-[#0051d5] text-white shrink-0" />
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#475569] mt-0.5">
            {pro.title}
          </p>
        </div>

        {/* Rating Line */}
        <div className="flex items-center gap-1.5 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <span className="font-bold text-[#091426]">{pro.rating}</span>
          <span className="text-[#64748b]">({pro.reviewCount} reviews)</span>
        </div>

        {/* Experience & Location with Distance */}
        <div className="flex items-center gap-2 text-xs text-[#64748b] flex-wrap">
          <span className="flex items-center gap-1 font-medium text-[#091426]">
            <Award className="w-3.5 h-3.5 text-[#0051d5]" />
            {pro.experienceYears}+ yrs exp
          </span>
          <span className="text-[#cbd5e1]">•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#64748b]" />
            {pro.location} ({pro.distanceKm} km away)
          </span>
        </div>

        {/* Description Bio Snippet */}
        <p className="text-xs sm:text-sm text-[#64748b] line-clamp-2 leading-relaxed pt-0.5">
          {pro.about}
        </p>

        {/* Skills Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
          {pro.skills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0]"
            >
              {skill}
            </span>
          ))}
          {pro.skills.length > 4 && (
            <span className="text-xs text-[#0051d5] font-semibold pl-1">
              +{pro.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* 3. Right Column: Bookmark Heart, Pricing & Actions */}
      <div className="w-full md:w-48 shrink-0 flex flex-col justify-between items-start md:items-end self-stretch pt-3 md:pt-0 border-t md:border-t-0 border-[#f1f5f9]">
        {/* Bookmark Heart */}
        <div className="flex items-center justify-between w-full md:justify-end">
          <div className="md:hidden">
            <div className="font-geist font-extrabold text-lg text-[#091426]">
              ₹{pro.hourlyRate}{' '}
              <span className="text-xs font-normal text-[#64748b]">/ visit</span>
            </div>
            <div className="text-[11px] text-[#059669] font-medium flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[2.5]" /> Fixed price guarantee
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-1.5 rounded-full text-[#94a3b8] hover:text-[#ef4444] transition-colors"
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-[#ef4444] text-[#ef4444]' : ''
              }`}
            />
          </button>
        </div>

        {/* Desktop Pricing */}
        <div className="hidden md:block text-right my-auto">
          <div className="font-geist font-extrabold text-xl text-[#091426]">
            ₹{pro.hourlyRate}{' '}
            <span className="text-xs font-normal text-[#64748b]">/ visit</span>
          </div>
          <div className="text-[11px] text-[#059669] font-medium flex items-center justify-end gap-1 mt-0.5">
            <Check className="w-3 h-3 stroke-[2.5]" /> Fixed price guarantee
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2 pt-2 md:pt-0">
          <Link
            href={`/book/${pro.id}`}
            className="w-full py-2.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </Link>
          <Link
            href={`/pro/${pro.id}`}
            className="w-full py-2 px-4 bg-white hover:bg-[#f8f9ff] text-[#091426] text-xs font-semibold rounded-xl border border-[#e2e8f0] text-center block transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
