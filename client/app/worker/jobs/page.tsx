'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Inbox,
  Briefcase,
  LayoutGrid,
  List,
  Filter,
  Zap,
  FileText,
} from 'lucide-react';
import JobRequestCard from '@/components/worker/JobRequestCard';
import { WorkerJobRequest } from '@/types';
import { getToken } from '@/lib/auth-client';

export type TabFilter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
export type ItemTypeFilter = 'ALL' | 'ASSIGNMENT' | 'DIRECT_HIRE' | 'APPLICATION';

interface WorkerAssignmentJob {
  id: string;
  title: string;
  description: string;
  serviceName?: string | null;
  skills?: string[];
  status: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  currency?: string | null;
  preferredDate?: string | null;
  preferredStartTime?: string | null;
  preferredEndTime?: string | null;
  address?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
}

interface WorkerAssignmentApiItem {
  id: string;
  type: 'assignment';
  jobId?: string | null;
  directHireRequestId?: string | null;
  role: string;
  status: string;
  scheduledDate: string;
  startTime?: string | null;
  endTime?: string | null;
  job?: WorkerAssignmentJob | null;
  directHire?: {
    serviceName?: string | null;
    proposedPrice?: number | null;
    customerMessage?: string | null;
    address?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    } | null;
  } | null;
  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
    profileImage?: string | null;
  };
}

interface WorkerApplicationApiItem {
  id: string;
  type: 'application';
  jobId: string;
  status: string;
  message?: string | null;
  proposedPrice?: number | null;
  createdAt: string;
  job: WorkerAssignmentJob;
  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
    profileImage?: string | null;
  };
}

interface WorkerDirectHireApiItem {
  id: string;
  type: 'direct-hire';
  status: string;
  serviceName: string;
  requestedDate: string;
  requestedStartTime?: string | null;
  requestedEndTime?: string | null;
  customerMessage?: string | null;
  proposedPrice?: number | null;
  expiresAt: string;
  createdAt: string;
  assignmentId?: string | null;
  assignmentStatus?: string | null;
  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
    profileImage?: string | null;
  };
  address?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
}

interface WorkerJobsApiPayload {
  assignments?: WorkerAssignmentApiItem[];
  applications?: WorkerApplicationApiItem[];
  directHireRequests?: WorkerDirectHireApiItem[];
}

function mapAssignmentStatus(status: string): WorkerJobRequest['status'] {
  switch (status) {
    case 'ASSIGNED':
    case 'CONFIRMED':
      return 'ASSIGNED';
    case 'ON_THE_WAY':
      return 'ON_THE_WAY';
    case 'ARRIVED':
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'DECLINED';
    default:
      return 'PENDING';
  }
}

function mapDirectHireStatus(status: string): WorkerJobRequest['status'] {
  switch (status) {
    case 'PENDING':
      return 'PENDING';
    case 'ACCEPTED':
      return 'ASSIGNED';
    case 'DECLINED':
    case 'EXPIRED':
    case 'CANCELLED':
      return 'DECLINED';
    default:
      return 'PENDING';
  }
}

function mapAssignmentToJobRequest(a: WorkerAssignmentApiItem): WorkerJobRequest {
  const address = a.job?.address || a.directHire?.address;
  const location = address
    ? `${address.address || ''}, ${address.city || ''}`
    : 'Location not specified';
  const serviceName = a.job?.serviceName || a.directHire?.serviceName || 'Specialist Job';

  return {
    id: a.id,
    customerName: a.customer?.name || 'Customer',
    customerPhone: a.customer?.phone || '',
    customerAvatar:
      a.customer?.profileImage ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    serviceName,
    serviceCategory: a.job?.skills?.[0] || serviceName,
    location,
    distanceKm: 0,
    date: a.scheduledDate
      ? new Date(a.scheduledDate).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      : 'TBD',
    timeWindow: `${a.startTime || '09:00'} - ${a.endTime || '17:00'}`,
    earningsAmount:
      a.job?.maxAmount || a.directHire?.proposedPrice || a.job?.minAmount || 0,
    status: mapAssignmentStatus(a.status),
    notes: a.directHire?.customerMessage || a.job?.description || undefined,
    itemType: 'ASSIGNMENT',
    role: a.role,
    jobId: a.jobId || undefined,
  };
}

function mapDirectHireToJobRequest(dhr: WorkerDirectHireApiItem): WorkerJobRequest {
  const address = dhr.address;
  const location = address
    ? `${address.address || ''}, ${address.city || ''}`
    : 'Location not specified';

  return {
    id: dhr.assignmentId || dhr.id,
    customerName: dhr.customer?.name || 'Customer',
    customerPhone: dhr.customer?.phone || '',
    customerAvatar:
      dhr.customer?.profileImage ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    serviceName: dhr.serviceName || 'Direct Hire',
    serviceCategory: 'Direct Hire',
    location,
    distanceKm: 0,
    date: dhr.requestedDate
      ? new Date(dhr.requestedDate).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      : 'TBD',
    timeWindow: `${dhr.requestedStartTime || '09:00'} - ${dhr.requestedEndTime || '17:00'}`,
    earningsAmount: dhr.proposedPrice || 0,
    status: mapDirectHireStatus(dhr.status),
    notes: dhr.customerMessage || undefined,
    itemType: 'DIRECT_HIRE',
  };
}

function mapApplicationToJobRequest(app: WorkerApplicationApiItem): WorkerJobRequest {
  const address = app.job?.address;
  const location = address
    ? `${address.address || ''}, ${address.city || ''}`
    : 'Location not specified';
  const serviceName = app.job?.serviceName || app.job?.title || 'Job Proposal';

  let appStatus: WorkerJobRequest['status'] = 'PENDING';
  if (app.status === 'SELECTED' || app.status === 'ACCEPTED') {
    appStatus = 'ASSIGNED';
  } else if (app.status === 'REJECTED') {
    appStatus = 'DECLINED';
  }

  return {
    id: app.id,
    customerName: app.customer?.name || 'Customer',
    customerPhone: app.customer?.phone || '',
    customerAvatar:
      app.customer?.profileImage ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    serviceName,
    serviceCategory: app.job?.skills?.[0] || 'Marketplace Job',
    location,
    distanceKm: 0,
    date: app.job.preferredDate
      ? new Date(app.job.preferredDate).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      : 'Flexible Date',
    timeWindow: `${app.job.preferredStartTime || '09:00'} - ${app.job.preferredEndTime || '17:00'}`,
    earningsAmount: app.proposedPrice || app.job.minAmount || 0,
    status: appStatus,
    notes: app.message || app.job.description || undefined,
    itemType: 'APPLICATION',
    jobId: app.job.id,
  };
}

export default function WorkerJobRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<WorkerJobRequest[]>([]);
  const [filterTab, setFilterTab] = useState<TabFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilter>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'row'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkerJobs = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/worker/jobs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const apiData: WorkerJobsApiPayload = data.data || data;

          const allJobs: WorkerJobRequest[] = [];

          // 1. Map assigned jobs
          if (apiData.assignments?.length) {
            apiData.assignments.forEach((a) => {
              allJobs.push(mapAssignmentToJobRequest(a));
            });
          }

          // 2. Map direct hire requests (skip if already converted to assignment)
          if (apiData.directHireRequests?.length) {
            apiData.directHireRequests.forEach((dhr) => {
              if (dhr.assignmentId) return;
              allJobs.push(mapDirectHireToJobRequest(dhr));
            });
          }

          // 3. Map submitted job applications
          if (apiData.applications?.length) {
            apiData.applications.forEach((app) => {
              allJobs.push(mapApplicationToJobRequest(app));
            });
          }

          setRequests(allJobs);
        }
      } catch (err) {
        console.error('Failed to fetch worker jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkerJobs();
  }, []);

  const handleAcceptJob = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/direct-hire-requests/${id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const assignmentId = data.assignment?.id || data.data?.assignment?.id || id;
        router.push(`/worker/jobs/${assignmentId}`);
        return;
      }
    } catch (err) {
      console.error('Failed to accept direct hire:', err);
    }

    // Local fallback
    setRequests((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'ASSIGNED' } : j))
    );
    router.push(`/worker/jobs/${id}`);
  };

  const handleDeclineJob = async (id: string) => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`/api/direct-hire-requests/${id}/decline`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Failed to decline direct hire:', err);
      }
    }

    setRequests((prev) => prev.filter((j) => j.id !== id));
  };

  // Status Filter Logic
  const displayedRequests = requests.filter((r) => {
    // 1. Check Status Tab Filter
    let statusMatch = true;
    if (filterTab === 'PENDING') {
      statusMatch = r.status === 'PENDING';
    } else if (filterTab === 'ACCEPTED' || filterTab === 'ASSIGNED') {
      statusMatch = r.status === 'ASSIGNED' || r.status === 'ACCEPTED';
    } else if (filterTab === 'IN_PROGRESS') {
      statusMatch = r.status === 'IN_PROGRESS' || r.status === 'ON_THE_WAY';
    } else if (filterTab === 'COMPLETED') {
      statusMatch = r.status === 'COMPLETED';
    }

    if (!statusMatch) return false;

    // 2. Check Item Type Filter (All, Assignments, Direct Hires, Applications)
    if (typeFilter !== 'ALL' && r.itemType !== typeFilter) {
      return false;
    }

    return true;
  });

  // Accurate stat counts
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const assignedCount = requests.filter(
    (r) => r.status === 'ASSIGNED' || r.status === 'ACCEPTED'
  ).length;
  const inProgressCount = requests.filter(
    (r) => r.status === 'IN_PROGRESS' || r.status === 'ON_THE_WAY'
  ).length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Controls */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header Title & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#091426] tracking-tight">
                My Jobs & Engagements
              </h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#0051d5] text-xs font-bold font-geist border border-[#bfdbfe]">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1">
              Complete overview of your assigned jobs, active client requests, and submitted proposals.
            </p>
          </div>

          {/* Grid vs Row View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#f1f5f9] rounded-xl border border-[#e2e8f0] self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold font-geist flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#0051d5] shadow-xs'
                  : 'text-[#64748b] hover:text-[#091426]'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('row')}
              className={`p-2 rounded-lg text-xs font-bold font-geist flex items-center gap-1.5 transition-all ${
                viewMode === 'row'
                  ? 'bg-white text-[#0051d5] shadow-xs'
                  : 'text-[#64748b] hover:text-[#091426]'
              }`}
              title="Row / List View"
              aria-label="Row / List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Rows</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#f1f5f9]">
          <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#e2e8f0]">
            <span className="text-[10px] font-bold uppercase text-[#64748b] font-geist block">All Items</span>
            <span className="text-xl font-extrabold text-[#091426] font-geist">{requests.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe]">
            <span className="text-[10px] font-bold uppercase text-[#0051d5] font-geist block">Pending Action</span>
            <span className="text-xl font-extrabold text-[#0051d5] font-geist">{pendingCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0]">
            <span className="text-[10px] font-bold uppercase text-[#0d9488] font-geist block">Assigned & Active</span>
            <span className="text-xl font-extrabold text-[#0d9488] font-geist">{assignedCount + inProgressCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <span className="text-[10px] font-bold uppercase text-[#64748b] font-geist block">Completed</span>
            <span className="text-xl font-extrabold text-[#475569] font-geist">{completedCount}</span>
          </div>
        </div>

        {/* Filters Area: Clear Separation between Job Status and Item Type */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-[#f1f5f9]">
          
          {/* Status Tabs */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] font-geist block">
              Filter by Status:
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-[#f1f5f9] rounded-xl border border-[#e2e8f0] flex-wrap">
              {(['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as const).map((tab) => {
                const label =
                  tab === 'ALL'
                    ? 'All'
                    : tab === 'PENDING'
                    ? `Pending (${pendingCount})`
                    : tab === 'ASSIGNED'
                    ? `Assigned (${assignedCount})`
                    : tab === 'IN_PROGRESS'
                    ? `Active (${inProgressCount})`
                    : `Completed (${completedCount})`;

                return (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-geist transition-all ${
                      filterTab === tab
                        ? 'bg-[#0051d5] text-white shadow-xs'
                        : 'text-[#475569] hover:text-[#091426]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Type Filter (Clears confusion between assignment vs application vs direct hire) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] font-geist block flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#64748b]" />
              Filter by Category / Type:
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0] flex-wrap">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === 'ALL'
                    ? 'bg-[#091426] text-white'
                    : 'text-[#64748b] hover:text-[#091426]'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setTypeFilter('ASSIGNMENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  typeFilter === 'ASSIGNMENT'
                    ? 'bg-[#0d9488] text-white'
                    : 'text-[#64748b] hover:text-[#0d9488]'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                <span>Assigned Jobs</span>
              </button>
              <button
                onClick={() => setTypeFilter('DIRECT_HIRE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  typeFilter === 'DIRECT_HIRE'
                    ? 'bg-[#0051d5] text-white'
                    : 'text-[#64748b] hover:text-[#0051d5]'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Direct Hire Offers</span>
              </button>
              <button
                onClick={() => setTypeFilter('APPLICATION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  typeFilter === 'APPLICATION'
                    ? 'bg-[#a21caf] text-white'
                    : 'text-[#64748b] hover:text-[#a21caf]'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>My Applications</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded-2xl">
          <div className="w-8 h-8 border-2 border-[#0051d5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#64748b] mt-3">Loading your jobs and requests...</p>
        </div>
      )}

      {/* Requests List / Grid */}
      {!loading && (
        <div>
          {displayedRequests.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#091426]">No matching jobs or requests</h3>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                {filterTab === 'ALL' && typeFilter === 'ALL'
                  ? 'You don\'t have any active jobs or proposals yet. Check the marketplace to apply for jobs or keep your status online to receive direct hires.'
                  : `No records found under status "${filterTab.toLowerCase()}" with type "${typeFilter.toLowerCase()}".`}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedRequests.map((job) => (
                <JobRequestCard
                  key={job.id}
                  job={job}
                  viewMode="grid"
                  onAccept={handleAcceptJob}
                  onDecline={handleDeclineJob}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              {displayedRequests.map((job) => (
                <JobRequestCard
                  key={job.id}
                  job={job}
                  viewMode="row"
                  onAccept={handleAcceptJob}
                  onDecline={handleDeclineJob}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
