'use client';

import React, { useState, useSyncExternalStore, useLayoutEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  UserCheck,
  MessageSquare,
  UserPlus,
  Phone,
  Navigation,
  Clock,
  ShieldCheck,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { getToken, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

interface JobDetail {
  id: string;
  title: string;
  serviceName?: string | null;
  description: string;
  minAmount?: string | number | null;
  maxAmount?: string | number | null;
  currency: string;
  requiredWorkers?: number;
  assignedWorkerCount?: number;
  staffingStatus?: string;
  status: string;
  createdAt: string;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  customerId?: string;
  address?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
  customer?: {
    id?: string;
    userId?: string;
    user?: {
      name?: string;
      email?: string;
      phone?: string;
      profileImage?: string;
    };
  } | null;
  assignments?: Array<{
    id: string;
    role: 'LEAD' | 'MEMBER';
    status: string;
    workerId: string;
    scheduledDate?: string;
    startTime?: string;
    endTime?: string;
    worker?: {
      id?: string;
      headline?: string;
      rating?: number;
      reviewCount?: number;
      user?: {
        name?: string;
        phone?: string;
        email?: string;
        profileImage?: string;
      };
    };
  }>;
}

interface ApplicationItem {
  id: string;
  jobId: string;
  workerId: string;
  proposedPrice?: string | null;
  message?: string | null;
  createdAt: string;
  worker?: {
    id: string;
    name?: string;
    email?: string;
    profileImage?: string;
    headline?: string;
    skills?: string[];
  };
}

function getJobStatusInfo(status: string) {
  switch (status) {
    case 'OPEN':
      return {
        label: 'Open for Proposals',
        badgeBg: 'bg-[#ecfdf5] text-[#0d9488] border-[#a7f3d0]',
        description: 'Currently receiving proposals from qualified local specialists.',
        step: 1,
      };
    case 'SCHEDULED':
      return {
        label: 'Staffed & Scheduled',
        badgeBg: 'bg-[#eff6ff] text-[#0051d5] border-[#bfdbfe]',
        description: 'Specialists are confirmed and scheduled for service.',
        step: 2,
      };
    case 'IN_PROGRESS':
      return {
        label: 'Work in Progress',
        badgeBg: 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]',
        description: 'Specialists are actively executing the requested service.',
        step: 3,
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        badgeBg: 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]',
        description: 'Job execution completed and verified by customer.',
        step: 4,
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        badgeBg: 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]',
        description: 'This job posting was cancelled.',
        step: 0,
      };
    default:
      return {
        label: status,
        badgeBg: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]',
        description: `Current status: ${status}`,
        step: 1,
      };
  }
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [job, setJob] = useState<JobDetail | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Worker Application Form State
  const [applyMessage, setApplyMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);

  // Customer Select Workers State
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [selectingWorkers, setSelectingWorkers] = useState(false);

  // Team Invite State for assigned workers
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteWorkerId, setInviteWorkerId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  // Handle worker apply
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push(`/login?role=WORKER&redirect=/jobs/${jobId}`);
      return;
    }

    setSubmittingApp(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: applyMessage,
          proposedPrice: proposedPrice ? Number(proposedPrice) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit application.');
        setSubmittingApp(false);
        return;
      }

      setAppSuccess(true);
      fetchJob();
    } catch (err) {
      console.error(err);
      setError('An error occurred submitting your proposal.');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Handle customer selecting workers
  const handleSelectWorkers = async () => {
    if (selectedWorkerIds.length === 0) return;
    const token = getToken();
    if (!token) return;

    setSelectingWorkers(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/select-workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workerIds: selectedWorkerIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to hire selected workers.');
        setSelectingWorkers(false);
        return;
      }

      setSelectedWorkerIds([]);
      fetchJob();
    } catch (err) {
      console.error(err);
      setError('An error occurred during worker selection.');
    } finally {
      setSelectingWorkers(false);
    }
  };

  // Handle team invitation by worker
  const handleSendTeamInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteWorkerId) return;
    const token = getToken();
    if (!token) return;

    setInviting(true);
    setInviteNotice(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/team-invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invitedWorkerId: inviteWorkerId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setInviteNotice(data.error || 'Failed to send team invitation.');
        setInviting(false);
        return;
      }

      setInviteNotice('Team invitation sent successfully!');
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteWorkerId('');
        setInviteNotice(null);
      }, 1500);
    } catch {
      setInviteNotice('Error sending team invitation.');
    } finally {
      setInviting(false);
    }
  };

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) {
        setError('Job not found or has been closed.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      const loadedJob = data.job || data.data?.job;
      setJob(loadedJob);

      // If logged in customer is the job poster, fetch applications
      const token = getToken();
      if (token) {
        const appsRes = await fetch(`/api/jobs/${jobId}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData.applications || appsData.data?.applications || []);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch job details.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useLayoutEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#0051d5] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#64748b]">Loading job specifications and live status...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#091426]">{error || 'Job Not Found'}</h2>
        <Link
          href="/jobs"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#0051d5] text-white text-xs font-bold"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // Role context
  const isCustomerPoster = session?.role === 'CUSTOMER';
  const isWorker = session?.role === 'WORKER';
  const myAssignment = job.assignments?.find(
    (a) => a.worker?.user?.name === session?.name || a.workerId === session?.id
  );
  const myApplication = applications.find(
    (app) => app.worker?.name === session?.name || app.workerId === session?.id
  );

  // Staffing calculations
  const requiredWorkersCount = job.requiredWorkers || 1;
  const assignmentsList = job.assignments || [];
  const assignedWorkersCount = assignmentsList.length;
  const remainingSlots = Math.max(0, requiredWorkersCount - assignedWorkersCount);
  const isFullyStaffed =
    assignedWorkersCount >= requiredWorkersCount ||
    job.staffingStatus === 'FULLY_ASSIGNED' ||
    ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(job.status);

  const statusInfo = getJobStatusInfo(job.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb Navigation & Real Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Staffing Pill */}
          <span className="px-3 py-1 rounded-full text-xs font-bold font-geist bg-[#f1f5f9] text-[#091426] border border-[#e2e8f0]">
            Staffing: {assignedWorkersCount} / {requiredWorkersCount} {requiredWorkersCount > 1 ? 'Specialists' : 'Specialist'}
          </span>
          {/* Job Status Pill */}
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-geist border ${statusInfo.badgeBg}`}>
            Status: {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Role-Aware Hub Banner explaining page purpose */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f9ff] border border-[#dbeafe] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0051d5] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0051d5] font-geist">
              {isCustomerPoster
                ? 'Job Management Hub (Customer Portal)'
                : myAssignment
                ? 'Specialist Assigned Console'
                : 'Marketplace Job Specifications'}
            </h3>
            <p className="text-xs text-[#334155] mt-0.5">
              {isCustomerPoster
                ? isFullyStaffed
                  ? 'All required specialists are assigned. Monitor milestones, call your crew, and track arrival live below.'
                  : 'Review incoming bids from verified specialists below and select candidates to complete staffing.'
                : myAssignment
                ? `You are assigned to this project (${myAssignment.role}). Review scope and launch your execution console.`
                : 'Review job requirements, schedule, and compensation. Submit your application below.'}
            </p>
          </div>
        </div>

        {/* Quick action buttons in header */}
        <div className="flex items-center gap-2 shrink-0">
          {isCustomerPoster && isFullyStaffed && assignmentsList[0] && (
            <Link
              href={`/bookings/${assignmentsList[0].id}/track`}
              className="px-4 py-2 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Track Live Booking</span>
            </Link>
          )}
          {myAssignment && (
            <Link
              href={`/worker/jobs/${myAssignment.id}`}
              className="px-4 py-2 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>Execution Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Job Overview Card */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            {job.serviceName && (
              <span className="text-xs font-bold uppercase tracking-wider text-[#0051d5] font-geist">
                {job.serviceName}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight mt-1">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748b] mt-2 font-geist">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                {job.address?.city ? `${job.address.address || ''}, ${job.address.city}` : 'Chandigarh'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0d9488]" />
                {job.preferredDate ? new Date(job.preferredDate).toLocaleDateString() : new Date(job.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#475569]" />
                {job.preferredStartTime || '09:00'} - {job.preferredEndTime || '17:00'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-bold text-[#091426]">
                <Users className="w-3.5 h-3.5 text-[#6366f1]" />
                {requiredWorkersCount} Specialist{requiredWorkersCount > 1 ? 's' : ''} Needed
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2e8f0] text-left sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block font-geist">
              Budget Estimate
            </span>
            <span className="font-geist font-extrabold text-2xl text-[#091426]">
              ₹{job.minAmount || 299} - ₹{job.maxAmount || 999}
            </span>
            <span className="text-[10px] text-[#94a3b8] block mt-0.5">INR (All inclusive)</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#f1f5f9] space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] font-geist">
            Job Scope & Details
          </h3>
          <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Customer Poster Info */}
        <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#091426] text-white font-bold flex items-center justify-center">
              {job.customer?.user?.name?.[0] || 'C'}
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748b] uppercase">Posted By</span>
              <h4 className="text-sm font-bold text-[#091426]">
                {job.customer?.user?.name || 'Verified Customer'}
              </h4>
            </div>
          </div>

          {job.customer?.userId && !isCustomerPoster && (
            <Link
              href={`/messages?userId=${job.customer.userId}`}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#e2e8f0] hover:bg-[#eff6ff] hover:border-[#bfdbfe] text-xs font-bold text-[#0051d5] flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contact Customer</span>
            </Link>
          )}
        </div>
      </div>

      {/* 
        ══════════════════════════════════════════════════════════════════════
        WELL-PLANNED TRACK & ASSIGNED WORKERS SECTION
        Shows both 1 or 2 (or more) assigned workers, their roles (Lead/Member),
        real-time status, direct tracking link, contact buttons, and milestone progression.
        ══════════════════════════════════════════════════════════════════════
      */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f1f5f9]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#091426]">
                Assigned Specialists & Live Milestone Tracking
              </h2>
              {isFullyStaffed ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#0d9488] text-xs font-extrabold font-geist border border-[#a7f3d0]">
                  Fully Staffed ({assignedWorkersCount}/{requiredWorkersCount})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#fffbeb] text-[#b45309] text-xs font-extrabold font-geist border border-[#fde68a]">
                  Staffing: {assignedWorkersCount} of {requiredWorkersCount} Assigned
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748b]">
              Live status, arrival milestones, and team members assigned to execute this job.
            </p>
          </div>

          {/* Quick Tracking CTA for customer */}
          {isCustomerPoster && assignmentsList.length > 0 && (
            <Link
              href={`/bookings/${assignmentsList[0].id}/track`}
              className="px-4 py-2 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Live Milestone Tracker</span>
            </Link>
          )}
        </div>

        {/* Live Milestone Stepper */}
        <div className="p-5 rounded-2xl bg-[#f8f9ff] border border-[#e2e8f0] space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] font-geist block">
            Execution Lifecycle
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { num: '1', title: 'Job Posted & Bids', desc: 'Received specialist proposals', done: true },
              { num: '2', title: 'Specialists Hired', desc: isFullyStaffed ? 'Crew fully assigned' : `${assignedWorkersCount}/${requiredWorkersCount} assigned`, done: assignedWorkersCount > 0, current: assignedWorkersCount > 0 && job.status === 'SCHEDULED' },
              { num: '3', title: 'Arrival & OTP', desc: 'Doorstep PIN verification', done: ['IN_PROGRESS', 'COMPLETED'].includes(job.status), current: job.status === 'IN_PROGRESS' },
              { num: '4', title: 'Job Completion', desc: 'Sign-off & ratings', done: job.status === 'COMPLETED', current: job.status === 'COMPLETED' },
            ].map((step) => (
              <div
                key={step.num}
                className={`p-3 rounded-xl border transition-all ${
                  step.current
                    ? 'bg-white border-[#0051d5] shadow-xs'
                    : step.done
                    ? 'bg-[#ecfdf5]/50 border-[#a7f3d0]'
                    : 'bg-white/60 border-[#e2e8f0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center font-geist ${
                      step.current
                        ? 'bg-[#0051d5] text-white'
                        : step.done
                        ? 'bg-[#0d9488] text-white'
                        : 'bg-[#e2e8f0] text-[#64748b]'
                    }`}
                  >
                    {step.done ? '✓' : step.num}
                  </span>
                  <h4 className="text-xs font-bold text-[#091426]">{step.title}</h4>
                </div>
                <p className="text-[10px] text-[#64748b] mt-1 pl-7">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Specialists Grid (Handles 1, 2, or more assigned specialists) */}
        {assignmentsList.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] font-geist">
              Confirmed Specialist Crew ({assignmentsList.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignmentsList.map((assignment, index) => {
                const isLead = assignment.role === 'LEAD' || index === 0;
                const isMe = assignment.worker?.user?.name === session?.name || assignment.workerId === session?.id;

                return (
                  <div
                    key={assignment.id}
                    className="p-5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#0051d5] transition-all shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Badges: Role & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold font-geist uppercase tracking-wider ${
                            isLead
                              ? 'bg-[#0051d5] text-white'
                              : 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]'
                          }`}
                        >
                          {isLead ? '★ Lead Specialist' : 'Teammate Specialist'}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-geist bg-[#ecfdf5] text-[#0d9488] border border-[#a7f3d0]">
                          {assignment.status}
                        </span>
                      </div>

                      {/* Specialist Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#091426] text-white font-bold flex items-center justify-center text-sm shrink-0">
                          {assignment.worker?.user?.name?.[0] || 'W'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-[#091426] truncate">
                              {assignment.worker?.user?.name || `Assigned Specialist #${index + 1}`}
                            </h4>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0051d5] shrink-0" />
                          </div>
                          <p className="text-xs text-[#475569] truncate">
                            {assignment.worker?.headline || 'Certified Technical Specialist'}
                          </p>
                          <span className="text-[10px] text-[#64748b] font-geist block mt-0.5">
                            Slot: Position {index + 1} of {requiredWorkersCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions for this specific specialist */}
                    <div className="pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {assignment.worker?.user?.phone && (
                          <a
                            href={`tel:${assignment.worker.user.phone}`}
                            className="p-2 rounded-xl bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#0051d5] text-xs font-bold border border-[#e2e8f0] flex items-center gap-1.5 transition-colors"
                            title="Call Specialist"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Call</span>
                          </a>
                        )}

                        <Link
                          href="/messages"
                          className="p-2 rounded-xl bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#475569] text-xs font-bold border border-[#e2e8f0] flex items-center gap-1.5 transition-colors"
                          title="Message Specialist"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Chat</span>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCustomerPoster && (
                          <Link
                            href={`/bookings/${assignment.id}/track`}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Track & OTP</span>
                          </Link>
                        )}

                        {isMe && (
                          <Link
                            href={`/worker/jobs/${assignment.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                          >
                            <span>Open Console</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* If requiredWorkers > assignedWorkers, display empty slot card */}
              {remainingSlots > 0 && (
                <div className="p-5 rounded-2xl bg-[#f8f9ff] border-2 border-dashed border-[#cbd5e1] flex flex-col justify-between space-y-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold font-geist uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                      Open Specialist Slot
                    </span>
                    <h4 className="text-sm font-bold text-[#091426] mt-2">
                      Position {assignedWorkersCount + 1} of {requiredWorkersCount} Pending
                    </h4>
                    <p className="text-xs text-[#64748b] mt-1">
                      This project requires {requiredWorkersCount} specialists. {remainingSlots} slot remains open.
                    </p>
                  </div>

                  {isCustomerPoster && job.status === 'OPEN' && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-[#0051d5]">
                        Select a candidate from the proposals below ↓
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Team invitation banner if current worker is assigned */}
            {myAssignment && (
              <div className="p-4 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#0051d5]" />
                  <span className="text-xs font-bold text-[#0051d5]">
                    Need a helper on this job? You can invite a trusted teammate to join your crew.
                  </span>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-1.5 bg-white text-[#0051d5] border border-[#bfdbfe] rounded-xl text-xs font-bold hover:bg-[#dbeafe] transition-colors"
                >
                  Invite Teammate
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty assignments state */
          <div className="p-8 text-center bg-[#f8f9ff] border border-[#e2e8f0] rounded-2xl space-y-2">
            <Users className="w-8 h-8 text-[#94a3b8] mx-auto" />
            <h4 className="text-sm font-bold text-[#091426]">No Specialists Assigned Yet</h4>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              {isCustomerPoster
                ? 'Review incoming proposals below and click "Select & Hire" to assign specialists to this job.'
                : 'Specialist staffing is currently open. Submit your proposal below to apply.'}
            </p>
          </div>
        )}
      </div>

      {/* 
        ══════════════════════════════════════════════════════════════════════
        CUSTOMER CANDIDATE APPLICANTS SECTION
        CRITICAL RULE: This section MUST NOT SHOW if required workers are assigned!
        ══════════════════════════════════════════════════════════════════════
      */}
      {isCustomerPoster && !isFullyStaffed && job.status === 'OPEN' && (
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#091426]">Candidate Applicants</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#091426] text-xs font-bold font-geist">
                  {applications.length}
                </span>
                <span className="text-xs font-bold text-[#0051d5] font-geist">
                  ({remainingSlots} slot{remainingSlots > 1 ? 's' : ''} remaining)
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Review proposals from certified specialists and choose whom to hire for this job.
              </p>
            </div>

            {selectedWorkerIds.length > 0 && (
              <button
                onClick={handleSelectWorkers}
                disabled={selectingWorkers}
                className="px-5 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {selectingWorkers
                    ? 'Confirming Hiring...'
                    : `Hire Selected Specialist (${selectedWorkerIds.length})`}
                </span>
              </button>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="p-10 text-center bg-[#f8f9ff] border border-[#e2e8f0] rounded-2xl space-y-2">
              <Briefcase className="w-8 h-8 text-[#94a3b8] mx-auto" />
              <h4 className="text-sm font-bold text-[#091426]">No applications yet</h4>
              <p className="text-xs text-[#64748b]">
                Nearby specialists are reviewing your posting. You will be notified when bids arrive.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const isSelected = selectedWorkerIds.includes(app.workerId);

                return (
                  <div
                    key={app.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-[#0051d5] bg-[#eff6ff]/40 shadow-xs'
                        : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Selection checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedWorkerIds.length >= remainingSlots) {
                              alert(`You can only select ${remainingSlots} more specialist(s) to fulfill the required quota.`);
                              return;
                            }
                            setSelectedWorkerIds([...selectedWorkerIds, app.workerId]);
                          } else {
                            setSelectedWorkerIds(
                              selectedWorkerIds.filter((id) => id !== app.workerId)
                            );
                          }
                        }}
                        className="mt-1 w-4 h-4 text-[#0051d5] rounded focus:ring-0 cursor-pointer"
                      />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#091426]">
                            {app.worker?.name || 'Specialist Candidate'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#0d9488] text-[10px] font-bold font-geist border border-[#a7f3d0]">
                            Verified Pro
                          </span>
                        </div>
                        <p className="text-xs text-[#475569]">{app.worker?.headline || 'Local Skilled Specialist'}</p>

                        {app.message && (
                          <p className="text-xs text-[#64748b] bg-[#f8f9ff] p-2.5 rounded-lg border border-[#e2e8f0] mt-2 italic">
                            &ldquo;{app.message}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <div>
                        <span className="text-[10px] text-[#94a3b8] block sm:text-right">
                          Proposed Price
                        </span>
                        <span className="font-geist font-extrabold text-base text-[#091426]">
                          ₹{app.proposedPrice || job.minAmount}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (isSelected) {
                            setSelectedWorkerIds(
                              selectedWorkerIds.filter((id) => id !== app.workerId)
                            );
                          } else {
                            if (selectedWorkerIds.length >= remainingSlots) {
                              alert(`You can only select ${remainingSlots} more specialist(s).`);
                              return;
                            }
                            setSelectedWorkerIds([...selectedWorkerIds, app.workerId]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-[#0051d5] text-white'
                            : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                        }`}
                      >
                        {isSelected ? 'Selected ✓' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Worker Proposal Submission Section */}
      {isWorker && job.status === 'OPEN' && !myAssignment && (
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#091426]">Submit Your Application & Quote</h2>
            <p className="text-xs text-[#64748b]">
              Present your proposal to the customer with your estimated price and availability.
            </p>
          </div>

          {appSuccess || myApplication ? (
            <div className="p-6 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#0d9488] mx-auto" />
              <h4 className="text-sm font-bold text-[#091426]">Application Submitted!</h4>
              <p className="text-xs text-[#0d9488]">
                The customer has received your proposal. You will be notified once a decision is made.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Proposed Price (₹)
                </label>
                <input
                  type="number"
                  placeholder={`e.g. ${job.minAmount || 500}`}
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] font-geist font-bold text-[#091426]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Proposal Message / Cover Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain your relevant experience, tools you will bring, or estimated completion time..."
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingApp}
                className="px-6 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingApp ? 'Submitting Proposal...' : 'Submit Application'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Team Invite Modal for Assigned Worker */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#091426]">Invite Teammate to Job</h3>
              <p className="text-xs text-[#64748b]">
                Enter the Worker ID of a connected partner to invite them to this assignment crew.
              </p>
            </div>

            {inviteNotice && (
              <div className="p-3 rounded-xl bg-blue-50 text-[#0051d5] text-xs font-semibold">
                {inviteNotice}
              </div>
            )}

            <form onSubmit={handleSendTeamInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1">
                  Worker ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2"
                  value={inviteWorkerId}
                  onChange={(e) => setInviteWorkerId(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl text-[#091426]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2 rounded-xl bg-[#0051d5] text-white text-xs font-bold"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
