'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  MapPin,
  Navigation,
  KeyRound,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import OtpPinInput from '@/components/ui/OtpPinInput';
import { MOCK_INCOMING_REQUESTS } from '@/data/mockWorkerData';
import PriceTag from '@/components/ui/PriceTag';

export default function WorkerJobDetailsExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params.id as string) || 'job-101';

  const job = MOCK_INCOMING_REQUESTS.find((j) => j.id === jobId) || MOCK_INCOMING_REQUESTS[0];

  const [currentStep, setCurrentStep] = useState<'ON_THE_WAY' | 'ARRIVED_PIN' | 'IN_PROGRESS' | 'COMPLETED'>('ON_THE_WAY');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [paymentCollected, setPaymentCollected] = useState(false);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '4829' || pinInput === job.otp) {
      setPinError(false);
      setCurrentStep('IN_PROGRESS');
    } else {
      setPinError(true);
    }
  };

  const handleFinishJob = () => {
    setCurrentStep('COMPLETED');
    setPaymentCollected(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/worker/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#606060] hover:text-[#2a2a2a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Queue</span>
        </Link>
        <span className="text-xs font-bold text-[#2a2a2a] bg-[#f4eee4] px-2.5 py-1 rounded-md">
          Job Reference #{job.id}
        </span>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={job.customerAvatar}
            alt={job.customerName}
            className="w-16 h-16 rounded-xl object-cover border border-black/5"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2
                className="text-xl font-bold text-[#2a2a2a]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                {job.customerName}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.12)] text-[#2f68c5] text-xs font-bold">
                {job.serviceCategory}
              </span>
            </div>
            <p className="text-xs text-[#606060] font-medium mt-0.5">{job.serviceName}</p>
            <div className="flex items-center gap-2 text-xs text-[#606060] mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#2f68c5]" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>

        {/* Customer Call & Chat Action buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href={`tel:${job.customerPhone}`}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Customer</span>
          </a>
          <button
            onClick={() => alert(`Live chat opened with ${job.customerName}.`)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#f4eee4] hover:bg-[#eae4db] text-[#2a2a2a] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* Execution Stepper Container */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">

        {/* Milestone State Indicator */}
        <div className="flex items-center justify-between pb-6 border-b border-black/5 overflow-x-auto gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                ['ON_THE_WAY', 'ARRIVED_PIN', 'IN_PROGRESS', 'COMPLETED'].includes(currentStep)
                  ? 'bg-[#f5a623] text-black'
                  : 'bg-[#eae4db] text-[#606060]'
              }`}
            >
              1
            </span>
            <span className="text-xs font-bold text-[#2a2a2a]">1. On the Way</span>
          </div>

          <span className="w-8 h-px bg-black/10 shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                ['ARRIVED_PIN', 'IN_PROGRESS', 'COMPLETED'].includes(currentStep)
                  ? 'bg-[#f5a623] text-black'
                  : 'bg-[#eae4db] text-[#606060]'
              }`}
            >
              2
            </span>
            <span className="text-xs font-bold text-[#2a2a2a]">2. Verify Customer PIN</span>
          </div>

          <span className="w-8 h-px bg-black/10 shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                ['IN_PROGRESS', 'COMPLETED'].includes(currentStep)
                  ? 'bg-[#f5a623] text-black'
                  : 'bg-[#eae4db] text-[#606060]'
              }`}
            >
              3
            </span>
            <span className="text-xs font-bold text-[#2a2a2a]">3. In Progress</span>
          </div>

          <span className="w-8 h-px bg-black/10 shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 'COMPLETED'
                  ? 'bg-[#149343] text-white'
                  : 'bg-[#eae4db] text-[#606060]'
              }`}
            >
              4
            </span>
            <span className="text-xs font-bold text-[#2a2a2a]">4. Finished</span>
          </div>
        </div>

        {/* Dynamic Action Section based on currentStep */}

        {currentStep === 'ON_THE_WAY' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(59,130,246,0.12)] text-[#2f68c5] flex items-center justify-center mx-auto">
              <Navigation className="w-8 h-8 rotate-45" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3
                className="text-xl font-bold text-[#2a2a2a]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                Navigating to Customer Location
              </h3>
              <p className="text-xs text-[#606060]">
                {job.location} • Estimated travel time 12 mins.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-3">
              <button
                onClick={() => setCurrentStep('ARRIVED_PIN')}
                className="w-full py-3.5 px-4 bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Have Arrived at Location</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'ARRIVED_PIN' && (
          <form onSubmit={handleVerifyPin} className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(59,130,246,0.12)] text-[#2f68c5] flex items-center justify-center mx-auto">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3
                className="text-xl font-bold text-[#2a2a2a]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                Enter Customer&apos;s 4-Digit Service PIN
              </h3>
              <p className="text-xs text-[#606060]">
                Ask Amit for the 4-digit PIN displayed on his WorkHub screen to start the job.
              </p>
            </div>

            <div className="py-2 space-y-2">
              <OtpPinInput
                length={4}
                value={pinInput}
                onChange={(val) => { setPinInput(val); setPinError(false); }}
                autoFocus={true}
                hasError={pinError}
              />
              {pinError && (
                <p className="text-xs text-[#DC2626] font-semibold">
                  Invalid PIN. (Hint: Customer PIN is 4829)
                </p>
              )}
              <span className="text-[11px] text-[#606060] block">
                (Demo Customer PIN: <strong>4829</strong>)
              </span>
            </div>

            <div className="max-w-xs mx-auto">
              <button
                type="submit"
                disabled={pinInput.length < 4}
                className="w-full py-3.5 px-4 bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold rounded-xl transition-all disabled:opacity-60"
              >
                Verify PIN & Start Job
              </button>
            </div>
          </form>
        )}

        {currentStep === 'IN_PROGRESS' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(20,147,67,0.12)] text-[#149343] flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3
                className="text-xl font-bold text-[#2a2a2a]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                Service In Progress
              </h3>
              <p className="text-xs text-[#606060]">
                Performing {job.serviceName}. Perform full testing and safety checks before completion.
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <button
                onClick={handleFinishJob}
                className="w-full py-3.5 px-4 bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Job as Completed</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'COMPLETED' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(20,147,67,0.12)] text-[#149343] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3
                className="text-2xl font-extrabold text-[#2a2a2a]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                Job Successfully Completed!
              </h3>
              <p className="text-xs sm:text-sm text-[#606060]">
                ₹{job.earningsAmount} has been credited to your WorkHub Wallet balance.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/worker/earnings"
                className="px-6 py-2.5 bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold rounded-xl transition-colors"
              >
                View Earnings Balance
              </Link>
              <Link
                href="/worker/jobs"
                className="px-6 py-2.5 bg-[#f4eee4] hover:bg-[#eae4db] text-[#2a2a2a] text-xs font-bold rounded-xl transition-colors"
              >
                Back to Job Queue
              </Link>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
