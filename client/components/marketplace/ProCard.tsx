import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, Clock, CheckCircle2, Award } from 'lucide-react';
import { Professional } from '@/types';
import RatingStars from '../ui/RatingStars';
import Badge from '../ui/Badge';
import PriceTag from '../ui/PriceTag';

interface ProCardProps {
  pro: Professional;
}

export default function ProCard({ pro }: ProCardProps) {
  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 md:p-6 transition-all duration-200 hover:border-[#0051d5] hover:shadow-xl hover:shadow-[#0051d5]/5 flex flex-col md:flex-row gap-6 items-start justify-between">
      
      {/* Left section: Avatar & Quick Badges */}
      <div className="flex items-start gap-4 shrink-0">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-[#e2e8f0] shadow-sm relative bg-[#f1f5f9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pro.avatar}
              alt={pro.name}
              className="w-full h-full object-cover"
            />
          </div>
          {pro.online && (
            <span
              className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#16a34a] text-white text-[10px] font-bold font-geist shadow-sm border border-white"
              title="Online Now"
            >
              Online
            </span>
          )}
        </div>

        <div className="md:hidden flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-lg font-bold text-[#091426] hover:text-[#0051d5]">
              <Link href={`/pro/${pro.id}`}>{pro.name}</Link>
            </h3>
            {pro.verified && (
              <Badge variant="verified" size="sm">Verified</Badge>
            )}
          </div>
          <p className="text-xs font-medium text-[#475569] mt-0.5">{pro.title}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#64748b]">
            <RatingStars rating={pro.rating} reviewCount={pro.reviewCount} size="sm" />
          </div>
        </div>
      </div>

      {/* Middle section: Details, Skills & Description */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="hidden md:block">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-[#091426] hover:text-[#0051d5] transition-colors">
              <Link href={`/pro/${pro.id}`}>{pro.name}</Link>
            </h3>
            {pro.verified && (
              <Badge variant="verified">Verified Pro</Badge>
            )}
            <Badge variant="accent">{pro.experienceYears}+ Yrs Exp</Badge>
          </div>
          <p className="text-sm font-medium text-[#475569] mt-0.5">{pro.title}</p>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-[#64748b] flex-wrap">
          <RatingStars rating={pro.rating} reviewCount={pro.reviewCount} size="md" />
          <span className="text-[#cbd5e1]">•</span>
          <span className="flex items-center gap-1 font-geist text-[#0d1c2e] font-medium">
            <Award className="w-3.5 h-3.5 text-[#0051d5]" />
            {pro.completedJobs}+ jobs done
          </span>
          <span className="text-[#cbd5e1]">•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#64748b]" />
            {pro.location} ({pro.distanceKm} km away)
          </span>
          <span className="text-[#cbd5e1]">•</span>
          <span className="flex items-center gap-1 text-[#0d9488] font-medium">
            <Clock className="w-3.5 h-3.5" />
            Responds in ~{pro.responseTimeMinutes} mins
          </span>
        </div>

        <p className="text-sm text-[#475569] line-clamp-2 leading-relaxed">
          {pro.about}
        </p>

        {/* Skill Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {pro.skills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0]"
            >
              {skill}
            </span>
          ))}
          {pro.skills.length > 4 && (
            <span className="text-xs text-[#64748b] font-medium pl-1">
              +{pro.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Right section: Pricing & CTAs */}
      <div className="w-full md:w-48 shrink-0 md:border-l md:border-[#e2e8f0] md:pl-6 pt-4 md:pt-0 border-t border-[#f1f5f9] md:border-t-0 flex flex-col justify-between self-stretch">
        <div className="text-left md:text-right">
          <span className="text-xs text-[#64748b] block">Consultation / Visit</span>
          <PriceTag amount={pro.hourlyRate} unit="/ visit" size="lg" />
          <div className="text-[11px] text-[#0d9488] font-medium mt-0.5">
            ✓ Fixed Price Guarantee
          </div>
        </div>

        <div className="mt-4 flex flex-row md:flex-col gap-2.5">
          <Link
            href={`/book/${pro.id}`}
            className="flex-1 text-center py-2.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
          >
            Book Now
          </Link>
          <Link
            href={`/pro/${pro.id}`}
            className="flex-1 text-center py-2.5 px-4 bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#091426] text-sm font-semibold rounded-lg border border-[#e2e8f0] transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>

    </div>
  );
}
