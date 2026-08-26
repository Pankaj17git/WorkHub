import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'primary' | 'teal' | 'amber' | 'neutral';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'neutral',
}: MetricCardProps) {
  const iconVariants = {
    primary: 'bg-[rgba(59,130,246,0.12)] text-[#2f68c5] border-transparent',
    teal: 'bg-[rgba(20,147,67,0.12)] text-[#149343] border-transparent',
    amber: 'bg-[rgba(245,166,35,0.12)] text-[#875b13] border-transparent',
    neutral: 'bg-[#eae4db] text-[#606060] border-transparent',
  };

  return (
    <div className="p-5 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#606060]">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-lg border flex items-center justify-center ${iconVariants[variant]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-0.5">
        <div
          className="text-2xl sm:text-3xl font-black text-[#2a2a2a] tracking-tight"
          style={{ fontFamily: 'var(--gesso-font-display)', fontWeight: 900 }}
        >
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-[#606060] font-medium">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-black/5 text-[11px] font-semibold text-[#149343] flex items-center gap-1">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
