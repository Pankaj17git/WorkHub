'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Phone, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Briefcase,
  ShoppingBag,
  KeyRound
} from 'lucide-react';
import OtpPinInput from '@/components/ui/OtpPinInput';

export default function LoginPage() {
  const router = useRouter();

  // Role toggle: 'CUSTOMER' | 'WORKER'
  const [role, setRole] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');

  // Customer state
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  // Worker state
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerPin, setWorkerPin] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setOtpSent(true);
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/');
    }, 800);
  };

  const handleWorkerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (workerPin.length < 4) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/worker/dashboard');
    }, 800);
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4 sm:px-6 space-y-6">
      
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#091426] to-[#0051d5] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
          W<span className="text-[#38bdf8]">H</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
          Sign In to WorkHub
        </h1>
        <p className="text-xs text-[#64748b] max-w-sm mx-auto">
          Please select whether you are signing in as a Customer or a Service Professional.
        </p>
      </div>

      {/* Explicit Role Chooser Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#64748b] font-geist block text-center">
          Step 1: Choose Your Account Role
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          
          {/* Customer Option */}
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              role === 'CUSTOMER'
                ? 'border-[#0051d5] bg-[#eff6ff] ring-2 ring-[#0051d5]/20 shadow-xs'
                : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#0051d5] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              {role === 'CUSTOMER' && (
                <span className="w-5 h-5 rounded-full bg-[#0051d5] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <strong className="text-sm font-bold text-[#091426] block">
                Customer Sign In
              </strong>
              <span className="text-[11px] text-[#64748b] leading-tight block mt-0.5">
                Manage your home bookings & tracking
              </span>
            </div>
          </button>

          {/* Worker Option */}
          <button
            type="button"
            onClick={() => setRole('WORKER')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              role === 'WORKER'
                ? 'border-[#0d9488] bg-[#f0fdfa] ring-2 ring-[#0d9488]/20 shadow-xs'
                : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#0d9488] text-white flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              {role === 'WORKER' && (
                <span className="w-5 h-5 rounded-full bg-[#0d9488] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <strong className="text-sm font-bold text-[#091426] block">
                Pro Partner Sign In
              </strong>
              <span className="text-[11px] text-[#64748b] leading-tight block mt-0.5">
                Access job requests, wallet & earnings
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {role === 'CUSTOMER' ? (
          <>
            {/* Customer Authentication */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <span className="text-xs font-bold text-[#0051d5] flex items-center gap-1.5 font-geist uppercase">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Customer Login</span>
              </span>
              
              {/* Method Switcher Tabs */}
              <div className="flex items-center p-1 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('PHONE'); setOtpSent(false); }}
                  className={`px-2.5 py-1 text-[11px] font-bold font-geist rounded-md transition-all ${
                    authMethod === 'PHONE'
                      ? 'bg-[#ffffff] text-[#091426] shadow-xs'
                      : 'text-[#64748b] hover:text-[#091426]'
                  }`}
                >
                  Phone OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('EMAIL'); setOtpSent(false); }}
                  className={`px-2.5 py-1 text-[11px] font-bold font-geist rounded-md transition-all ${
                    authMethod === 'EMAIL'
                      ? 'bg-[#ffffff] text-[#091426] shadow-xs'
                      : 'text-[#64748b] hover:text-[#091426]'
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            {authMethod === 'PHONE' ? (
              !otpSent ? (
                /* Customer Phone Form */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#0051d5]" />
                      <span>Mobile Phone Number</span>
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

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Customer OTP Form */
                <form onSubmit={handleCustomerLogin} className="space-y-6 text-center">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#091426]">Enter 4-Digit Verification Code</h3>
                    <p className="text-xs text-[#64748b]">
                      Sent via SMS to <strong className="text-[#091426] font-geist">+91 {phone}</strong>
                    </p>
                  </div>

                  <div className="py-2 space-y-2">
                    <OtpPinInput
                      length={4}
                      value={otpValue}
                      onChange={setOtpValue}
                      autoFocus={true}
                    />
                    <span className="text-[11px] text-[#64748b] block">
                      (Demo OTP: <strong>4829</strong>)
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpValue.length < 4}
                    className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? 'Signing In...' : 'Verify & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-[#0051d5] font-semibold hover:underline block mx-auto pt-1"
                  >
                    &larr; Change Phone Number
                  </button>
                </form>
              )
            ) : (
              /* Customer Email Form */
              <form onSubmit={handleCustomerLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In with Email'}
                </button>
              </form>
            )}

            <div className="pt-2 text-center text-xs text-[#64748b]">
              New customer on WorkHub?{' '}
              <Link href="/signup" className="text-[#0051d5] font-bold hover:underline">
                Create Customer Account
              </Link>
            </div>
          </>
        ) : (
          /* Worker Pro Authentication Form */
          <>
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <span className="text-xs font-bold text-[#0d9488] flex items-center gap-1.5 font-geist uppercase">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Professional Partner Login</span>
              </span>
              <span className="text-[10px] font-bold font-geist text-[#0d9488] bg-[#f0fdfa] px-2 py-0.5 rounded border border-[#ccfbf1]">
                Verified Pros Only
              </span>
            </div>

            <form onSubmit={handleWorkerLogin} className="space-y-5">
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
                    value={workerPhone}
                    onChange={(e) => setWorkerPhone(e.target.value)}
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
                    value={workerPin}
                    onChange={setWorkerPin}
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
                disabled={isSubmitting || workerPin.length < 4}
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
              New service provider in Chandigarh?{' '}
              <Link href="/worker/signup" className="text-[#0d9488] font-bold hover:underline">
                Register as Pro Partner &rarr;
              </Link>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
