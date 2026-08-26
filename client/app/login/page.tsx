'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  User,
  Briefcase,
  ShoppingBag,
  AlertCircle,
  ShieldAlert,
  Home
} from 'lucide-react';
import { saveSession } from '@/lib/auth-client';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlRole = searchParams.get('role');
  const redirectUrl = searchParams.get('redirect');
  const errorCode = searchParams.get('error');

  // Role toggle: 'CUSTOMER' | 'WORKER'
  const [role, setRole] = useState<'CUSTOMER' | 'WORKER'>(
    urlRole === 'WORKER' ? 'WORKER' : 'CUSTOMER'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let initialNotice: string | null = null;
  if (errorCode === 'unauthorized_worker_access') {
    initialNotice = 'The Worker Portal is reserved for service professionals. Please log in with a Worker account.';
  } else if (errorCode === 'workers_cannot_book') {
    initialNotice = 'Worker accounts cannot book customer services. Please log in with a Customer account.';
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const { token, user } = data;

      // Persist session
      saveSession(token, user);

      // Handle role-based redirection
      if (redirectUrl && !redirectUrl.startsWith('/api')) {
        // If redirect target matches role capabilities
        if (user.role === 'WORKER' && redirectUrl.startsWith('/worker')) {
          router.push(redirectUrl);
          return;
        }
        if (user.role === 'CUSTOMER' && !redirectUrl.startsWith('/worker')) {
          router.push(redirectUrl);
          return;
        }
      }

      router.push(user.role === 'WORKER' ? '/worker/dashboard' : '/');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4eee4] py-10 px-4" style={{ fontFamily: 'var(--gesso-font-body)' }}>
      <div className="max-w-lg mx-auto space-y-6">

        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#f5a623] flex items-center justify-center mx-auto">
            <Home className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="whl-h2 text-2xl sm:text-3xl text-[#2a2a2a]">
            Sign In to WorkHub
          </h1>
          <p className="text-xs text-[#606060] max-w-sm mx-auto">
            Please select whether you are signing in as a Customer or a Service Professional.
          </p>
        </div>

        {initialNotice && (
          <div className="flex items-start gap-2 p-3.5 rounded-xl bg-[#c36b05]/10 border border-[#c36b05]/30 text-xs text-[#875b13]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#875b13]" />
            <span>{initialNotice}</span>
          </div>
        )}

        {/* Explicit Role Chooser Cards */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#606060] block text-center">
            Step 1: Choose Your Account Role
          </label>

          <div className="grid grid-cols-2 gap-3">

            {/* Customer Option */}
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                role === 'CUSTOMER'
                  ? 'border-2 border-[#f5a623] bg-[rgba(245,166,35,0.08)]'
                  : 'border-[rgba(0,0,0,0.06)] bg-white hover:bg-[rgba(0,0,0,0.02)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  role === 'CUSTOMER' ? 'bg-[#3b82f6] text-white' : 'bg-[#3b82f6]/15 text-[#2f68c5]'
                }`}>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                {role === 'CUSTOMER' && (
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <strong className="text-sm font-bold text-[#2a2a2a] block">
                  Customer Sign In
                </strong>
                <span className="text-[11px] text-[#606060] leading-tight block mt-0.5">
                  Manage your home bookings &amp; tracking
                </span>
              </div>
            </button>

            {/* Worker Option */}
            <button
              type="button"
              onClick={() => setRole('WORKER')}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                role === 'WORKER'
                  ? 'border-2 border-[#f5a623] bg-[rgba(245,166,35,0.08)]'
                  : 'border-[rgba(0,0,0,0.06)] bg-white hover:bg-[rgba(0,0,0,0.02)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  role === 'WORKER' ? 'bg-[#f5a623] text-black' : 'bg-[#f5a623]/15 text-[#875b13]'
                }`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                {role === 'WORKER' && (
                  <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <strong className="text-sm font-bold text-[#2a2a2a] block">
                  Pro Partner Sign In
                </strong>
                <span className="text-[11px] text-[#606060] leading-tight block mt-0.5">
                  Access job requests, wallet &amp; earnings
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* Main Form Container */}
        <div className="whl-panel bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6">

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs text-[#DC2626]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <>
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.06)]">
              <span className={`text-xs font-bold flex items-center gap-1.5 uppercase ${role === 'WORKER' ? 'text-[#2a2a2a]' : 'text-[#2f68c5]'}`}>
                {role === 'WORKER' ? (
                  <>
                    <Briefcase className="w-3.5 h-3.5 text-[#875b13]" />
                    <span>Professional Partner Login</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#875b13]" />
                    <span>Customer Login</span>
                  </>
                )}
              </span>
              <User className="w-3.5 h-3.5 text-[#875b13]" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
                  <span>Password</span>
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
                className={`whl-btn w-full py-3.5 px-4 flex items-center justify-center gap-2 disabled:opacity-60 ${
                  role === 'WORKER'
                    ? 'bg-[#3b82f6] hover:bg-[#2f68c5] text-white rounded-md'
                    : 'whl-btn-primary'
                }`}
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>{role === 'WORKER' ? 'Access Partner Dashboard' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-[#606060]">
              New to WorkHub?{' '}
              <Link
                href={`/signup${role === 'WORKER' ? '?role=WORKER' : ''}`}
                className="font-bold hover:underline text-[#2f68c5]"
              >
                Create an Account
              </Link>
            </div>
          </>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4eee4] py-20 text-center text-sm text-[#606060]" style={{ fontFamily: 'var(--gesso-font-body)' }}>Loading sign in...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
