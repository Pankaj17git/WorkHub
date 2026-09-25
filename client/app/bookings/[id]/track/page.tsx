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
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Star,
  Sparkles,
  X
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';
import StatusTimeline from '@/components/booking/StatusTimeline';
import { getToken } from '@/lib/auth-client';

export default function BookingTrackPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params.id as string) || '1';
  const numericId = rawId.replace(/\D/g, '') || '1';
  const pro = MOCK_PROS[0];

  const [status, setStatus] = useState<'CONFIRMED' | 'PRO_ASSIGNED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'>('ON_THE_WAY');
  const [doorstepOtp, setDoorstepOtp] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  // Poll Doorstep OTP if status is ARRIVED or ON_THE_WAY
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function checkOtp() {
      try {
        const res = await fetch(`/api/assignments/${numericId}/doorstep-otp`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const payload = data.data || data;
          if (payload.otp) {
            setDoorstepOtp(payload.otp);
          }
          if (payload.status) {
            setStatus(payload.status);
          }
        }
      } catch (err) {
        // demo fallback
      }
    }

    checkOtp();
    const timer = setInterval(checkOtp, 8000);
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
          setTimeout(() => router.push('/jobs/my-jobs'), 1500);
          return;
        }
      } catch (err) {
        console.error('Cancel failed:', err);
      }
    }

    setCancelMessage('Booking cancelled.');
    setCancelling(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/jobs/my-jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Bookings</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64748b]">Booking Ref:</span>
          <span className="font-geist font-bold text-xs text-[#091426] bg-[#f1f5f9] px-2.5 py-1 rounded-md border border-[#e2e8f0]">
            #{numericId}
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
        <div className="h-56 sm:h-64 relative bg-[#1e293b] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="flex items-center gap-6 sm:gap-12">
              
              {/* Pro Marker */}
              <div className="flex flex-col items-center animate-bounce">
                <div className="w-12 h-12 rounded-full bg-[#0051d5] border-2 border-white shadow-xl flex items-center justify-center text-white">
                  <Navigation className="w-6 h-6 rotate-45" />
                </div>
                <span className="mt-1.5 px-2 py-0.5 rounded-md bg-[#091426] text-white text-[10px] font-bold font-geist">
                  Specialist En Route
                </span>
              </div>

              {/* Connecting dashed line */}
              <div className="w-20 sm:w-32 border-t-2 border-dashed border-[#38bdf8]" />

              {/* Destination Marker */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#0d9488] border-2 border-white shadow-xl flex items-center justify-center text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="mt-1.5 px-2 py-0.5 rounded-md bg-[#091426] text-white text-[10px] font-bold font-geist">
                  Your Home
                </span>
              </div>

            </div>

            <div className="px-4 py-1.5 rounded-full bg-[#091426]/90 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Status: <strong className="text-[#38bdf8] font-geist">{status}</strong></span>
            </div>
          </div>
        </div>

        {/* Assigned Specialist Details Header Card */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pro.avatar}
              alt={pro.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#e2e8f0]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#091426]">{pro.name}</h2>
                <div className="flex items-center gap-1 text-[11px] text-[#0d9488] font-bold font-geist bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Partner</span>
                </div>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">{pro.title}</p>
              <div className="flex items-center gap-2 text-xs text-[#64748b] mt-1 font-geist">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{pro.rating} ({pro.reviewCount} verified reviews)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href="tel:+919876543210"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Specialist</span>
            </a>
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

      {/* Main Grid: Status Timeline + Security Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left: Progress Stepper (2 cols) */}
        <div className="md:col-span-2 bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#091426]">Live Milestone Progress</h3>
            <span className="text-xs font-bold font-geist text-[#0051d5] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-[#bfdbfe]">
              {status}
            </span>
          </div>
          <StatusTimeline currentStatus={status as any} />

          {status === 'COMPLETED' && (
            <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#091426]">Job Complete!</h4>
                <p className="text-[11px] text-[#0d9488]">Help fellow customers by rating your experience.</p>
              </div>
              <Link
                href={`/bookings/${numericId}/review`}
                className="px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
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
            <span className="text-[11px] text-[#94a3b8]">24/7 Support Hotline Available</span>
          </div>
        </div>

        {/* Right: Security PIN & Safety Code (1 col) */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Security PIN */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#091426]">Doorstep Verification Code</h4>
              <p className="text-[11px] text-[#64748b]">
                Share this secure PIN with the specialist upon arrival to verify and begin service.
              </p>
            </div>

            <div className="py-2">
              <div className="inline-block px-5 py-2.5 rounded-xl bg-[#091426] text-white font-geist font-extrabold text-2xl tracking-widest shadow-sm">
                {doorstepOtp || '482910'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] text-[#0d9488] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Never share PIN over phone</span>
            </div>
          </div>

          {/* Job Summary */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-[#091426] uppercase text-[10px] tracking-wider text-[#64748b] font-geist">
              Booking Overview
            </h4>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b]">Service</span>
              <span className="font-semibold text-[#091426]">Electrical Diagnostics</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
              <span className="text-[#64748b]">Address</span>
              <span className="font-semibold text-[#091426]">Sector 35-C, Chandigarh</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748b]">Total Payable</span>
              <span className="font-bold text-[#0051d5] font-geist">₹599</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
