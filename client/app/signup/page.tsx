'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  ShieldCheck,
  ArrowRight,
  Lock,
  Briefcase,
  ShoppingBag,
  AlertCircle,
  MailCheck
} from 'lucide-react';
import OtpPinInput from '@/components/ui/OtpPinInput';
import { saveSession } from '@/lib/auth-client';

type Step = 'ROLE' | 'FORM' | 'OTP';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = searchParams.get('role');

  // Role toggle: 'CUSTOMER' | 'WORKER'
  const [accountType, setAccountType] = useState<'CUSTOMER' | 'WORKER'>(
    urlRole === 'WORKER' ? 'WORKER' : 'CUSTOMER'
  );
  const [step, setStep] = useState<Step>('FORM');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otpValue, setOtpValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  useEffect(() => {
    if (urlRole === 'WORKER' || urlRole === 'CUSTOMER') {
      setAccountType(urlRole);
    }
  }, [urlRole]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Create the account
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: accountType,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setError(registerData.error || 'Registration failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // 2. Send email OTP for verification
      const otpRes = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        setError(otpData.error || 'Failed to send verification code.');
        setIsSubmitting(false);
        return;
      }

      if (otpData.emailNotice) {
        setOtpNotice(otpData.emailNotice);
      }

      setIsSubmitting(false);
      setStep('OTP');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid verification code.');
        setIsSubmitting(false);
        return;
      }

      const { token, user } = data;

      // Persist session in cookies and reactive store
      saveSession(token, user);

      router.push(user.role === 'WORKER' ? '/worker/dashboard' : '/');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const accentText = accountType === 'WORKER' ? 'text-[#0d9488]' : 'text-[#0051d5]';
  const accentBg = accountType === 'WORKER' ? 'bg-[#0d9488] hover:bg-[#0b7c73]' : 'bg-[#0051d5] hover:bg-[#0042b0]';
  const accentIcon = accountType === 'WORKER' ? 'text-[#0d9488]' : 'text-[#0051d5]';

  return (
    <div className="max-w-lg mx-auto py-10 px-4 sm:px-6 space-y-6">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#091426] to-[#0051d5] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
          W<span className="text-[#38bdf8]">H</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
          Create Your WorkHub Account
        </h1>
        <p className="text-xs text-[#64748b] max-w-sm mx-auto">
          Choose your account type below to get started with the right portal.
        </p>
      </div>

      {/* Explicit Account Type Chooser Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#64748b] font-geist block text-center">
          Step 1: Select Who You Are
        </label>

        <div className="grid grid-cols-2 gap-3">

          {/* Customer Choice */}
          <button
            type="button"
            onClick={() => setAccountType('CUSTOMER')}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
              accountType === 'CUSTOMER'
                ? 'border-[#0051d5] bg-[#eff6ff] ring-2 ring-[#0051d5]/20 shadow-xs'
                : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#0051d5] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              {accountType === 'CUSTOMER' && (
                <span className="w-5 h-5 rounded-full bg-[#0051d5] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <strong className="text-sm font-bold text-[#091426] block">
                I&apos;m a Customer
              </strong>
              <span className="text-[11px] text-[#64748b] leading-tight block mt-0.5">
                Book verified pros for home repairs & services
              </span>
            </div>
          </button>

          {/* Worker Pro Choice */}
          <button
            type="button"
            onClick={() => setAccountType('WORKER')}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
              accountType === 'WORKER'
                ? 'border-[#0d9488] bg-[#f0fdfa] ring-2 ring-[#0d9488]/20 shadow-xs'
                : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#0d9488] text-white flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#0d9488] text-[9px] font-bold font-geist border border-[#a7f3d0]">
                Earn ₹
              </span>
            </div>
            <div>
              <strong className="text-sm font-bold text-[#091426] block">
                I&apos;m a Service Pro
              </strong>
              <span className="text-[11px] text-[#64748b] leading-tight block mt-0.5">
                Register as a worker to accept jobs & get paid
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* Main Registration Card */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 'FORM' && (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
              <span className={`text-xs font-bold flex items-center gap-1.5 font-geist uppercase ${accentText}`}>
                {accountType === 'WORKER' ? (
                  <>
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Service Pro Registration</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Customer Registration Form</span>
                  </>
                )}
              </span>
              <span className="text-[11px] text-[#0d9488] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Free Signup</span>
              </span>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <User className={`w-3.5 h-3.5 ${accentIcon}`} />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  placeholder="e.g. Amit Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <Mail className={`w-3.5 h-3.5 ${accentIcon}`} />
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
                  <Lock className={`w-3.5 h-3.5 ${accentIcon}`} />
                  <span>Password (min. 8 characters)</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 ${accentBg} text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60`}
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Send Verification Code via Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl bg-[#eff6ff]">
              <MailCheck className={`w-5 h-5 ${accentIcon}`} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#091426]">Verify Your Email</h3>
              <p className="text-xs text-[#64748b]">
                Enter the 6-digit code sent to{' '}
                <strong className="text-[#091426] font-geist">{email}</strong>
              </p>
              {otpNotice && (
                <p className="text-[11px] text-[#b45309] bg-amber-50 border border-amber-200 rounded-lg p-2">
                  {otpNotice}
                </p>
              )}
            </div>

            <div className="py-2">
              <OtpPinInput
                length={6}
                value={otpValue}
                onChange={setOtpValue}
                autoFocus={true}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpValue.length < 6}
              className={`w-full py-3.5 px-4 ${accentBg} text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-60`}
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Complete Registration'}
            </button>

            <button
              type="button"
              onClick={() => setStep('FORM')}
              className="text-xs text-[#0051d5] font-semibold hover:underline block mx-auto pt-1"
            >
              &larr; Change Email Address
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-[#64748b]">
          Already have an account?{' '}
          <Link
            href={`/login${accountType === 'WORKER' ? '?role=WORKER' : ''}`}
            className="text-[#0051d5] font-bold hover:underline"
          >
            Sign In Here
          </Link>
        </div>

      </div>

    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto py-20 text-center text-sm text-gray-500">Loading sign up...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}
