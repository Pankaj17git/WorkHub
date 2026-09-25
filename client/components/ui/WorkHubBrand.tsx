import React from 'react';
import Link from 'next/link';
import WorkHubLogo from '@/components/ui/WorkHubLogo';

export interface WorkHubBrandProps {
  theme?: 'light' | 'dark';
  size?: number;
  showTagline?: boolean;
  tagline?: string;
  href?: string;
  className?: string;
}

export default function WorkHubBrand({
  theme = 'light',
  size = 36,
  showTagline = true,
  tagline = 'Skilled People. Real Work.',
  href = '/',
  className = '',
}: WorkHubBrandProps) {
  const isDark = theme === 'dark';

  const brandContent = (
    <div className={`flex items-center gap-3 group shrink-0 ${className}`}>
      <WorkHubLogo size={size} className="shrink-0 transition-transform group-hover:scale-105" />
      <div className="flex flex-col">
        <span
          className={`text-xl font-extrabold tracking-tight leading-none transition-colors ${
            isDark ? 'text-white group-hover:text-blue-400' : 'text-[#0f172a] group-hover:text-[#0066f5]'
          }`}
        >
          Work<span className="text-[#2563eb]">Hub</span>
        </span>
        {showTagline && (
          <span
            className={`text-[11px] font-medium tracking-wide mt-1 leading-none ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {brandContent}
      </Link>
    );
  }

  return brandContent;
}
