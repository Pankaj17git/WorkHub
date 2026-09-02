'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Briefcase, 
  ShoppingBag, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { saveSession, resolveLoginRedirect } from '@/lib/auth-client';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = searchParams.get('role');
  const redirectUrl = searchParams.get('redirect');
  const errorCode = searchParams.get('error');

  const [role, setRole] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlRole === 'WORKER') {
      setRole('WORKER');
    } else if (urlRole === 'CUSTOMER') {
      setRole('CUSTOMER');
    }
  }, [urlRole]);

  let initialNotice: string | null = null;
  if (errorCode === 'unauthorized_worker_access') {
    initialNotice = 'The pro portal is for service professionals. Log in with a worker account to continue.';
  } else if (errorCode === 'workers_cannot_book') {
    initialNotice = 'Worker accounts can’t book services. Log in with a customer account to make a booking.';
  } else if (errorCode === 'session_expired') {
    initialNotice = 'Your session expired. Please log in again.';
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
        setError(data.error || 'Login failed. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      const { token, user } = data;
      saveSession(token, user);

      router.push(resolveLoginRedirect(user.role, redirectUrl));
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
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

      {initialNotice && (
        <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 shadow-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{initialNotice}</span>
        </div>
      )}

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

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <>
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
            <span className={`text-xs font-bold flex items-center gap-1.5 font-geist uppercase ${role === 'WORKER' ? 'text-[#0d9488]' : 'text-[#0051d5]'}`}>
              {role === 'WORKER' ? (
                <>
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Professional Partner Login</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Customer Login</span>
                </>
              )}
            </span>
            <User className="w-3.5 h-3.5 text-[#64748b]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                <Mail className={`w-3.5 h-3.5 ${role === 'WORKER' ? 'text-[#0d9488]' : 'text-[#0051d5]'}`} />
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
                <Lock className={`w-3.5 h-3.5 ${role === 'WORKER' ? 'text-[#0d9488]' : 'text-[#0051d5]'}`} />
                <span>Password</span>
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
              className={`w-full py-3.5 px-4 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                role === 'WORKER' ? 'bg-[#0d9488] hover:bg-[#0b7c73]' : 'bg-[#0051d5] hover:bg-[#0042b0]'
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

          <div className="pt-2 text-center text-xs text-[#64748b]">
            New to WorkHub?{' '}
            <Link
              href={`/signup${role === 'WORKER' ? '?role=WORKER' : ''}`}
              className={`font-bold hover:underline ${role === 'WORKER' ? 'text-[#0d9488]' : 'text-[#0051d5]'}`}
            >
              Create an Account
            </Link>
          </div>
        </>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto py-20 text-center text-sm text-gray-500">Loading sign in...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
