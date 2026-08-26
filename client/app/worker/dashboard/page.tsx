'use client';

import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  CheckCircle2,
  Star,
  TrendingUp,
  ArrowRight,
  Clock,
  MapPin,
  ShieldCheck,
  Inbox,
  AlertCircle
} from 'lucide-react';
import MetricCard from '@/components/worker/MetricCard';
import { MOCK_WORKER_METRICS, MOCK_INCOMING_REQUESTS } from '@/data/mockWorkerData';
import PriceTag from '@/components/ui/PriceTag';

export default function WorkerDashboardPage() {
  const pendingRequests = MOCK_INCOMING_REQUESTS.filter((j) => j.status === 'PENDING');
  const activeJob = MOCK_INCOMING_REQUESTS.find((j) => j.status === 'ACCEPTED') || MOCK_INCOMING_REQUESTS[0];

  return (
    <div className="space-y-8">

      {/* Top Banner Greeting */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#2a2a2a] tracking-tight"
              style={{ fontFamily: 'var(--gesso-font-display)' }}
            >
              Welcome Back, Rahul! 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[rgba(20,147,67,0.12)] text-[#149343] text-xs font-bold">
              Active Partner
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#606060] mt-1">
            You are online and prioritized for nearby electrical jobs in Chandigarh Sector 35.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/worker/jobs"
            className="px-4 py-2.5 bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <Inbox className="w-4 h-4" />
            <span>View Job Requests ({pendingRequests.length})</span>
          </Link>
          <Link
            href="/worker/earnings"
            className="px-4 py-2.5 bg-[#f4eee4] hover:bg-[#eae4db] text-[#2a2a2a] text-xs font-bold rounded-xl transition-colors"
          >
            Wallet Payouts
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Earnings"
          value={`₹${MOCK_WORKER_METRICS.todayEarnings.toLocaleString('en-IN')}`}
          subtitle="4 Completed jobs today"
          icon={DollarSign}
          variant="teal"
          trend="+18% vs yesterday"
        />
        <MetricCard
          title="Overall Rating"
          value={`★ ${MOCK_WORKER_METRICS.rating.toFixed(2)}`}
          subtitle="Based on 184 reviews"
          icon={Star}
          variant="amber"
          trend="Top 5% in Chandigarh"
        />
        <MetricCard
          title="Acceptance Rate"
          value={`${MOCK_WORKER_METRICS.acceptanceRate}%`}
          subtitle="Average response: 45s"
          icon={TrendingUp}
          variant="primary"
          trend="Excellent Tier"
        />
        <MetricCard
          title="Wallet Balance"
          value={`₹${MOCK_WORKER_METRICS.walletBalance.toLocaleString('en-IN')}`}
          subtitle="Ready for bank transfer"
          icon={CheckCircle2}
          variant="neutral"
        />
      </div>

      {/* Main Grid: Active Job Banner + Incoming Requests Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Active Ongoing Job (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#149343] animate-ping" />
                <h3
                  className="text-base font-bold text-[#2a2a2a]"
                  style={{ fontFamily: 'var(--gesso-font-display)' }}
                >
                  Current Active Assignment
                </h3>
              </div>
              <span className="text-xs font-bold text-[#2f68c5] bg-[rgba(59,130,246,0.12)] px-2.5 py-1 rounded-full">
                Status: {activeJob.status}
              </span>
            </div>

            {/* Active Job Card Content */}
            <div className="p-5 rounded-xl bg-[#f4eee4] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeJob.customerAvatar}
                    alt={activeJob.customerName}
                    className="w-12 h-12 rounded-full object-cover border border-black/5"
                  />
                  <div>
                    <h4
                      className="text-base font-bold text-[#2a2a2a]"
                      style={{ fontFamily: 'var(--gesso-font-display)' }}
                    >
                      {activeJob.customerName}
                    </h4>
                    <p className="text-xs text-[#606060]">{activeJob.serviceName}</p>
                    <span className="text-xs text-[#2f68c5] font-medium">
                      Phone: {activeJob.customerPhone}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#606060] block">Payout</span>
                  <PriceTag amount={activeJob.earningsAmount} size="lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#2a2a2a] pt-2 border-t border-black/5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2f68c5]" />
                  <span>{activeJob.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2f68c5]" />
                  <span>Arrival Slot: {activeJob.timeWindow}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-[#c36b05] bg-[rgba(195,107,5,0.12)] px-3 py-1.5 rounded-lg font-semibold">
                  Customer Start PIN: <span className="font-bold text-sm">••••</span>
                </div>

                <Link
                  href={`/worker/jobs/${activeJob.id}`}
                  className="px-5 py-2.5 bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>Open Job Execution Screen</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/worker/services"
              className="p-4 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all group"
            >
              <h4
                className="text-sm font-bold text-[#2a2a2a] group-hover:text-[#875b13]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                Manage Service Rates &rarr;
              </h4>
              <p className="text-xs text-[#606060] mt-1">Update your pricing and custom service offerings</p>
            </Link>

            <Link
              href="/worker/earnings"
              className="p-4 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all group"
            >
              <h4
                className="text-sm font-bold text-[#2a2a2a] group-hover:text-[#875b13]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                Weekly Analytics &rarr;
              </h4>
              <p className="text-xs text-[#606060] mt-1">Review breakdown of completed jobs and tips</p>
            </Link>

            <Link
              href="/worker/profile"
              className="p-4 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all group"
            >
              <h4
                className="text-sm font-bold text-[#2a2a2a] group-hover:text-[#875b13]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                KYC & Certifications &rarr;
              </h4>
              <p className="text-xs text-[#606060] mt-1">Manage verified documents and profile bio</p>
            </Link>
          </div>
        </div>

        {/* Right Column: Incoming Queue Preview (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#2a2a2a] uppercase tracking-wider">
                Incoming Requests ({pendingRequests.length})
              </h3>
              <Link href="/worker/jobs" className="text-xs text-[#875b13] font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#f4eee4] space-y-2 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2a2a2a]">{req.customerName}</span>
                    <span className="text-xs font-bold text-[#149343]">₹{req.earningsAmount}</span>
                  </div>
                  <p className="text-xs text-[#606060]">{req.serviceName}</p>
                  <div className="text-[11px] text-[#606060] flex items-center justify-between pt-1">
                    <span>{req.distanceKm} km away</span>
                    <span className="text-[#c36b05] font-semibold">
                      {req.timeWindow}
                    </span>
                  </div>
                  <Link
                    href={`/worker/jobs`}
                    className="block w-full text-center py-1.5 bg-[#f5a623] hover:brightness-95 text-black text-[11px] font-bold rounded-lg mt-2"
                  >
                    Review Request
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
