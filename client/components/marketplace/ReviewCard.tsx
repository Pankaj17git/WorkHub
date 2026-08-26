import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Review } from '@/types';
import RatingStars from '../ui/RatingStars';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="p-5 rounded-xl bg-[#f4eee4] border border-transparent space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.avatar}
            alt={review.author}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#eae4db] bg-[#eae4db]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm whl-display font-bold text-[#2a2a2a]">{review.author}</h4>
              {review.verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#2f68c5] bg-[rgba(59,130,246,0.1)] px-1.5 py-0.5 rounded-full border border-[rgba(59,130,246,0.25)]">
                  <ShieldCheck className="w-3 h-3 text-[#2f68c5]" /> Verified Customer
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#606060]">{review.date}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>

      <div className="text-xs font-bold text-[#2f68c5] bg-[rgba(59,130,246,0.1)] px-2.5 py-1 rounded-full inline-block">
        Service: {review.serviceUsed}
      </div>

      <p className="text-xs sm:text-sm text-[#4d4d4d] leading-relaxed">
        &ldquo;{review.comment}&rdquo;
      </p>
    </div>
  );
}
