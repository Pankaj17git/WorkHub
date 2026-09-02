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
    <div className="inline-flex items-center gap-1.5 font-geist">
      <div className="flex items-center text-amber-500">
        <Star className={`${iconSizes[size]} fill-amber-400 text-amber-400`} />
      </div>
      {showNumber && (
        <span className={`font-semibold text-[#0d1c2e] ${textSizes[size]}`}>
          {rating.toFixed(2)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`text-[#64748b] ${textSizes[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
