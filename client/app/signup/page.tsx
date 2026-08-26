'use client';

import React, { useState, Suspense } from 'react';
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
  MailCheck,
  Home
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

  const accentText = accountType === 'WORKER' ? 'text-[#2a2a2a]' : 'text-[#2f68c5]';
  const accentBg = accountType === 'WORKER'
    ? 'bg-[#3b82f6] hover:bg-[#2f68c5] text-white rounded-md'
    : 'whl-btn-primary';

  return (
    <div className="min-h-screen bg-[#f4eee4] py-10 px-4" style={{ fontFamily: 'var(--gesso-font-body)' }}>
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#f5a623] flex items-center justify-center mx-auto">
            <Home className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="whl-h2 text-2xl sm:text-3xl text-[#2a2a2a]">
            Create Your WorkHub Account
          </h1>
          <p className="text-xs text-[#606060] max-w-sm mx-auto">
            Choose your account type below to get started with the right portal.
          </p>
        </div>

        {/* Explicit Account Type Chooser Cards */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#606060] block text-center">
            Step 1: Select Who You Are
          </label>

          <div className="grid grid-cols-2 gap-3">

            {/* Customer Choice */}
            <button
              type="button"
              onClick={() => setAccountType('CUSTOMER')}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                accountType === 'CUSTOMER'
                  ? 'border-2 border-[#f5a623] bg-[rgba(245,166,35,0.08)]'
                  : 'border-[rgba(0,0,0,0.06)] bg-white hover:bg-[rgba(0,0,0,0.02)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  accountType === 'CUSTOMER' ? 'bg-[#3b82f6] text-white' : 'bg-[#3b82f6]/15 text-[#2f68c5]'
                }`}>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                {accountType === 'CUSTOMER' && (
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <strong className="text-sm font-bold text-[#2a2a2a] block">
                  I&apos;m a Customer
                </strong>
                <span className="text-[11px] text-[#606060] leading-tight block mt-0.5">
                  Book verified pros for home repairs &amp; services
                </span>
              </div>
            </button>

            {/* Worker Pro Choice */}
            <button
              type="button"
              onClick={() => setAccountType('WORKER')}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                accountType === 'WORKER'
                  ? 'border-2 border-[#f5a623] bg-[rgba(245,166,35,0.08)]'
                  : 'border-[rgba(0,0,0,0.06)] bg-white hover:bg-[rgba(0,0,0,0.02)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  accountType === 'WORKER' ? 'bg-[#f5a623] text-black' : 'bg-[#f5a623]/15 text-[#875b13]'
                }`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                {accountType === 'WORKER' ? (
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full whl-badge text-[9px] font-bold">
                    Earn ₹
                  </span>
                )}
              </div>
              <div>
                <strong className="text-sm font-bold text-[#2a2a2a] block">
                  I&apos;m a Service Pro
                </strong>
                <span className="text-[11px] text-[#606060] leading-tight block mt-0.5">
                  Register as a worker to accept jobs &amp; get paid
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* Main Registration Card */}
        <div className="whl-panel bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6">

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'FORM' && (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,0,0,0.06)]">
                <span className={`text-xs font-bold flex items-center gap-1.5 uppercase ${accentText}`}>
                  {accountType === 'WORKER' ? (
                    <>
                      <Briefcase className="w-3.5 h-3.5 text-[#875b13]" />
                      <span>Service Pro Registration</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 text-[#875b13]" />
                      <span>Customer Registration Form</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] text-[#875b13] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Free Signup</span>
                </span>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#606060] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#875b13]" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    placeholder="e.g. Amit Verma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="whl-input w-full px-3.5 py-2.5 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#606060] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#875b13]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="whl-input w-full px-3.5 py-2.5 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#606060] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#875b13]" />
                    <span>Password (min. 8 characters)</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="whl-input w-full px-3.5 py-2.5 text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`whl-btn w-full py-3.5 px-4 font-bold flex items-center justify-center gap-2 disabled:opacity-60 ${accentBg}`}
                >
                  {isSubmitting ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>Send Verification Code via Email</span>
                      <ArrowRight className={`w-4 h-4 ${accountType === 'CUSTOMER' ? 'text-black' : ''}`} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
              <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-[rgba(245,166,35,0.12)]">
                <MailCheck className="w-5 h-5 text-[#875b13]" />
              </div>

              <div className="space-y-1">
                <h3 className="whl-h3 text-base text-[#2a2a2a]">Verify Your Email</h3>
                <p className="text-xs text-[#606060]">
                  Enter the 6-digit code sent to{' '}
                  <strong className="text-[#2a2a2a]">{email}</strong>
                </p>
                {otpNotice && (
                  <p className="text-[11px] text-[#875b13] bg-[rgba(245,166,35,0.10)] border border-[rgba(245,166,35,0.30)] rounded-lg p-2">
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
                className={`whl-btn w-full py-3.5 px-4 font-bold disabled:opacity-60 ${accentBg}`}
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Complete Registration'}
              </button>

              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="text-xs text-[#2f68c5] font-semibold hover:underline block mx-auto pt-1"
              >
                &larr; Change Email Address
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-[#606060]">
            Already have an account?{' '}
            <Link
              href={`/login${accountType === 'WORKER' ? '?role=WORKER' : ''}`}
              className="text-[#2f68c5] font-bold hover:underline"
            >
              Sign In Here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4eee4] py-20 text-center text-sm text-[#606060]" style={{ fontFamily: 'var(--gesso-font-body)' }}>Loading sign up...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}
