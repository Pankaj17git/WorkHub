'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldAlert } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { AuthRole } from '@/components/auth/RoleToggle';
import { saveSession, resolveLoginRedirect } from '@/lib/auth-client';

const ROLE_SUBTITLE: Record<AuthRole, string> = {
  CUSTOMER: 'Manage your bookings and track pros in real time.',
  WORKER: 'Jump back into your job requests and payouts.',
};

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlRole = searchParams.get('role');
  const redirectUrl = searchParams.get('redirect');
  const errorCode = searchParams.get('error');

  const [role, setRole] = useState<AuthRole>(urlRole === 'WORKER' ? 'WORKER' : 'CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlRole === 'WORKER' || urlRole === 'CUSTOMER') {
      setRole(urlRole);
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
        setError(data.error || 'Login failed. Check your email and password, then try again.');
        setIsSubmitting(false);
        return;
      }

      const { token, user } = data;
      saveSession(token, user);

      // The real account role always decides the destination.
      router.push(resolveLoginRedirect(user.role, redirectUrl));
    } catch {
      setError('Something went wrong on our end. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      role={role}
      onRoleChange={setRole}
      mode="login"
      title="Sign in to WorkHub"
      subtitle={ROLE_SUBTITLE[role]}
      toggleLabels={{ customer: 'Customer', worker: 'Professional' }}
      notice={
        initialNotice ? (
          <div className="wha-alert wha-alert--info" role="status">
            <ShieldAlert size={16} />
            <span>{initialNotice}</span>
          </div>
        ) : null
      }
      footer={
        <>
          New to WorkHub?{' '}
          <Link href={role === 'WORKER' ? '/signup?role=WORKER' : '/signup'}>Create an account</Link>
        </>
      }
    >
      <form className="wha-form-body" onSubmit={handleLogin} noValidate>
        {error && (
          <div className="wha-alert wha-alert--error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="wha-field">
          <label className="wha-label" htmlFor="login-email">Email address</label>
          <div className="wha-input-wrap">
            <span className="lead"><Mail size={16} /></span>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="wha-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="wha-field">
          <label className="wha-label" htmlFor="login-password">Password</label>
          <div className="wha-input-wrap">
            <span className="lead"><Lock size={16} /></span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="wha-input has-toggle"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="wha-peek"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button type="submit" className="wha-submit" data-role={role} disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-[#f4eee4] py-20 text-center text-sm text-[#606060]"
          style={{ fontFamily: 'var(--gesso-font-body)' }}
        >
          Loading sign in…
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
