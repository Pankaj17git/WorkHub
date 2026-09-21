import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

export interface WorkerHeroBannerProps {
  workerName?: string;
  workerImage?: string;
  findJobsHref?: string;
  className?: string;
}

export default function WorkerHeroBanner({
  workerName = 'Ahmed',
  workerImage = 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=480&auto=format&fit=crop&q=80',
  findJobsHref = '/jobs',
  className = '',
}: WorkerHeroBannerProps) {
  // Determine time-of-day greeting
  const hour = new Date().getHours();
  const greetingTime =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const firstName = workerName.trim().split(/\s+/)[0] || 'Ahmed';

  const benefits = [
    { label: 'Verified Profile', icon: ShieldCheck },
    { label: 'Trusted by Customers', icon: Users },
    { label: 'Flexible Schedule', icon: Calendar },
    { label: 'Grow Your Business', icon: TrendingUp },
  ];

  return (
    <div
      className={`bg-gradient-to-r from-[#eef5ff] via-[#f1f6ff] to-[#e4eefd] border border-[#d6e6fe] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 relative z-10">
        {/* Left Info Column */}
        <div className="flex-1 space-y-4">
          <div>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-1.5">
              {greetingTime}, {firstName} 👋
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-slate-900 tracking-tight leading-tight mt-1 font-geist">
              New opportunities <br className="hidden sm:inline" />
              are waiting for you
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mt-2 leading-relaxed">
              You&apos;re verified and ready to work. Find new jobs, manage your schedule
              and grow your business with WorkHub.
            </p>
          </div>

          {/* Action CTA Button */}
          <div>
            <Link
              href={findJobsHref}
              className="px-6 py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 inline-flex items-center gap-2 transition-all hover:gap-3"
            >
              <span>Find Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Feature Items Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 pt-2">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{benefit.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Illustration / Worker Column */}
        <div className="relative shrink-0 flex flex-col items-center lg:items-end justify-end w-full lg:w-72 pt-2">
          {/* Cursive Tag */}
          <div className="mb-2 self-center lg:self-end mr-2 select-none pointer-events-none transform -rotate-3">
            <span
              className="text-xs sm:text-sm font-bold text-blue-700 tracking-wide font-serif italic drop-shadow-xs"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              More Jobs, More Opportunities ↗
            </span>
          </div>

          {/* Worker photo frame with subtle soft shadow */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-white/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={workerImage}
              alt="Professional Worker"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
