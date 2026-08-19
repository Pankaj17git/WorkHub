'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
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
  Star
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';
import StatusTimeline from '@/components/booking/StatusTimeline';
import PriceTag from '@/components/ui/PriceTag';

export default function BookingTrackPage() {
  const params = useParams();
  const proId = (params.id as string) || 'pro-1';
  const pro = MOCK_PROS.find((p) => p.id === proId) || MOCK_PROS[0];

  const [status, setStatus] = useState<'CONFIRMED' | 'PRO_ASSIGNED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED'>('ON_THE_WAY');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#64748b]">Order:</span>
          <span className="font-geist font-bold text-xs text-[#091426] bg-[#f1f5f9] px-2.5 py-1 rounded-md border border-[#e2e8f0]">
            #WH-784920
          </span>
        </div>
      </div>

      {/* Live Map & ETA Header Banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-sm">
        
        {/* Simulated Map Display */}
        <div className="h-56 sm:h-64 relative bg-[#1e293b] flex items-center justify-center overflow-hidden">
          {/* Map roads simulation overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Route path graphic */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="flex items-center gap-6 sm:gap-12">
              
              {/* Pro Marker */}
              <div className="flex flex-col items-center animate-bounce">
                <div className="w-12 h-12 rounded-full bg-[#0051d5] border-2 border-white shadow-xl flex items-center justify-center text-white">
                  <Navigation className="w-6 h-6 rotate-45" />
                </div>
                <span className="mt-1.5 px-2 py-0.5 rounded-md bg-[#091426] text-white text-[10px] font-bold font-geist">
                  Rahul (1.2 km away)
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
                  Your Home (Sec 35-C)
                </span>
              </div>

            </div>

            <div className="px-4 py-1.5 rounded-full bg-[#091426]/90 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Estimated Arrival in <strong className="text-[#38bdf8] font-geist">12 mins</strong></span>
            </div>
          </div>
        </div>

        {/* Assigned Pro Contact Card */}
        <div className="p-6 bg-[#ffffff] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pro.avatar}
              alt={pro.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#e2e8f0]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#091426]">{pro.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#0d9488] text-[10px] font-bold font-geist border border-[#a7f3d0]">
                  Verified
                </span>
              </div>
              <p className="text-xs text-[#64748b]">{pro.title}</p>
              <div className="text-[11px] text-[#475569] font-geist mt-0.5">
                ★ 4.94 (184 reviews) • 520+ jobs completed
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
            <button
              onClick={() => alert('Live chat connected with Rahul Sharma.')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#091426] text-xs font-semibold border border-[#e2e8f0] flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Simulation Controls */}
      <div className="bg-[#f0f4ff] border border-[#dbeafe] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-[#0051d5] flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          <span>Interactive Status Simulator:</span>
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['CONFIRMED', 'PRO_ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-geist transition-all ${
                status === st
                  ? 'bg-[#0051d5] text-white shadow-xs'
                  : 'bg-white text-[#475569] border border-[#cbd5e1] hover:bg-[#f8f9ff]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Status Timeline + Security Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left: Progress Stepper (2 cols) */}
        <div className="md:col-span-2 bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-[#091426]">Live Milestone Progress</h3>
          <StatusTimeline currentStatus={status} />
        </div>

        {/* Right: Security PIN & Safety Code (1 col) */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Security PIN */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] font-geist">
                Service Start PIN
              </h4>
              <div className="text-3xl font-extrabold font-geist text-[#0051d5] tracking-widest py-1">
                4829
              </div>
              <p className="text-[11px] text-[#64748b] leading-tight">
                Share this 4-digit code with Rahul only when he arrives at your doorstep.
              </p>
            </div>
          </div>

          {/* Job Rate & Review trigger if completed */}
          {status === 'COMPLETED' ? (
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#0d9488] mx-auto" />
              <h4 className="text-sm font-bold text-[#065f46]">Service Completed!</h4>
              <p className="text-xs text-[#047857]">
                Please rate your experience with Rahul to release the verified guarantee badge.
              </p>
              <Link
                href={`/bookings/${pro.id}/review`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>Rate Your Experience</span>
              </Link>
            </div>
          ) : (
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#091426]">
                <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
                <span>WorkHub Safety Pledge</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                If the service takes longer than expected or you notice any quality issues, you can pause or raise a support ticket directly from the app.
              </p>
              <Link
                href={`/bookings/${pro.id}/review`}
                className="text-xs font-semibold text-[#0051d5] hover:underline block pt-1"
              >
                Go to Review Screen (Preview) &rarr;
              </Link>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
