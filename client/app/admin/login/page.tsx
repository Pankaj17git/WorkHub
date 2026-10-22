'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Database,
  Terminal,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import WorkHubBrand from '@/components/ui/WorkHubBrand';
import { saveSession } from '@/lib/auth-client';
import api, { getApiErrorMessage } from '@/lib/api';

function AdminLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';
  const errorCode = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    errorCode === 'unauthorized_admin_access'
      ? 'Administrator privileges are required to access that area. Please sign in.'
      : null
  );

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user } = res.data;

      // Verify that this user is actually an ADMIN
      if (user.role !== 'ADMIN') {
        setError('Access Denied: This portal is strictly restricted to platform administrators.');
        setIsSubmitting(false);
        return;
      }

      saveSession(token, user);
      router.push(redirectUrl.startsWith('/admin') ? redirectUrl : '/admin/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Admin authentication failed. Verify credentials.'));
      setIsSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@workhub.com');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between text-white selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px] pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 sm:p-8 flex items-center justify-between relative z-10">
        <WorkHubBrand
          theme="dark"
          size={34}
          href="/admin/login"
          tagline="Admin Operations Portal"
        />

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Main Site</span>
        </Link>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="max-w-md w-full bg-[#0d1322] border border-indigo-950/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[11px] font-mono font-semibold">
              <Terminal className="w-3 h-3 text-indigo-400" />
              <span>COMMAND CONSOLE</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Administrator Access
            </h1>
            <p className="text-xs text-slate-400">
              Secure authentication for WorkHub system administrators.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Fill Helper */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
            <span className="text-indigo-300 text-[11px] font-medium">Demo Administrator:</span>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline"
            >
              Fill Demo Credentials
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin Email Address</span>
              </label>
              <input
                type="email"
                required
                placeholder="admin@workhub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#090d18] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Master Password</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#090d18] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Enter Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Database Info footer */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-mono">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              MySQL / MariaDB
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SECURITY ACTIVE
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-slate-600 relative z-10">
        WorkHub Operations & Governance • Authorized Personnel Only
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-500 text-xs">
          Loading Admin Portal...
        </div>
      }
    >
      <AdminLoginFormContent />
    </Suspense>
  );
}
