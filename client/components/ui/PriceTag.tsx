import React from 'react';

interface PriceTagProps {
  amount: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  prefix?: string;
}

export default function PriceTag({
  amount,
  unit,
  size = 'md',
  className = '',
  prefix = '₹',
}: PriceTagProps) {
  const sizeClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-bold',
    lg: 'text-xl font-extrabold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight',
  };

  return (
    <div className={`inline-flex items-baseline gap-1 whl-display text-[#2a2a2a] ${className}`}>
      <span className={sizeClasses[size]}>
        {prefix}{amount.toLocaleString('en-IN')}
      </span>
      {unit && (
        <span className="text-xs font-medium text-[#606060]">
          {unit}
        </span>
      )}
    </div>
  );
}
