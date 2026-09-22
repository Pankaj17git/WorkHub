import React from 'react';
import Link from 'next/link';
import { Search, Award, Calendar, Users } from 'lucide-react';

export interface QuickActionItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

interface WorkerQuickActionsProps {
  actions?: QuickActionItem[];
  className?: string;
}

const defaultActions: QuickActionItem[] = [
  {
    label: 'Find Jobs',
    href: '/jobs',
    icon: Search,
    iconBg: 'bg-[#e0edff]',
    iconColor: 'text-[#2563eb]',
  },
  {
    label: 'Update Skills',
    href: '/worker/profile',
    icon: Award,
    iconBg: 'bg-[#ede5fc]',
    iconColor: 'text-[#7c3aed]',
  },
  {
    label: 'Manage Availability',
    href: '/worker/services',
    icon: Calendar,
    iconBg: 'bg-[#e0edff]',
    iconColor: 'text-[#2563eb]',
  },
  {
    label: 'Build Your Team',
    href: '/worker/network',
    icon: Users,
    iconBg: 'bg-[#ede5fc]',
    iconColor: 'text-[#7c3aed]',
  },
];

export default function WorkerQuickActions({
  actions = defaultActions,
  className = '',
}: WorkerQuickActionsProps) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all ${className}`}
    >
      <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              href={action.href}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col items-center text-center group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.iconBg} ${action.iconColor} group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0062ff] mt-2 transition-colors">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
