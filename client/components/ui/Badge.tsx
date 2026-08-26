import React from 'react';
import { ShieldCheck, Zap, Star } from 'lucide-react';

interface BadgeProps {
  variant?: 'verified' | 'urgent' | 'accent' | 'neutral' | 'online';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export default function Badge({
  variant = 'neutral',
  children,
  className = '',
  size = 'md',
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const variantStyles = {
    verified: 'bg-[rgba(59,130,246,0.1)] text-[#2f68c5] border border-[rgba(59,130,246,0.25)]',
    urgent: 'bg-[rgba(195,107,5,0.1)] text-[#c36b05] border border-[rgba(195,107,5,0.25)]',
    accent: 'bg-[rgba(94,123,58,0.12)] text-[#5E7B3A] border border-[rgba(94,123,58,0.25)]',
    online: 'bg-[rgba(20,147,67,0.1)] text-[#149343] border border-[rgba(20,147,67,0.25)]',
    neutral: 'bg-[#eae4db] text-[#606060] border border-transparent',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses} ${variantStyles[variant]} ${className}`}
    >
      {variant === 'verified' && <ShieldCheck className="w-3.5 h-3.5 text-[#2f68c5]" />}
      {variant === 'online' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#149343] animate-pulse" />
      )}
      {children}
    </span>
  );
}
