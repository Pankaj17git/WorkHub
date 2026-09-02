import React from 'react';
import { CheckCircle2, Clock, Truck, PlayCircle, CheckCheck } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  state: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
}

interface StatusTimelineProps {
  currentStatus: 'CONFIRMED' | 'PRO_ASSIGNED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const steps: Step[] = [
    {
      id: 'CONFIRMED',
      title: 'Booking Received & Confirmed',
      subtitle: 'Your service request has been logged.',
      timestamp: '10:02 AM',
      state: 'COMPLETED',
    },
    {
      id: 'PRO_ASSIGNED',
      title: 'Pro Assigned & Slot Reserved',
      subtitle: 'Rahul Sharma accepted the assignment.',
      timestamp: '10:05 AM',
      state: currentStatus === 'CONFIRMED' ? 'UPCOMING' : 'COMPLETED',
    },
    {
      id: 'ON_THE_WAY',
      title: 'Professional is On The Way',
      subtitle: 'Navigating towards Sector 35-C.',
      timestamp: '10:20 AM',
      state:
        currentStatus === 'ON_THE_WAY'
          ? 'ACTIVE'
          : ['IN_PROGRESS', 'COMPLETED'].includes(currentStatus)
          ? 'COMPLETED'
          : 'UPCOMING',
    },
    {
      id: 'IN_PROGRESS',
      title: 'Service in Progress',
      subtitle: 'Diagnostics & wiring repair initiated.',
      timestamp: '10:45 AM',
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
      subtitle: 'Final safety testing done.',
      timestamp: 'Pending',
      state: currentStatus === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
    },
  ];

  const getIcon = (state: Step['state'], id: string) => {
    if (state === 'COMPLETED') {
      return <CheckCircle2 className="w-5 h-5 text-white" />;
    }
    if (state === 'ACTIVE') {
      if (id === 'ON_THE_WAY') return <Truck className="w-4 h-4 text-white animate-pulse" />;
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
            <div className="flex-1 bg-[#ffffff] border border-[#e2e8f0] p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <h4
                  className={`text-sm font-bold ${
                    isActive ? 'text-[#0051d5]' : isDone ? 'text-[#091426]' : 'text-[#64748b]'
                  }`}
                >
                  {step.title}
                </h4>
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
