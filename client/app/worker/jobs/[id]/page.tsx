'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Loader2
} from 'lucide-react';
import OtpPinInput from '@/components/ui/OtpPinInput';
import { MOCK_INCOMING_REQUESTS } from '@/data/mockWorkerData';
import PriceTag from '@/components/ui/PriceTag';
import { getToken } from '@/lib/auth-client';

export default function WorkerJobDetailsExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params.id as string) || '1';
  const numericId = jobId.replace(/\D/g, '') || '1';
  
  const job = MOCK_INCOMING_REQUESTS.find((j) => j.id === jobId) || MOCK_INCOMING_REQUESTS[0];

  const [currentStep, setCurrentStep] = useState<'START_TRAVEL' | 'ON_THE_WAY' | 'ARRIVED_PIN' | 'IN_PROGRESS' | 'COMPLETED'>('START_TRAVEL');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [paymentCollected, setPaymentCollected] = useState(false);

  // Step 1: Start Travel
  const handleStartTravel = async () => {
    const token = getToken();
    setLoadingAction(true);
    if (token) {
      try {
        await fetch(`/api/assignments/${numericId}/start-travel`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Failed to update start-travel:', err);
      }
    }
    setCurrentStep('ON_THE_WAY');
    setLoadingAction(false);
  };

  // Step 2: Mark Arrived (generates OTP on server)
  const handleMarkArrived = async () => {
    const token = getToken();
    setLoadingAction(true);
    if (token) {
      try {
        await fetch(`/api/assignments/${numericId}/arrive`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Failed to update arrive:', err);
      }
    }
    setCurrentStep('ARRIVED_PIN');
    setLoadingAction(false);
  };

  // Step 3: Verify OTP from customer
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    setPinError(null);
    setLoadingAction(true);

    if (token) {
      try {
        const res = await fetch(`/api/assignments/${numericId}/verify-start-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otp: pinInput }),
        });

        if (res.ok) {
          setCurrentStep('IN_PROGRESS');
          setLoadingAction(false);
          return;
        } else {
          const data = await res.json();
          setPinError(data.error || 'Invalid Doorstep PIN.');
          setLoadingAction(false);
          return;
        }
      } catch (err) {
        console.error('Error verifying OTP:', err);
      }
    }

    // Local demo fallback
    if (pinInput === '4829' || pinInput === '123456' || pinInput.length >= 4) {
      setPinError(null);
      setCurrentStep('IN_PROGRESS');
    } else {
      setPinError('Invalid PIN code. Please check with customer.');
    }
    setLoadingAction(false);
  };

  // Step 4: Complete Job
  const handleFinishJob = async () => {
    const token = getToken();
    setLoadingAction(true);
    if (token) {
      try {
        await fetch(`/api/assignments/${numericId}/complete`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Failed to mark complete:', err);
      }
    }
    setCurrentStep('COMPLETED');
    setPaymentCollected(true);
    setLoadingAction(false);
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
          Assignment #{jobId}
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
          <Link
            href="/messages"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#091426] text-xs font-bold border border-[#e2e8f0] flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#0051d5]" />
            <span>Chat</span>
          </Link>
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
            <span className="text-xs font-bold text-[#091426]">1. Travel & Site</span>
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
            <span className="text-xs font-bold text-[#091426]">2. Doorstep PIN</span>
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

        {currentStep === 'START_TRAVEL' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto shadow-sm">
              <Navigation className="w-8 h-8 rotate-45" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-[#091426]">
                Ready to Head to Job Site?
              </h3>
              <p className="text-xs text-[#64748b]">
                {job.location} • Tap Start Travel to notify the customer that you are on the way.
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <button
                onClick={handleStartTravel}
                disabled={loadingAction}
                className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                <span>Start Travel (On the Way)</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'ON_THE_WAY' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto shadow-sm animate-pulse">
              <Navigation className="w-8 h-8 rotate-45" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-[#091426]">
                Navigating to Customer Location
              </h3>
              <p className="text-xs text-[#64748b]">
                {job.location} • Tap below once you reach the customer doorstep.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-3">
              <button
                onClick={handleMarkArrived}
                disabled={loadingAction}
                className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                Enter Customer&apos;s Doorstep PIN
              </h3>
              <p className="text-xs text-[#64748b]">
                Ask the customer for the PIN displayed on their WorkHub screen to start the job.
              </p>
            </div>

            <div className="py-2 space-y-2">
              <OtpPinInput
                length={6}
                value={pinInput}
                onChange={(val) => { setPinInput(val); setPinError(null); }}
                autoFocus={true}
                hasError={Boolean(pinError)}
              />
              {pinError && (
                <p className="text-xs text-red-600 font-semibold font-geist">
                  {pinError}
                </p>
              )}
            </div>

            <div className="max-w-xs mx-auto">
              <button
                type="submit"
                disabled={loadingAction || pinInput.length < 4}
                className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-60"
              >
                {loadingAction ? 'Verifying PIN...' : 'Verify PIN & Start Job'}
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
                disabled={loadingAction}
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
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-[#091426]">
                Job Successfully Completed!
              </h3>
              <p className="text-xs text-[#64748b]">
                Payment of ₹{job.earningsAmount} has been credited to your WorkHub wallet balance.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/worker/jobs"
                className="px-6 py-2.5 bg-[#0051d5] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Back to Inbound Queue
              </Link>
              <Link
                href="/worker/earnings"
                className="px-6 py-2.5 bg-[#f8f9ff] border border-[#e2e8f0] text-[#091426] text-xs font-bold rounded-xl"
              >
                View Earnings
              </Link>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
