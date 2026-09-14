'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  DollarSign,
  UserCheck,
  Navigation,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { getToken, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

interface MyJob {
  id: string;
  title: string;
  serviceName?: string | null;
  status: string;
  minAmount?: string | number | null;
  maxAmount?: string | number | null;
  createdAt: string;
  preferredDate?: string;
  requiredWorkers?: number;
  address?: {
    city?: string;
  } | null;
}

interface DirectHireReq {
  id: string;
  workerId: string;
  serviceName: string;
  status: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  proposedPrice?: string | null;
  customerMessage?: string | null;
  createdAt: string;
  worker?: {
    id: string;
    headline?: string;
    user?: {
      name?: string;
      profileImage?: string;
      email?: string;
    };
  };
  address?: {
    city?: string;
    address?: string;
  } | null;
}

export default function MyJobsAndBookingsPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [activeTab, setActiveTab] = useState<'POSTED_JOBS' | 'DIRECT_HIRES'>('POSTED_JOBS');
  const [jobs, setJobs] = useState<MyJob[]>([]);
  const [directHires, setDirectHires] = useState<DirectHireReq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login?role=CUSTOMER&redirect=/jobs/my-jobs');
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        // 1. Load my posted jobs
        const jobsRes = await fetch('/api/jobs?mine=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs || jobsData.data?.jobs || []);
        }

        // 2. Load my direct hire requests
        const hiresRes = await fetch('/api/direct-hire-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (hiresRes.ok) {
          const hiresData = await hiresRes.json();
          setDirectHires(hiresData.requests || hiresData.data?.requests || []);
        }
      } catch (err) {
        console.error('Failed to load user jobs/bookings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
              My Job Postings & Direct Bookings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#0051d5] text-xs font-bold font-geist border border-[#bfdbfe]">
              Customer Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Monitor incoming bids on posted jobs and track direct hire confirmations with specialists.
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="px-5 py-3 rounded-2xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Another Job</span>
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] w-fit">
        <button
          onClick={() => setActiveTab('POSTED_JOBS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-geist transition-all flex items-center gap-2 ${
            activeTab === 'POSTED_JOBS'
              ? 'bg-[#0051d5] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#091426]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>My Posted Jobs ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DIRECT_HIRES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-geist transition-all flex items-center gap-2 ${
            activeTab === 'DIRECT_HIRES'
              ? 'bg-[#0051d5] text-white shadow-xs'
              : 'text-[#475569] hover:text-[#091426]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Direct Hires ({directHires.length})</span>
        </button>
      </div>

      {/* Tab 1: Posted Jobs List */}
      {activeTab === 'POSTED_JOBS' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#64748b]">Loading your postings...</div>
          ) : jobs.length === 0 ? (
            <div className="p-16 text-center bg-white border border-[#e2e8f0] rounded-3xl space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#091426]">No posted jobs yet</h3>
                <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                  Have a home improvement or maintenance task? Publish a job to receive bids from specialists.
                </p>
              </div>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0051d5] text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Posting</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-geist border ${
                          job.status === 'OPEN'
                            ? 'bg-[#ecfdf5] text-[#0d9488] border-[#a7f3d0]'
                            : 'bg-[#eff6ff] text-[#0051d5] border-[#bfdbfe]'
                        }`}
                      >
                        {job.status}
                      </span>
                      <span className="text-[11px] text-[#94a3b8] font-geist">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#091426]">{job.title}</h3>
                    {job.serviceName && (
                      <p className="text-xs font-medium text-[#0051d5]">{job.serviceName}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-[#64748b] pt-1 font-geist">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                        {job.address?.city || 'Chandigarh'}
                      </span>
                      <span>•</span>
                      <span>Budget: ₹{job.minAmount || 299} - ₹{job.maxAmount || 999}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="text-xs text-[#64748b]">
                      Requires {job.requiredWorkers || 1} Specialist{(job.requiredWorkers || 1) > 1 ? 's' : ''}
                    </span>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="px-4 py-2 rounded-xl bg-[#091426] hover:bg-[#0051d5] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>Review Applicants</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Direct Hires List */}
      {activeTab === 'DIRECT_HIRES' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#64748b]">Loading your direct hire requests...</div>
          ) : directHires.length === 0 ? (
            <div className="p-16 text-center bg-white border border-[#e2e8f0] rounded-3xl space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#091426]">No direct hire requests</h3>
                <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                  Browse certified specialists on our explore page to book them on demand.
                </p>
              </div>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0051d5] text-white text-xs font-bold shadow-sm"
              >
                <span>Browse Specialists</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {directHires.map((req) => {
                const isAccepted = req.status === 'ACCEPTED';
                const isDeclined = req.status === 'DECLINED';
                const isPending = req.status === 'PENDING';

                return (
                  <div
                    key={req.id}
                    className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-geist border ${
                            isAccepted
                              ? 'bg-[#ecfdf5] text-[#0d9488] border-[#a7f3d0]'
                              : isDeclined
                              ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
                              : 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-[11px] text-[#94a3b8] font-geist">
                          Request #{req.id}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#0051d5] text-white font-bold flex items-center justify-center text-base shrink-0">
                          {req.worker?.user?.name?.[0] || 'W'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#091426]">
                            {req.worker?.user?.name || 'Assigned Specialist'}
                          </h3>
                          <p className="text-xs text-[#475569]">{req.serviceName}</p>
                          <p className="text-[11px] text-[#64748b]">{req.worker?.headline}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-xs space-y-1 font-geist text-[#475569]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748b]">Slot:</span>
                          <span className="font-bold text-[#091426]">
                            {req.requestedDate} ({req.requestedStartTime} - {req.requestedEndTime})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748b]">Proposed Amount:</span>
                          <span className="font-bold text-[#0051d5]">
                            ₹{req.proposedPrice || 499}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                      {isAccepted ? (
                        <Link
                          href={`/bookings/${req.id}/track`}
                          className="w-full py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Track Live Job & OTP</span>
                        </Link>
                      ) : isDeclined ? (
                        <span className="text-xs text-red-500 font-semibold">
                          Specialist was unavailable for this slot.
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting specialist confirmation...</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
