'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Wrench, ShieldCheck, Check, ArrowLeft } from 'lucide-react';
import RoleToggle, { AuthRole } from './RoleToggle';

type AuthMode = 'login' | 'signup';

interface AuthLayoutProps {
  role: AuthRole;
  onRoleChange: (role: AuthRole) => void;
  mode: AuthMode;
  title: string;
  subtitle?: string;
  notice?: React.ReactNode;
  footer?: React.ReactNode;
  /** Hide the role toggle (e.g. during the OTP verification step). */
  showToggle?: boolean;
  toggleLabels?: { customer: string; worker: string };
  children: React.ReactNode;
}

const BRAND_COPY: Record<AuthRole, Record<AuthMode, { headline: string; sub: string }>> = {
  WORKER: {
    login: {
      headline: 'Your next job is a tap away.',
      sub: 'Log in to see nearby requests, manage your rate card, and track every payout.',
    },
    signup: {
      headline: 'Put your trade to work.',
      sub: 'Create a partner account and start getting matched with local jobs across Chandigarh.',
    },
  },
  CUSTOMER: {
    login: {
      headline: 'Welcome back.',
      sub: 'Log in to manage bookings, track a pro on the way, and rebook the ones you liked.',
    },
    signup: {
      headline: 'Help for your home, sorted.',
      sub: 'Book verified local pros for repairs, cleaning, and upkeep — usually within the hour.',
    },
  },
};

const BRAND_POINTS: Record<AuthRole, string[]> = {
  WORKER: [
    'You set your own rates',
    'Weekly payouts to your bank',
    'Jobs matched to your skills',
  ],
  CUSTOMER: [
    'Background-checked professionals',
    'Fixed pricing, no surprises',
    'Up to ₹10,000 damage cover',
  ],
};

function WorkerMotif() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        {/* wrench */}
        <path d="M60 150 L120 90" strokeWidth="12" />
        <path d="M120 90 a26 26 0 1 0 -6 -34 l16 16 -12 12 -16 -16 a26 26 0 0 0 18 22 z" />
        {/* screwdriver crossing */}
        <path d="M150 150 L96 96" strokeWidth="10" />
        <path d="M150 150 l16 16" strokeWidth="14" />
      </g>
    </svg>
  );
}

function CustomerMotif() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        {/* house */}
        <path d="M40 96 L100 48 L160 96" />
        <path d="M54 88 V150 H146 V88" />
        {/* door */}
        <path d="M88 150 V116 h24 v34" />
        {/* verified spark */}
        <circle cx="150" cy="150" r="20" fill="none" />
        <path d="M142 150 l6 6 12 -13" strokeWidth="4" />
      </g>
    </svg>
  );
}

export default function AuthLayout({
  role,
  onRoleChange,
  mode,
  title,
  subtitle,
  notice,
  footer,
  showToggle = true,
  toggleLabels,
  children,
}: AuthLayoutProps) {
  const copy = BRAND_COPY[role][mode];
  const points = BRAND_POINTS[role];

  return (
    <div className="wha-root">
      {/* Mobile-only brand bar */}
      <div className="wha-brandbar">
        <Link href="/" className="brand">
          <span className="mark">
            <Home size={18} strokeWidth={2.25} />
          </span>
          <span className="name">WorkHub</span>
        </Link>
        <Link href="/" className="wha-back">
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </div>

      <div className="wha-shell">
        {/* ── Brand / blueprint panel ── */}
        <aside className="wha-brand" data-role={role}>
          <div className="wha-blueprint" aria-hidden="true" />

          <Link href="/" className="wha-brand-top">
            <span className="mark">
              <Home size={22} strokeWidth={2.25} />
            </span>
            <span className="wha-brand-name">WorkHub</span>
          </Link>

          <div className="wha-brand-mid">
            <span className="wha-brand-kicker">
              {role === 'WORKER' ? (
                <>
                  <Wrench size={14} strokeWidth={2.25} />
                  Pro partner portal
                </>
              ) : (
                <>
                  <ShieldCheck size={14} strokeWidth={2.25} />
                  Trusted local help
                </>
              )}
            </span>
            <h2 className="wha-brand-headline">{copy.headline}</h2>
            <p className="wha-brand-sub">{copy.sub}</p>
          </div>

          <ul className="wha-brand-points">
            {points.map((point) => (
              <li className="wha-brand-point" key={point}>
                <span className="tick">
                  <Check size={15} strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="wha-brand-motif" aria-hidden="true">
            {role === 'WORKER' ? <WorkerMotif /> : <CustomerMotif />}
          </div>
        </aside>

        {/* ── Form panel ── */}
        <main className="wha-form" data-role={role}>
          <div className="wha-form-inner">
            {showToggle && (
              <RoleToggle
                value={role}
                onChange={onRoleChange}
                customerLabel={toggleLabels?.customer}
                workerLabel={toggleLabels?.worker}
              />
            )}

            <div className="wha-heading">
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>

            {notice}

            {children}

            {footer && <div className="wha-alt">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
