'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Phone, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Briefcase,
  KeyRound
} from 'lucide-react';
import OtpPinInput from '@/components/ui/OtpPinInput';

export default function WorkerLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/worker/dashboard');
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#091426] to-[#0051d5] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
          W<span className="text-[#38bdf8]">H</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0fdfa] text-[#0d9488] text-[11px] font-bold font-geist border border-[#ccfbf1]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Professional Partner Portal</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#091426] tracking-tight">
          Pro Partner Sign In
        </h1>
        <p className="text-xs text-[#64748b]">
          Enter your registered mobile number and security PIN to access your job requests and payouts.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Registered Mobile Number</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-geist text-[#64748b]">
                +91
              </span>
              <input
                type="tel"
                required
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] font-geist"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>4-Digit Security PIN</span>
              </label>
              <a href="#" className="text-[11px] text-[#0051d5] hover:underline font-semibold">
                Forgot PIN?
              </a>
            </div>
            
            <div className="py-1 space-y-1.5">
              <OtpPinInput
                length={4}
                value={pin}
                onChange={setPin}
                isMasked={true}
                autoFocus={false}
              />
              <span className="text-[11px] text-[#64748b] block text-center">
                (Demo PIN: <strong>4829</strong>)
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || pin.length < 4}
            className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Access Partner Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#64748b]">
          New service professional in Chandigarh?{' '}
          <Link href="/worker/signup" className="text-[#0051d5] font-bold hover:underline">
            Register as Pro Partner &rarr;
          </Link>
        </div>

      </div>

      {/* Back to Customer Marketplace */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-xs text-[#64748b] hover:text-[#091426] font-semibold transition-colors"
        >
          &larr; Are you a customer looking to book a service? Click here
        </Link>
      </div>

    </div>
  );
}
