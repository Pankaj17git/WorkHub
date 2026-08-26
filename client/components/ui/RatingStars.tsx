import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export default function RatingStars({
  rating,
  reviewCount,
  size = 'md',
  showNumber = true,
}: RatingStarsProps) {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center text-[#875b13]">
        <Star className={`${iconSizes[size]} fill-[#875b13] text-[#875b13]`} />
      </div>
      {showNumber && (
        <span className={`font-bold text-[#2a2a2a] ${textSizes[size]}`}>
          {rating.toFixed(2)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`text-[#606060] ${textSizes[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
