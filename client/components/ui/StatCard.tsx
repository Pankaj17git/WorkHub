import React from 'react';
import { LucideIcon } from 'lucide-react';

export type StatCardVariant = 'blue' | 'green' | 'purple' | 'amber' | 'neutral';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'neutral' | 'accent';
  variant?: StatCardVariant;
  className?: string;
}

const variantStyles: Record<
  StatCardVariant,
  { cardBg: string; border: string; iconBg: string; iconColor: string; trendColor: string }
> = {
  blue: {
    cardBg: 'bg-[#f4f8ff]',
    border: 'border-[#e2ecfb]',
    iconBg: 'bg-[#e0edff]',
    iconColor: 'text-[#2563eb]',
    trendColor: 'text-[#16a34a]',
  },
  green: {
    cardBg: 'bg-[#f2faf5]',
    border: 'border-[#dcf4e5]',
    iconBg: 'bg-[#ddf7e7]',
    iconColor: 'text-[#16a34a]',
    trendColor: 'text-[#16a34a]',
  },
  purple: {
    cardBg: 'bg-[#f8f5ff]',
    border: 'border-[#ede5fc]',
    iconBg: 'bg-[#ede5fc]',
    iconColor: 'text-[#7c3aed]',
    trendColor: 'text-[#7c3aed]',
  },
  amber: {
    cardBg: 'bg-[#fdfbf3]',
    border: 'border-[#faedd3]',
    iconBg: 'bg-[#fef3c7]',
    iconColor: 'text-[#d97706]',
    trendColor: 'text-[#16a34a]',
  },
  neutral: {
    cardBg: 'bg-white',
    border: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    trendColor: 'text-slate-600',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType,
  variant = 'neutral',
  className = '',
}: StatCardProps) {
  const styles = variantStyles[variant] || variantStyles.neutral;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${styles.cardBg} ${styles.border} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.iconBg} ${styles.iconColor} shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <span className="text-xs font-medium text-slate-500 block leading-tight">
          {title}
        </span>
        <div className="text-2xl lg:text-[26px] font-black text-slate-900 tracking-tight mt-1 font-geist">
          {value}
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                trendType === 'positive'
                  ? 'text-emerald-600'
                  : styles.trendColor
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-400 text-[11px] font-normal">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
