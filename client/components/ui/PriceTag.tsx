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
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-3xl font-extrabold tracking-tight',
  };

  return (
    <div className={`inline-flex items-baseline gap-1 font-geist text-[#0d1c2e] ${className}`}>
      <span className={sizeClasses[size]}>
        {prefix}{amount.toLocaleString('en-IN')}
      </span>
      {unit && (
        <span className="text-xs font-normal text-[#64748b] tracking-normal font-sans">
          {unit}
        </span>
      )}
    </div>
  );
}
