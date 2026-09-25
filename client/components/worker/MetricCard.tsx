import React from 'react';
import StatCard, { StatCardVariant } from '@/components/ui/StatCard';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'primary' | 'teal' | 'amber' | 'neutral' | 'blue' | 'green' | 'purple';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'neutral',
}: MetricCardProps) {
  // Map legacy variants to new StatCard variants
  const mappedVariant: StatCardVariant =
    variant === 'primary'
      ? 'blue'
      : variant === 'teal'
      ? 'green'
      : variant === 'amber'
      ? 'amber'
      : variant === 'purple'
      ? 'purple'
      : variant === 'green'
      ? 'green'
      : variant === 'blue'
      ? 'blue'
      : 'neutral';

  return (
    <StatCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={icon}
      trend={trend}
      variant={mappedVariant}
    />
  );
}
