'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  ArrowRight, 
  Download,
  Share2,
  KeyRound
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';
import PriceTag from '@/components/ui/PriceTag';

export default function BookingSuccessPage() {
  const params = useParams();
  const proId = (params.id as string) || 'pro-1';
  const pro = MOCK_PROS.find((p) => p.id === proId) || MOCK_PROS[0];

  const bookingId = 'WH-784920';
  const startOtp = '4829';

  return (
    <div
      className="min-h-screen bg-[#f4eee4]"
      style={{ fontFamily: 'var(--gesso-font-body)' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Success Badge Banner */}
        <div className="bg-[#ffffff] rounded-xl p-8 sm:p-10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[rgba(20,147,67,0.1)] text-[#149343] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#149343]">
              Booking Confirmed & Guaranteed
            </span>
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#2a2a2a]"
              style={{ fontFamily: 'var(--gesso-font-display)' }}
            >
              You&apos;re All Set, Amit!
            </h1>
            <p className="text-xs sm:text-sm text-[#606060] max-w-md mx-auto">
              Your appointment has been reserved with {pro.name}. A confirmation SMS & WhatsApp invoice have been sent.
            </p>
          </div>

          {/* Reference & OTP Pill */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="px-4 py-2 bg-[#eae4db] rounded-xl text-xs text-[#2a2a2a]">
              <span className="text-[#606060]">Booking ID: </span>
              <strong className="text-sm">{bookingId}</strong>
            </div>
            
            <div className="px-4 py-2 bg-[rgba(59,130,246,0.1)] rounded-xl text-xs text-[#2f68c5] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Service Start PIN: </span>
              <strong className="text-sm">{startOtp}</strong>
            </div>
          </div>
        </div>

        {/* Appointment Summary Box */}
        <div className="bg-[#ffffff] rounded-xl p-6 space-y-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#606060]">
            Appointment Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#eae4db]">
              <Calendar className="w-4 h-4 text-[#2f68c5] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-[#606060] block">Scheduled Date & Slot</span>
                <strong className="text-[#2a2a2a] text-sm">Wed, 19 Aug 2026</strong>
                <div className="text-[#606060] mt-0.5">10:30 AM - 11:30 AM</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#eae4db]">
              <MapPin className="w-4 h-4 text-[#2f68c5] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-[#606060] block">Service Location</span>
                <strong className="text-[#2a2a2a] text-sm">House # 1422, Sector 35-C</strong>
                <div className="text-[#606060] mt-0.5">Chandigarh, 160036</div>
              </div>
            </div>
          </div>

          {/* Assigned Pro Card */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#f4eee4]">
            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pro.avatar}
                alt={pro.name}
                className="w-12 h-12 rounded-xl object-cover border border-black/5"
              />
              <div>
                <h4 className="text-sm font-bold text-[#2a2a2a]">{pro.name}</h4>
                <p className="text-xs text-[#606060]">{pro.title}</p>
                <div className="flex items-center gap-1 text-[11px] text-[#149343] font-medium mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified & Background Checked
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#606060] block">Estimated Total</span>
              <PriceTag amount={538} size="md" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={`/bookings/${pro.id}/track`}
              className="whl-btn whl-btn-primary w-full sm:flex-1 py-3 px-4 text-sm"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/"
              className="whl-btn whl-btn-outline w-full sm:w-auto py-3 px-5 text-sm"
            >
              Go to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
