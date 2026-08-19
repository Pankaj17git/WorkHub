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
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Queue</span>
        </Link>
        <span className="text-xs font-bold font-geist text-[#091426] bg-[#f1f5f9] px-2.5 py-1 rounded-md border border-[#e2e8f0]">
          Job Reference #{job.id}
        </span>
      </div>

      {/* Customer Info Card */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={job.customerAvatar}
            alt={job.customerName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#e2e8f0]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#091426]">{job.customerName}</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#0051d5] text-xs font-bold font-geist border border-[#bfdbfe]">
                {job.serviceCategory}
              </span>
            </div>
            <p className="text-xs text-[#475569] font-medium mt-0.5">{job.serviceName}</p>
            <div className="flex items-center gap-2 text-xs text-[#64748b] mt-1 font-geist">
              <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>

        {/* Customer Call & Chat Action buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href={`tel:${job.customerPhone}`}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Customer</span>
          </a>
          <button
            onClick={() => alert(`Live chat opened with ${job.customerName}.`)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#091426] text-xs font-bold border border-[#e2e8f0] flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* Execution Stepper Container */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Milestone State Indicator */}
        <div className="flex items-center justify-between pb-6 border-b border-[#e2e8f0] overflow-x-auto gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-geist ${
                ['ON_THE_WAY', 'ARRIVED_PIN', 'IN_PROGRESS', 'COMPLETED'].includes(currentStep)
                  ? 'bg-[#0051d5] text-white'
                  : 'bg-[#f1f5f9] text-[#64748b]'
              }`}
            >
              1
            </span>
            <span className="text-xs font-bold text-[#091426]">1. On the Way</span>
          </div>

          <span className="w-8 h-px bg-[#e2e8f0] shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-geist ${
                ['ARRIVED_PIN', 'IN_PROGRESS', 'COMPLETED'].includes(currentStep)
                  ? 'bg-[#0051d5] text-white'
                  : 'bg-[#f1f5f9] text-[#64748b]'
              }`}
            >
              2
            </span>
            <span className="text-xs font-bold text-[#091426]">2. Verify Customer PIN</span>
          </div>

          <span className="w-8 h-px bg-[#e2e8f0] shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-geist ${
                ['IN_PROGRESS', 'COMPLETED'].includes(currentStep)
                  ? 'bg-[#0051d5] text-white'
                  : 'bg-[#f1f5f9] text-[#64748b]'
              }`}
            >
              3
            </span>
            <span className="text-xs font-bold text-[#091426]">3. In Progress</span>
          </div>

          <span className="w-8 h-px bg-[#e2e8f0] shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-geist ${
                currentStep === 'COMPLETED'
                  ? 'bg-[#0d9488] text-white'
                  : 'bg-[#f1f5f9] text-[#64748b]'
              }`}
            >
              4
            </span>
            <span className="text-xs font-bold text-[#091426]">4. Finished</span>
          </div>
        </div>

        {/* Dynamic Action Section based on currentStep */}

        {currentStep === 'ON_THE_WAY' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto shadow-sm">
              <Navigation className="w-8 h-8 rotate-45" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-[#091426]">
                Navigating to Customer Location
              </h3>
              <p className="text-xs text-[#64748b]">
                {job.location} • Estimated travel time 12 mins.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-3">
              <button
                onClick={() => setCurrentStep('ARRIVED_PIN')}
                className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Have Arrived at Location</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'ARRIVED_PIN' && (
          <form onSubmit={handleVerifyPin} className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-[#091426]">
                Enter Customer&apos;s 4-Digit Service PIN
              </h3>
              <p className="text-xs text-[#64748b]">
                Ask Amit for the 4-digit PIN displayed on his WorkHub screen to start the job.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                placeholder="4829"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                className={`w-full text-center tracking-[1em] text-2xl font-bold font-geist py-3 px-4 bg-[#f8f9ff] border-2 rounded-xl focus:outline-none ${
                  pinError ? 'border-red-500 bg-red-50' : 'border-[#0051d5]'
                }`}
              />
              {pinError && (
                <p className="text-xs text-red-600 font-medium">
                  Invalid PIN. (Hint: Customer PIN is 4829)
                </p>
              )}
              <span className="text-[11px] text-[#64748b] block">
                (Demo Customer PIN: <strong>4829</strong>)
              </span>
            </div>

            <div className="max-w-xs mx-auto">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Verify PIN & Start Job
              </button>
            </div>
          </form>
        )}

        {currentStep === 'IN_PROGRESS' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#f0fdfa] border border-[#ccfbf1] text-[#0d9488] flex items-center justify-center mx-auto shadow-sm animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-[#091426]">
                Service In Progress
              </h3>
              <p className="text-xs text-[#64748b]">
                Performing {job.serviceName}. Perform full testing and safety checks before completion.
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <button
                onClick={handleFinishJob}
                className="w-full py-3.5 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Job as Completed</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'COMPLETED' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#0d9488] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-2xl font-extrabold text-[#091426]">
                Job Successfully Completed!
              </h3>
              <p className="text-xs sm:text-sm text-[#475569]">
                ₹{job.earningsAmount} has been credited to your WorkHub Wallet balance.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/worker/earnings"
                className="px-6 py-2.5 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                View Earnings Balance
              </Link>
              <Link
                href="/worker/jobs"
                className="px-6 py-2.5 bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#091426] text-xs font-bold rounded-xl border border-[#e2e8f0] transition-colors"
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
