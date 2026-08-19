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
    primary: 'bg-[#eff6ff] text-[#0051d5] border-[#dbeafe]',
    teal: 'bg-[#ecfdf5] text-[#0d9488] border-[#ccfbf1]',
    amber: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
    neutral: 'bg-[#f1f5f9] text-[#334155] border-[#e2e8f0]',
  };

  return (
    <div className="p-5 rounded-2xl bg-[#ffffff] border border-[#e2e8f0] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] font-geist">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${iconVariants[variant]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-0.5">
        <div className="text-2xl sm:text-3xl font-extrabold font-geist text-[#091426] tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-[#64748b] font-medium">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-[#f1f5f9] text-[11px] font-semibold text-[#0d9488] flex items-center gap-1 font-geist">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
