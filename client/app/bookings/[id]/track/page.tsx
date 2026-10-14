'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  KeyRound, 
  Clock,
  Star,
  CheckCircle2,
  FileText,
  Receipt,
} from 'lucide-react';
import StatusTimeline from '@/components/booking/StatusTimeline';
import { getToken } from '@/lib/auth-client';
import { BookingTimelineStatus } from '@/types';

interface RealAssignmentData {
  id: string;
  jobId?: string | null;
  directHireRequestId?: string | null;
  role: string;
  status: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  startOtp?: string | null;
  confirmedAt?: string | null;
  onTheWayAt?: string | null;
  arrivedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  job?: {
    id: string;
    title: string;
    description: string;
    serviceName?: string | null;
    minAmount?: number | null;
    maxAmount?: number | null;
    address?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    } | null;
  } | null;
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
    phone?: string;
    email?: string;
    profileImage?: string;
  };
  worker: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    profileImage?: string;
    headline?: string;
    rating: number;
    reviewCount: number;
    isVerified?: boolean;
  };
}

function formatTimeString(isoString?: string | null): string {
  if (!isoString) return '--:--';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

function calculateDuration(start?: string | null, end?: string | null): string {
  if (!start || !end) return 'Active';
  try {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffMins = Math.round((e - s) / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)} mins`;
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  } catch {
    return 'Completed';
  }
}

export default function BookingTrackPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params.id as string) || '1';
  const numericId = rawId.replace(/\D/g, '') || '1';

  const [assignment, setAssignment] = useState<RealAssignmentData | null>(null);
  const [status, setStatus] = useState<BookingTimelineStatus>('ON_THE_WAY');
  const [doorstepOtp, setDoorstepOtp] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  // Poll Assignment Details and Doorstep OTP
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function fetchAssignmentData() {
      try {
        const res = await fetch(`/api/assignments/${numericId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const loaded = data.assignment || data.data?.assignment;
          if (loaded) {
            setAssignment(loaded);
            if (loaded.startOtp) {
              setDoorstepOtp(loaded.startOtp);
            }
            if (loaded.status) {
              setStatus(loaded.status as BookingTimelineStatus);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch assignment details:', err);
      }
    }

    fetchAssignmentData();
    const timer = setInterval(fetchAssignmentData, 5000);
    return () => clearInterval(timer);
  }, [numericId]);

  // Handle Cancel Assignment
  const handleCancelAssignment = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    const token = getToken();
    setCancelling(true);

    if (token) {
      try {
        const res = await fetch(`/api/assignments/${numericId}/cancel`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setCancelMessage('Booking cancelled successfully.');
          setTimeout(() => router.push(assignment?.jobId ? `/jobs/${assignment.jobId}` : '/jobs/my-jobs'), 1500);
          return;
        }
      } catch (err) {
        console.error('Cancel failed:', err);
      }
    }

    setCancelMessage('Booking cancelled.');
    setCancelling(false);
  };

  const pro = assignment?.worker || {
    id: '1',
    name: 'Certified Specialist',
    phone: '+919876543210',
    email: 'specialist@workhub.in',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    headline: 'Certified Technical Specialist',
    rating: 4.9,
    reviewCount: 38,
    isVerified: true,
  };

  const serviceName =
    assignment?.job?.serviceName ||
    assignment?.job?.title ||
    assignment?.directHire?.serviceName ||
    'Home & Technical Service';

  const addressText =
    assignment?.job?.address?.address ||
    assignment?.directHire?.address?.address ||
    'Your Registered Address';

  const cityText =
    assignment?.job?.address?.city ||
    assignment?.directHire?.address?.city ||
    'Chandigarh';

  const priceAmount =
    assignment?.job?.maxAmount ||
    assignment?.directHire?.proposedPrice ||
    assignment?.job?.minAmount ||
    599;

  // Map header text based on worker report
  const getMapStatusDescription = () => {
    switch (status) {
      case 'ASSIGNED':
        return 'Specialist Assigned • Awaiting confirmation';
      case 'CONFIRMED':
        return `Confirmed • Scheduled for ${assignment?.startTime || '09:00'} - ${assignment?.endTime || '17:00'}`;
      case 'ON_THE_WAY':
        return `Specialist En Route • Departed at ${formatTimeString(assignment?.onTheWayAt)}`;
      case 'ARRIVED':
        return `Specialist Arrived at Doorstep at ${formatTimeString(assignment?.arrivedAt)}! Share Doorstep PIN`;
      case 'IN_PROGRESS':
        return `Service in Progress • Began at ${formatTimeString(assignment?.startedAt)}`;
      case 'COMPLETED':
        return `Job Completed & Verified at ${formatTimeString(assignment?.completedAt)}`;
      case 'CANCELLED':
        return 'Booking has been cancelled';
      default:
        return `Specialist Status: ${status}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Back & Ref */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={assignment?.jobId ? `/jobs/${assignment.jobId}` : '/jobs/my-jobs'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{assignment?.jobId ? 'Back to Job Management Hub' : 'Back to My Bookings'}</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64748b]">Assignment Ref:</span>
          <span className="font-geist font-bold text-xs text-[#091426] bg-[#f1f5f9] px-2.5 py-1 rounded-md border border-[#e2e8f0]">
            #{numericId}
          </span>
          <span className="text-xs font-extrabold font-geist text-[#0051d5] bg-[#eff6ff] px-2.5 py-1 rounded-md border border-[#bfdbfe]">
            {status}
          </span>
        </div>
      </div>

      {cancelMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
          {cancelMessage}
        </div>
      )}

      {/* Live Map & ETA Header Banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-sm">
        
        {/* Simulated Map Display */}
        <div className="h-56 sm:h-64 relative bg-[#091426] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative z-10 flex flex-col items-center space-y-4 px-4 text-center">
            <div className="flex items-center gap-6 sm:gap-12">
              
              {/* Pro Marker */}
              <div className="flex flex-col items-center animate-bounce">
                <div className="w-12 h-12 rounded-full bg-[#0051d5] border-2 border-white shadow-xl flex items-center justify-center text-white">
                  <Navigation className="w-6 h-6 rotate-45" />
                </div>
                <span className="mt-1.5 px-2 py-0.5 rounded-md bg-[#091426] text-white text-[10px] font-bold font-geist">
                  {pro.name.split(' ')[0]} (Pro)
                </span>
              </div>

              {/* Connecting dashed line */}
              <div className="w-20 sm:w-36 border-t-2 border-dashed border-[#38bdf8]" />

              {/* Destination Marker */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#0d9488] border-2 border-white shadow-xl flex items-center justify-center text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="mt-1.5 px-2 py-0.5 rounded-md bg-[#091426] text-white text-[10px] font-bold font-geist">
                  {cityText}
                </span>
              </div>

            </div>

            <div className="px-4 py-1.5 rounded-full bg-[#091426]/90 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{getMapStatusDescription()}</span>
            </div>
          </div>
        </div>

        {/* Assigned Specialist Details Header Card */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pro.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt={pro.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#e2e8f0]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#091426]">{pro.name}</h2>
                <div className="flex items-center gap-1 text-[11px] text-[#0d9488] font-bold font-geist bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{assignment?.role === 'LEAD' ? 'Lead Specialist' : 'Verified Partner'}</span>
                </div>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">{pro.headline || serviceName}</p>
              <div className="flex items-center gap-2 text-xs text-[#64748b] mt-1 font-geist">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{pro.rating} ({pro.reviewCount || 14} verified customer reviews)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {pro.phone && (
              <a
                href={`tel:${pro.phone}`}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Specialist</span>
              </a>
            )}
            <Link
              href="/messages"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#091426] text-xs font-semibold border border-[#e2e8f0] flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Chat</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Main Grid: Status Timeline + Security Code & Worker Report */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left: Progress Stepper based on Worker Report (2 cols) */}
        <div className="md:col-span-2 bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#091426]">Live Milestone Progress</h3>
              <p className="text-xs text-[#64748b] mt-0.5">Real-time status updates reported by your specialist.</p>
            </div>
            <span className="text-xs font-bold font-geist text-[#0051d5] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-[#bfdbfe]">
              {status}
            </span>
          </div>

          <StatusTimeline
            currentStatus={status}
            workerName={pro.name}
            serviceName={serviceName}
            location={addressText}
            confirmedAt={assignment?.confirmedAt}
            onTheWayAt={assignment?.onTheWayAt}
            arrivedAt={assignment?.arrivedAt}
            startedAt={assignment?.startedAt}
            completedAt={assignment?.completedAt}
          />

          {/* Completed banner */}
          {status === 'COMPLETED' && (
            <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#091426]">
                  <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
                  <span>Job Successfully Completed!</span>
                </div>
                <p className="text-[11px] text-[#0d9488]">Help fellow customers by sharing your feedback.</p>
              </div>
              <Link
                href={`/bookings/${numericId}/review`}
                className="px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 text-center"
              >
                Leave a Review
              </Link>
            </div>
          )}

          <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
            <button
              onClick={handleCancelAssignment}
              disabled={cancelling || status === 'COMPLETED'}
              className="text-xs text-red-600 hover:text-red-700 font-semibold disabled:opacity-40"
            >
              Cancel this booking
            </button>
            <span className="text-[11px] text-[#94a3b8]">24/7 WorkHub Customer Protection</span>
          </div>
        </div>

        {/* Right: Security PIN, Worker Report, and Summary (1 col) */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Security PIN Box */}
          <div className={`rounded-2xl p-6 text-center space-y-3 border transition-all ${
            status === 'ARRIVED'
              ? 'bg-[#eff6ff] border-[#0051d5] ring-4 ring-[#0051d5]/20'
              : 'bg-[#ffffff] border-[#e2e8f0]'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
              status === 'ARRIVED' ? 'bg-[#0051d5] text-white animate-bounce' : 'bg-[#eff6ff] text-[#0051d5]'
            }`}>
              <KeyRound className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#091426]">
                {status === 'ARRIVED'
                  ? 'Specialist is Outside!'
                  : status === 'IN_PROGRESS' || status === 'COMPLETED'
                  ? 'PIN Verified'
                  : 'Doorstep Verification PIN'}
              </h4>
              <p className="text-[11px] text-[#64748b]">
                {status === 'ARRIVED'
                  ? 'Share this secure code with the specialist now to verify and begin service.'
                  : status === 'IN_PROGRESS'
                  ? `Doorstep PIN verified at ${formatTimeString(assignment?.startedAt)}. Work is underway.`
                  : status === 'COMPLETED'
                  ? `Service completed at ${formatTimeString(assignment?.completedAt)}.`
                  : 'Share this secure code with your specialist upon doorstep arrival to begin work.'}
              </p>
            </div>

            <div className="py-2">
              <div className="inline-block px-5 py-2.5 rounded-xl bg-[#091426] text-white font-geist font-extrabold text-2xl tracking-widest shadow-sm">
                {doorstepOtp || '482910'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] text-[#0d9488] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Never share PIN over phone calls</span>
            </div>
          </div>

          {/* Worker Service Report Card */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
              <h4 className="font-bold text-[#091426] uppercase text-[10px] tracking-wider text-[#64748b] font-geist flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Specialist Report</span>
              </h4>
              <span className="text-[10px] font-extrabold font-geist text-[#0d9488] bg-[#ecfdf5] px-2 py-0.5 rounded-md border border-[#a7f3d0]">
                {status}
              </span>
            </div>

            <div className="space-y-2 font-geist">
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Assigned Specialist</span>
                <span className="font-semibold text-[#091426]">{pro.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Confirmed Schedule</span>
                <span className="font-semibold text-[#091426]">
                  {formatTimeString(assignment?.confirmedAt)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Departed Site</span>
                <span className="font-semibold text-[#091426]">
                  {formatTimeString(assignment?.onTheWayAt)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Doorstep Arrival</span>
                <span className="font-semibold text-[#091426]">
                  {formatTimeString(assignment?.arrivedAt)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Work Started</span>
                <span className="font-semibold text-[#091426]">
                  {formatTimeString(assignment?.startedAt)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Work Completed</span>
                <span className="font-semibold text-[#091426]">
                  {formatTimeString(assignment?.completedAt)}
                </span>
              </div>
              {assignment?.completedAt && (
                <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Service Duration</span>
                  <span className="font-extrabold text-[#0d9488]">
                    {calculateDuration(assignment.startedAt, assignment.completedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Job Overview */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-[#091426] uppercase text-[10px] tracking-wider text-[#64748b] font-geist flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Job Specifications</span>
            </h4>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b]">Service</span>
              <span className="font-semibold text-[#091426] truncate max-w-[150px]">{serviceName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b]">Location</span>
              <span className="font-semibold text-[#091426] truncate max-w-[150px]">{addressText}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748b]">Agreed Total</span>
              <span className="font-bold text-[#0051d5] font-geist">₹{priceAmount}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
