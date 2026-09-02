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
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantStyles = {
    verified: 'bg-[#ecfdf5] text-[#0d9488] border border-[#a7f3d0]',
    urgent: 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]',
    accent: 'bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe]',
    online: 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]',
    neutral: 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses} ${variantStyles[variant]} ${className}`}
    >
      {variant === 'verified' && <ShieldCheck className="w-3.5 h-3.5 text-[#0d9488]" />}
      {variant === 'online' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
      )}
      {children}
    </span>
  );
}
