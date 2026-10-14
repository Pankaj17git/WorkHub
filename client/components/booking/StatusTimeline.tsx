'use client';

import React from 'react';
import { CheckCircle2, Clock, Truck, PlayCircle, MapPin } from 'lucide-react';
import { BookingTimelineStatus } from '@/types';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  state: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
}

interface StatusTimelineProps {
  currentStatus: BookingTimelineStatus | string;
  workerName?: string;
  serviceName?: string;
  location?: string;
  confirmedAt?: string | null;
  onTheWayAt?: string | null;
  arrivedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

function formatTimestamp(isoString?: string | null, fallback = 'Pending'): string {
  if (!isoString) return fallback;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return fallback;
  }
}

export default function StatusTimeline({
  currentStatus,
  workerName = 'Specialist',
  serviceName = 'Service',
  location = 'your location',
  confirmedAt,
  onTheWayAt,
  arrivedAt,
  startedAt,
  completedAt,
}: StatusTimelineProps) {
  const steps: Step[] = [
    {
      id: 'CONFIRMED',
      title: 'Specialist Assigned & Confirmed',
      subtitle: `${workerName} confirmed and locked in the schedule.`,
      timestamp: formatTimestamp(confirmedAt, currentStatus === 'ASSIGNED' ? 'Assigned' : 'Confirmed'),
      state: currentStatus === 'ASSIGNED' ? 'ACTIVE' : 'COMPLETED',
    },
    {
      id: 'ON_THE_WAY',
      title: 'Specialist is On The Way',
      subtitle: `${workerName} is en route towards ${location}.`,
      timestamp: formatTimestamp(
        onTheWayAt,
        ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(currentStatus)
          ? 'En Route'
          : 'Pending'
      ),
      state:
        currentStatus === 'ON_THE_WAY'
          ? 'ACTIVE'
          : ['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(currentStatus)
          ? 'COMPLETED'
          : 'UPCOMING',
    },
    {
      id: 'ARRIVED',
      title: 'Arrived at Doorstep',
      subtitle: `${workerName} reached your location. Share the Doorstep PIN.`,
      timestamp: formatTimestamp(
        arrivedAt,
        ['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(currentStatus)
          ? 'Arrived'
          : 'Pending'
      ),
      state:
        currentStatus === 'ARRIVED'
          ? 'ACTIVE'
          : ['IN_PROGRESS', 'COMPLETED'].includes(currentStatus)
          ? 'COMPLETED'
          : 'UPCOMING',
    },
    {
      id: 'IN_PROGRESS',
      title: 'Service in Progress',
      subtitle: `PIN verified. ${serviceName} is actively underway.`,
      timestamp: formatTimestamp(
        startedAt,
        ['IN_PROGRESS', 'COMPLETED'].includes(currentStatus) ? 'Started' : 'Pending'
      ),
      state:
        currentStatus === 'IN_PROGRESS'
          ? 'ACTIVE'
          : currentStatus === 'COMPLETED'
          ? 'COMPLETED'
          : 'UPCOMING',
    },
    {
      id: 'COMPLETED',
      title: 'Job Completed & Verified',
      subtitle: `Service successfully finished by ${workerName}. Quality verified.`,
      timestamp: formatTimestamp(
        completedAt,
        currentStatus === 'COMPLETED' ? 'Completed' : 'Pending'
      ),
      state: currentStatus === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
    },
  ];

  const getIcon = (state: Step['state'], id: string) => {
    if (state === 'COMPLETED') {
      return <CheckCircle2 className="w-5 h-5 text-white" />;
    }
    if (state === 'ACTIVE') {
      if (id === 'CONFIRMED') return <Clock className="w-4 h-4 text-white" />;
      if (id === 'ON_THE_WAY') return <Truck className="w-4 h-4 text-white animate-pulse" />;
      if (id === 'ARRIVED') return <MapPin className="w-4 h-4 text-white animate-bounce" />;
      if (id === 'IN_PROGRESS') return <PlayCircle className="w-4 h-4 text-white animate-spin" />;
      return <Clock className="w-4 h-4 text-white" />;
    }
    return <span className="w-2 h-2 rounded-full bg-[#94a3b8]" />;
  };

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e2e8f0]">
      {steps.map((step) => {
        const isDone = step.state === 'COMPLETED';
        const isActive = step.state === 'ACTIVE';

        return (
          <div key={step.id} className="relative flex items-start gap-4">
            
            {/* Step marker bubble */}
            <div
              className={`absolute -left-[30px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                isDone
                  ? 'bg-[#0d9488] border-[#0d9488] shadow-sm'
                  : isActive
                  ? 'bg-[#0051d5] border-[#0051d5] ring-4 ring-[#0051d5]/20 shadow-md'
                  : 'bg-[#ffffff] border-[#cbd5e1]'
              }`}
            >
              {getIcon(step.state, step.id)}
            </div>

            {/* Step details */}
            <div
              className={`flex-1 p-4 rounded-xl transition-all border ${
                isActive
                  ? 'bg-[#f8f9ff] border-[#0051d5] shadow-xs'
                  : isDone
                  ? 'bg-[#ffffff] border-[#e2e8f0]'
                  : 'bg-[#fafafa] border-[#e2e8f0] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm font-bold ${
                      isActive ? 'text-[#0051d5]' : isDone ? 'text-[#091426]' : 'text-[#64748b]'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {isActive && (
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase font-geist bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe] rounded-full">
                      Live
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-geist text-[#94a3b8]">{step.timestamp}</span>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">{step.subtitle}</p>
            </div>

          </div>
        );
      })}
    </div>
  );
}
