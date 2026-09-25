import React from 'react';
import Link from 'next/link';
import { Calendar, Wrench, ChevronRight } from 'lucide-react';

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  timeWindow: string;
  location: string;
  iconType?: 'calendar' | 'wrench';
  href?: string;
}

interface WorkerUpcomingScheduleProps {
  events?: ScheduleEvent[];
  viewAllHref?: string;
  className?: string;
}

const defaultEvents: ScheduleEvent[] = [
  {
    id: 'ev-1',
    title: 'AC Installation',
    date: '16 Apr',
    timeWindow: '10:00 AM - 2:00 PM',
    location: 'Abu Dhabi',
    iconType: 'calendar',
    href: '/worker/jobs',
  },
  {
    id: 'ev-2',
    title: 'Plumbing Repair',
    date: '16 Apr',
    timeWindow: '1:00 PM - 3:00 PM',
    location: 'Dubai',
    iconType: 'wrench',
    href: '/worker/jobs',
  },
];

export default function WorkerUpcomingSchedule({
  events = defaultEvents,
  viewAllHref = '/worker/jobs',
  className = '',
}: WorkerUpcomingScheduleProps) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Upcoming Schedule
        </h3>
        <Link
          href={viewAllHref}
          className="text-xs font-semibold text-[#0062ff] hover:underline flex items-center gap-0.5"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map((event) => {
          const isCalendar = event.iconType === 'calendar';
          const Icon = isCalendar ? Calendar : Wrench;
          const iconBg = isCalendar ? 'bg-[#e0edff]' : 'bg-[#ede5fc]';
          const iconColor = isCalendar ? 'text-[#2563eb]' : 'text-[#7c3aed]';

          return (
            <Link
              key={event.id}
              href={event.href || `/worker/jobs`}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0062ff] transition-colors truncate">
                    {event.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {event.date}, {event.timeWindow}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {event.location}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
