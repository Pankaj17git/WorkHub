'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Search as SearchIcon,
  Settings,
  Calendar,
  Activity,
  List,
  Square,
  LayoutGrid,
  Grid3x3,
  User,
  LogOut,
} from 'lucide-react';
import { clearSession, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';
import './landing.css';

const SERVICES = [
  'Plumbing',
  'Electrical',
  'AC Repair',
  'Room Cleaning',
  'Vehicle Mechanic',
  'Carpentry',
  'Gardening',
];

function ToolsPatternLoop() {
  return (
    <svg viewBox="0 0 900 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="900" height="500" fill="var(--gesso-canvas)" />
      <g stroke="var(--gesso-fg)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.14">
        <g transform="translate(60,60) rotate(-15)"><path d="M0 40 L60 -20" strokeWidth="6" /><circle cx="60" cy="-20" r="10" fill="var(--gesso-canvas)" /></g>
        <g transform="translate(220,140) rotate(20)"><rect x="-10" y="-40" width="20" height="80" rx="4" /><circle cx="0" cy="-46" r="9" /></g>
        <g transform="translate(400,70)"><path d="M-20 -20 L20 20 M20 -20 L-20 20" strokeWidth="6" /></g>
        <g transform="translate(560,150) rotate(10)"><rect x="-24" y="-14" width="48" height="28" rx="6" /><circle cx="-10" cy="0" r="4" /><circle cx="10" cy="0" r="4" /></g>
        <g transform="translate(720,70)"><path d="M0 -30 v60 M-20 0 h40" /></g>
        <g transform="translate(120,300) rotate(30)"><path d="M0 0 L0 60" strokeWidth="6" /><path d="M-16 0 L16 0" strokeWidth="6" /></g>
        <g transform="translate(300,340)"><ellipse cx="0" cy="0" rx="26" ry="34" /><path d="M0 -34 v-10" /></g>
        <g transform="translate(470,300) rotate(-10)"><rect x="-30" y="-10" width="60" height="20" rx="10" /><circle cx="-30" cy="0" r="10" /><circle cx="30" cy="0" r="10" /></g>
        <g transform="translate(650,330) rotate(20)"><path d="M-24 24 L24 -24" /><path d="M-6 24 L24 -6" strokeWidth="8" /></g>
        <g transform="translate(820,260) rotate(-15)"><rect x="-14" y="-30" width="28" height="60" rx="6" /></g>
        <g transform="translate(60,420) rotate(10)"><circle cx="0" cy="0" r="22" /><path d="M0 -22 v-16" /></g>
        <g transform="translate(780,430)"><path d="M-20 0 h40 M0 -20 v40" /></g>
      </g>
    </svg>
  );
}

function ServiceIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="whl-service-icon">
      <svg viewBox="0 0 64 64">{children}</svg>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [service, setService] = useState(SERVICES[0]);
  const [location, setLocation] = useState('');
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const handleLogout = () => clearSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ q: service });
    if (location.trim()) params.set('location', location.trim());
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="whl-page">
      <div className="whl-wrap">

        {/* ── Top Navigation ── */}
        <nav className="whl-topnav">
          <div className="whl-brand">
            <div className="mark"><Home size={20} /></div>
            <span className="whl-brand-name">WorkHub</span>
          </div>
          <div className="whl-nav-links">
            <Link href="/" className="active">Home</Link>
            <Link href="#services">Services</Link>
            <Link href="#how">How it Works</Link>
            <Link href="#join">For Workers</Link>
          </div>
          <div className="whl-nav-cta">
            {session ? (
              <>
                <span className="whl-chip" style={{ maxWidth: 190, textTransform: 'none', letterSpacing: 0 }}>
                  <User size={14} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.name || session.email}
                  </span>
                </span>
                {session.role === 'WORKER' ? (
                  <Link href="/worker/dashboard" className="whl-btn whl-btn-primary">Worker dashboard</Link>
                ) : (
                  <Link href="/search" className="whl-btn whl-btn-primary">Explore services</Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="whl-btn whl-btn-outline"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="whl-btn whl-btn-outline">Log in</Link>
                <Link href="/signup" className="whl-btn whl-btn-primary">Sign up</Link>
              </>
            )}
          </div>
        </nav>

        {/* ── Hero: window-chrome shell ── */}
        <section className="whl-hero-window">
          <div className="whl-hero-titlebar">
            <div className="whl-traffic"><span className="r" /><span className="y" /><span className="g" /></div>
            <span className="whl-titlebar-label">workhub — find-a-worker.app</span>
            <div style={{ width: 60 }} />
          </div>
          <div className="whl-toolbar">
            <Square />
            <LayoutGrid />
            <Grid3x3 />
            <Square />
          </div>
          <div className="whl-hero-body">
            <div className="whl-hero-bg-loop" aria-hidden="true">
              <ToolsPatternLoop />
            </div>
            <div className="whl-hero-copy">
              <h1>Find the Right Worker for the Job</h1>
              <p className="sub">Connect with skilled workers near you for everyday jobs, repairs, and services.</p>
              <div className="whl-hero-ctas">
                <Link href="/search" className="whl-btn whl-btn-primary">Find a Worker</Link>
                {/* Become-a-worker entry point → signup with Worker preselected */}
                <Link href="/signup?role=WORKER" className="whl-btn whl-btn-outline">Offer Your Skills</Link>
              </div>

            {/* Keyword Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="What service do you need? (e.g. Electrician, AC Repair)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-transparent rounded-xl focus:outline-none placeholder:text-[#94a3b8]"
              />
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Search Submit */}
            <Link
              href={`/search?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(city)}`}
              className="w-full sm:w-auto px-7 py-3 bg-[#0051d5] hover:bg-[#0042b0] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Search Pros</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Popular Tag Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-[#94a3b8] pt-2">
            <span className="font-semibold text-white font-geist flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#38bdf8]" /> Popular:
            </span>
            {popularSearches.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#e2e8f0] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Hero Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-white/10 text-left">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-geist text-white">4.92★</div>
              <div className="text-xs text-[#94a3b8] mt-0.5">Average Job Rating</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-geist text-white">1,500+</div>
              <div className="text-xs text-[#94a3b8] mt-0.5">Verified Local Pros</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-geist text-white">&lt; 30 min</div>
              <div className="text-xs text-[#94a3b8] mt-0.5">Average Response Time</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-geist text-white">₹10K</div>
              <div className="text-xs text-[#94a3b8] mt-0.5">Damage Protection</div>
            </div>
          </div>

        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0051d5] font-geist">
              Explore By Category
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight mt-1">
              Top Home & Commercial Services
            </h2>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-[#0051d5] hover:underline flex items-center gap-1"
          >
            <span>View all 24 categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <CategoryGrid />
      </section>

      {/* Featured Professionals Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d9488] font-geist">
              Top Rated in Chandigarh
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight mt-1">
              Featured Verified Specialists
            </h2>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-[#0051d5] hover:underline flex items-center gap-1"
          >
            <span>Browse all specialists</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {MOCK_PROS.slice(0, 3).map((pro) => (
            <ProCard key={pro.id} pro={pro} />
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#091426] to-[#1e293b] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d9488]/20 border border-[#0d9488]/40 text-xs font-semibold text-[#2dd4bf]">
              <ShieldCheck className="w-4 h-4" />
              <span>WorkHub Shield Guarantee</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Safety, Reliability, and Honest Pricing Built Into Every Service.
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
                <div className="text-xs text-[#cbd5e1]">
                  <strong className="text-white block text-sm mb-0.5">Criminal Record Verified</strong>
                  Strict Aadhaar & police background checks before onboarding.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
                <div className="text-xs text-[#cbd5e1]">
                  <strong className="text-white block text-sm mb-0.5">Fixed Upfront Estimates</strong>
                  No bargaining or mystery charges at the doorstep.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
                <div className="text-xs text-[#cbd5e1]">
                  <strong className="text-white block text-sm mb-0.5">₹10,000 Protection Cover</strong>
                  Automatic accidental damage cover for peace of mind.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
                <div className="text-xs text-[#cbd5e1]">
                  <strong className="text-white block text-sm mb-0.5">Pay After Satisfaction</strong>
                  Release payment only after inspecting the completed job.
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0051d5] hover:bg-[#0042b0] text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                <span>Find a Pro in My Sector</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
