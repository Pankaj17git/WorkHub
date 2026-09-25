'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import WorkerHeroBanner from '@/components/worker/WorkerHeroBanner';
import WorkerJobCard, { WorkerJobCardProps } from '@/components/worker/WorkerJobCard';
import WorkerProfileSummaryCard from '@/components/worker/WorkerProfileSummaryCard';
import WorkerQuickActions from '@/components/worker/WorkerQuickActions';
import WorkerEarningsChart from '@/components/worker/WorkerEarningsChart';
import WorkerUpcomingSchedule from '@/components/worker/WorkerUpcomingSchedule';
import { getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

type TabType = 'recommended' | 'applications' | 'assigned' | 'past';

const recommendedJobs: WorkerJobCardProps[] = [
  {
    id: 'job-rec-1',
    title: 'AC Installation – 2 Workers Required',
    badge: { text: 'High Demand', variant: 'demand' },
    location: 'Abu Dhabi, UAE',
    distanceKm: 12,
    date: '16 Apr 2025',
    timeWindow: '10:00 AM - 2:00 PM',
    tags: ['AC Installation', 'Electrical', 'Team Work'],
    budget: 4500,
    spotsLeft: 2,
    imageUrl: '/images/ac-technician.jpg',
    detailsHref: '/jobs/job-rec-1',
  },
  {
    id: 'job-rec-2',
    title: 'Plumbing Repair – Urgent',
    badge: { text: 'New', variant: 'new' },
    location: 'Dubai, UAE',
    distanceKm: 18,
    date: '16 Apr 2025',
    timeWindow: '1:00 PM - 3:00 PM',
    tags: ['Plumbing', 'Pipe Fitting'],
    budget: 1800,
    spotsLeft: 1,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
    detailsHref: '/jobs/job-rec-2',
  },
  {
    id: 'job-rec-3',
    title: 'House Painting – Interior',
    location: 'Sharjah, UAE',
    distanceKm: 25,
    date: '17 Apr 2025',
    timeWindow: '9:00 AM - 5:00 PM',
    tags: ['Painting', 'Interior Work'],
    budget: 3200,
    spotsLeft: 3,
    imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&auto=format&fit=crop&q=80',
    detailsHref: '/jobs/job-rec-3',
  },
  {
    id: 'job-rec-4',
    title: 'Carpentry – Furniture Repair',
    location: 'Ajman, UAE',
    distanceKm: 30,
    date: '18 Apr 2025',
    timeWindow: '11:00 AM - 4:00 PM',
    tags: ['Carpentry', 'Wood Work'],
    budget: 2500,
    spotsLeft: 1,
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&auto=format&fit=crop&q=80',
    detailsHref: '/jobs/job-rec-4',
  },
];

const applicationsJobs: WorkerJobCardProps[] = [
  {
    id: 'app-1',
    title: 'Commercial HVAC Duct Inspection',
    badge: { text: 'Pending Review', variant: 'info' },
    location: 'Dubai Marina, UAE',
    distanceKm: 8,
    date: '20 Apr 2025',
    timeWindow: '9:00 AM - 1:00 PM',
    tags: ['HVAC', 'Commercial', 'Inspection'],
    budget: 5200,
    spotsLeft: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80',
    detailsHref: '/worker/jobs',
  },
];

const assignedJobs: WorkerJobCardProps[] = [
  {
    id: 'asg-1',
    title: 'Villa Ceiling Fan & Chandelier Fitting',
    badge: { text: 'Confirmed', variant: 'new' },
    location: 'Al Ain, UAE',
    distanceKm: 15,
    date: 'Tomorrow, 19 Apr',
    timeWindow: '10:00 AM - 1:00 PM',
    tags: ['Electrical', 'Lighting', 'Installation'],
    budget: 2800,
    spotsLeft: 0,
    imageUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    detailsHref: '/worker/jobs',
  },
];

const pastJobs: WorkerJobCardProps[] = [
  {
    id: 'past-1',
    title: 'Complete Water Heater & Geyser Repair',
    badge: { text: 'Completed', variant: 'info' },
    location: 'Deira, Dubai',
    distanceKm: 22,
    date: '14 Apr 2025',
    timeWindow: 'Completed',
    tags: ['Plumbing', 'Water Heater', 'Maintenance'],
    budget: 1950,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80',
    detailsHref: '/worker/earnings',
  },
];

export default function WorkerDashboardPage() {
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
  const [activeTab, setActiveTab] = useState<TabType>('recommended');

  const workerName = session?.name || 'Ahmed Khan';
  const workerAvatar =
    session?.profileImage ||
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80';

  const getJobsForActiveTab = () => {
    switch (activeTab) {
      case 'applications':
        return applicationsJobs;
      case 'assigned':
        return assignedJobs;
      case 'past':
        return pastJobs;
      case 'recommended':
      default:
        return recommendedJobs;
    }
  };

  const currentJobs = getJobsForActiveTab();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 1. Top Section: 2-column layout (Left: Hero Banner + Stats + Jobs, Right: Profile + Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: ~68% width (8 columns on lg) */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* A. Welcome Hero Banner */}
          <WorkerHeroBanner
            workerName={workerName}
            workerImage="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=480&auto=format&fit=crop&q=80"
            findJobsHref="/jobs"
          />

          {/* B. KPI Stat Cards Row (4 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              title="Available Jobs"
              value="12"
              trend="↑ 3 new today"
              trendType="positive"
              variant="blue"
              icon={Briefcase}
            />
            <StatCard
              title="Active Jobs"
              value="2"
              trend="↑ 1 in progress"
              trendType="positive"
              variant="green"
              icon={Clock}
            />
            <StatCard
              title="Completed Jobs"
              value="48"
              trend="↑ 5 this month"
              variant="purple"
              icon={CheckCircle2}
            />
            <StatCard
              title="Total Earnings"
              value="₹ 24,800"
              trend="↑ 12% this month"
              trendType="positive"
              variant="amber"
              icon={Wallet}
            />
          </div>

          {/* C. Jobs Section with Tabs and View All Link */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-3 pb-1">
              {/* Tab Navigation */}
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: 'recommended', label: 'Recommended Jobs' },
                    { id: 'applications', label: 'My Applications' },
                    { id: 'assigned', label: 'Assigned Jobs' },
                    { id: 'past', label: 'Past Jobs' },
                  ] as const
                ).map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-colors relative ${
                        isActive
                          ? 'text-[#0062ff]'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View All Link */}
              <Link
                href="/jobs"
                className="text-xs font-bold text-[#0062ff] hover:underline flex items-center gap-1 self-end sm:self-center pb-2"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Job Opportunity Cards List */}
            <div className="space-y-3.5">
              {currentJobs.map((job) => (
                <WorkerJobCard key={job.id} {...job} />
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ~32% width (4 columns on lg) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* A. Worker Profile Summary Card */}
          <WorkerProfileSummaryCard
            name={workerName}
            avatarUrl={workerAvatar}
            isVerified={true}
            rating={4.8}
            reviewsCount={48}
            trade="AC Technician"
            experienceYears="8 years"
            location="Abu Dhabi, UAE"
            profileHref="/worker/profile"
          />

          {/* B. Quick Actions 2x2 Grid */}
          <WorkerQuickActions />

          {/* C. Earnings Overview Card with Bar Chart */}
          <WorkerEarningsChart
            totalAmount="12,450"
            trendPercent="+18%"
            trendLabel="vs last month"
          />

          {/* D. Upcoming Schedule Card */}
          <WorkerUpcomingSchedule viewAllHref="/worker/jobs" />

        </div>

      </div>
    </div>
  );
}
