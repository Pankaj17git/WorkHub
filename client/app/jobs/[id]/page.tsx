'use client';

import React, { useState, useEffect, useSyncExternalStore, useLayoutEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  UserCheck,
  MessageSquare,
  Sparkles,
  ExternalLink,
  UserPlus
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
      profileImage?: string;
    };
  } | null;
  assignments?: Array<{
    id: string;
    status: string;
    workerId: string;
    worker?: {
      user?: {
        name?: string;
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
    } catch (err) {
      setInviteNotice('Error sending team invitation.');
    } finally {
      setInviting(false);
    }
  };

  const fetchJob = async () => {
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
  };

  useLayoutEffect(() => {
    fetchJob();
  }, [jobId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#0051d5] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#64748b]">Loading job specifications...</p>
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

  const isCustomerPoster = session?.role === 'CUSTOMER';
  const isWorker = session?.role === 'WORKER';
  const myAssignment = job.assignments?.find((a) => a.worker?.user?.name === session?.name);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold font-geist border ${
            job.status === 'OPEN'
              ? 'bg-[#ecfdf5] text-[#0d9488] border-[#a7f3d0]'
              : 'bg-[#eff6ff] text-[#0051d5] border-[#bfdbfe]'
          }`}
        >
          Status: {job.status}
        </span>
      </div>

      {/* Main Job Card */}
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
                {job.address?.city ? `${job.address.address}, ${job.address.city}` : 'Chandigarh'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0d9488]" />
                {job.preferredDate || new Date(job.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#6366f1]" />
                {job.requiredWorkers || 1} Specialist{(job.requiredWorkers || 1) > 1 ? 's' : ''} Needed
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2e8f0] text-left sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block font-geist">
              Budget Estimate
            </span>
            <span className="font-geist font-extrabold text-xl text-[#091426]">
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

          {job.customer?.userId && (
            <Link
              href={`/messages?userId=${job.customer.userId}`}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#e2e8f0] hover:bg-[#eff6ff] hover:border-[#bfdbfe] text-xs font-bold text-[#0051d5] flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contact Customer</span>
            </Link>
          )}
        </div>

        {/* Active Assignments status if already assigned */}
        {job.assignments && job.assignments.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0051d5]" />
                <h4 className="text-xs font-bold text-[#0051d5]">Assigned Specialists</h4>
              </div>
              <span className="text-[10px] font-bold text-[#0051d5] bg-white px-2 py-0.5 rounded-full border border-[#bfdbfe]">
                {job.assignments.length} / {job.requiredWorkers || 1} Hired
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white p-3 rounded-xl border border-[#dbeafe] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0051d5] text-white font-bold flex items-center justify-center text-xs">
                      {assignment.worker?.user?.name?.[0] || 'W'}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#091426]">
                        {assignment.worker?.user?.name || 'Assigned Specialist'}
                      </h5>
                      <span className="text-[10px] text-[#0d9488] font-bold font-geist">
                        {assignment.status}
                      </span>
                    </div>
                  </div>

                  {isCustomerPoster && (
                    <Link
                      href={`/bookings/${assignment.id}/track`}
                      className="px-3 py-1.5 bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#0051d5] text-[11px] font-bold rounded-lg border border-[#e2e8f0]"
                    >
                      Track
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* If current worker is assigned, show team invite option */}
            {myAssignment && (
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={`/worker/jobs/${myAssignment.id}`}
                  className="px-4 py-2 bg-[#0051d5] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#0042b0]"
                >
                  Go to Job Execution Console
                </Link>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-white text-[#091426] border border-[#e2e8f0] rounded-xl text-xs font-bold hover:bg-[#f8f9ff] flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Invite Teammate to Job</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Staffing Management: View & Select Applicants */}
      {isCustomerPoster && (
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#091426]">Candidate Applicants</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#091426] text-xs font-bold font-geist">
                  {applications.length}
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
                        <p className="text-xs text-[#475569]">{app.worker?.headline}</p>

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

      {/* Worker Proposal Section */}
      {isWorker && job.status === 'OPEN' && !myAssignment && (
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#091426]">Submit Your Application & Quote</h2>
            <p className="text-xs text-[#64748b]">
              Present your proposal to the customer with your estimated price and availability.
            </p>
          </div>

          {appSuccess ? (
            <div className="p-6 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#0d9488] mx-auto" />
              <h4 className="text-sm font-bold text-[#091426]">Application Submitted!</h4>
              <p className="text-xs text-[#0d9488]">
                The customer has received your proposal and will review it shortly.
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
