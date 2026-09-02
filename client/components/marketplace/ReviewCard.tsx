import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Review } from '@/types';
import RatingStars from '../ui/RatingStars';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-[#ffffff] border border-[#e2e8f0] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.avatar}
            alt={review.author}
            className="w-10 h-10 rounded-full object-cover border border-[#e2e8f0]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-[#091426]">{review.author}</h4>
              {review.verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#0d9488] bg-[#f0fdfa] px-1.5 py-0.5 rounded-full border border-[#ccfbf1]">
                  <ShieldCheck className="w-3 h-3 text-[#0d9488]" /> Verified Customer
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748b] font-geist">{review.date}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>

      <div className="text-xs font-medium text-[#0051d5] bg-[#eff6ff] px-2.5 py-1 rounded-md inline-block">
        Service: {review.serviceUsed}
      </div>

      <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
        &ldquo;{review.comment}&rdquo;
      </p>
    </div>
  );
}
