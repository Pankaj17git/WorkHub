'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
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
            <Link href="/login" className="whl-btn whl-btn-outline">Log in</Link>
            <Link href="/signup" className="whl-btn whl-btn-primary">Sign up</Link>
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

              <form className="whl-search-card" onSubmit={handleSearch}>
                <div className="whl-search-field">
                  <label htmlFor="svc">Service</label>
                  <select id="svc" value={service} onChange={(e) => setService(e.target.value)}>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="whl-search-field">
                  <label htmlFor="loc">Location</label>
                  <input
                    id="loc"
                    type="text"
                    placeholder="Enter your area"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <button type="submit" className="whl-search-go">
                  <SearchIcon />
                  Search
                </button>
              </form>
            </div>
            <div />
          </div>
        </section>

        {/* ── File-icon rail ── */}
        <div className="whl-file-rail" aria-hidden="true">
          <div className="whl-file-chip"><div className="box"><Settings /></div>tools.app</div>
          <div className="whl-file-chip"><div className="box"><Calendar /></div>power.dat</div>
          <div className="whl-file-chip"><div className="box"><Activity /></div>bookings</div>
          <div className="whl-file-chip"><div className="box"><List /></div>activity</div>
        </div>

        {/* ── Services grid ── */}
        <section id="services" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="whl-section-head">
            <h2 className="whl-section-label">Browse Services</h2>
            <p className="whl-section-sub">Seven trades, all vetted and ready — tap a service to see nearby pros.</p>
          </div>
          <div className="whl-service-grid">

            <button className="whl-service-card" onClick={() => router.push('/search?q=Plumbing')}>
              <ServiceIcon>
                <g fill="none" stroke="var(--gesso-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 44V28a8 8 0 018-8h8" />
                  <circle cx="20" cy="46" r="4" fill="var(--gesso-secondary)" stroke="none" />
                  <path d="M36 20l6-6M42 14l4 4M46 18l-4 4" />
                </g>
              </ServiceIcon>
              <h3>Plumbing</h3>
              <p>Leaks, pipes &amp; fixtures</p>
              <span className="chip">240+ pros</span>
            </button>

            <button className="whl-service-card" onClick={() => router.push('/search?q=Electrical')}>
              <ServiceIcon>
                <path d="M34 12L20 36h10l-4 16 18-24H34l4-16z" fill="var(--gesso-warning)" stroke="var(--gesso-fg)" strokeWidth="2.5" strokeLinejoin="round" />
              </ServiceIcon>
              <h3>Electrical</h3>
              <p>Wiring &amp; installs</p>
              <span className="chip">180+ pros</span>
            </button>

            <button className="whl-service-card" onClick={() => router.push('/search?q=AC%20Repair')}>
              <ServiceIcon>
                <g fill="none" stroke="var(--gesso-secondary)" strokeWidth="3" strokeLinecap="round">
                  <rect x="12" y="20" width="40" height="16" rx="4" />
                  <path d="M20 36l-3 8M32 36v9M44 36l3 8" />
                </g>
              </ServiceIcon>
              <h3>AC Repair</h3>
              <p>Cooling &amp; servicing</p>
              <span className="chip">120+ pros</span>
            </button>

            <button className="whl-service-card" onClick={() => router.push('/search?q=Room%20Cleaning')}>
              <ServiceIcon>
                <g fill="none" stroke="var(--gesso-extra-2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M28 12l4 30M28 12a4 4 0 018 0l-4 30z" />
                  <path d="M22 48h20" />
                </g>
              </ServiceIcon>
              <h3>Room Cleaning</h3>
              <p>Homes &amp; offices</p>
              <span className="chip">300+ pros</span>
            </button>

            <button className="whl-service-card" onClick={() => router.push('/search?q=Vehicle%20Mechanic')}>
              <ServiceIcon>
                <g fill="none" stroke="var(--gesso-extra-1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M40 24l-6 6-4-4 6-6a8 8 0 10-10 10l-14 14 4 4 14-14a8 8 0 0010-10z" />
                </g>
              </ServiceIcon>
              <h3>Vehicle Mechanic</h3>
              <p>Cars &amp; two-wheelers</p>
              <span className="chip">150+ pros</span>
            </button>

            <button className="whl-service-card" onClick={() => router.push('/search?q=Carpentry')}>
              <ServiceIcon>
                <g fill="none" stroke="var(--gesso-fg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 40l24-24 6 6-24 24z" />
                  <path d="M38 16l6-6 6 6-6 6" />
                </g>
              </ServiceIcon>
              <h3>Carpentry</h3>
              <p>Furniture &amp; fittings</p>
              <span className="chip">95+ pros</span>
            </button>

            <button className="whl-service-card" onClick={() => router.push('/search?q=Gardening')}>
              <ServiceIcon>
                <g fill="none" stroke="var(--gesso-extra-2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M32 50V26" />
                  <path d="M32 26c0-8-8-12-14-10 2 8 8 12 14 10z" />
                  <path d="M32 32c0-8 8-12 14-10-2 8-8 12-14 10z" />
                </g>
              </ServiceIcon>
              <h3>Gardening</h3>
              <p>Lawn &amp; landscaping</p>
              <span className="chip">110+ pros</span>
            </button>

          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="whl-how-wrap">
          <div className="whl-section-head">
            <h2 className="whl-section-label">How WorkHub Works</h2>
            <p className="whl-section-sub">Three steps between you and a job well done.</p>
          </div>
          <div className="whl-how-steps">
            <div className="whl-how-step">
              <div className="whl-how-num">1</div>
              <svg className="whl-how-viz" viewBox="0 0 200 90" aria-label="Search step illustration">
                <rect x="10" y="14" width="180" height="62" rx="10" fill="var(--gesso-surface-recessed)" />
                <circle cx="90" cy="45" r="18" fill="none" stroke="var(--gesso-secondary)" strokeWidth="4" />
                <line x1="103" y1="58" x2="118" y2="73" stroke="var(--gesso-secondary)" strokeWidth="5" strokeLinecap="round" />
              </svg>
              <h4>Search</h4>
              <p>Tell us the service and your location.</p>
            </div>
            <div className="whl-how-arrow"><Square /></div>
            <div className="whl-how-step">
              <div className="whl-how-num">2</div>
              <svg className="whl-how-viz" viewBox="0 0 200 90" aria-label="Find step illustration">
                <rect x="10" y="14" width="180" height="62" rx="10" fill="var(--gesso-surface-recessed)" />
                <circle cx="70" cy="45" r="10" fill="var(--gesso-primary)" />
                <circle cx="100" cy="30" r="7" fill="#377ef1" />
                <circle cx="130" cy="55" r="8" fill="var(--gesso-extra-2)" />
              </svg>
              <h4>Find</h4>
              <p>Compare nearby workers by rating &amp; price.</p>
            </div>
            <div className="whl-how-arrow"><Square /></div>
            <div className="whl-how-step">
              <div className="whl-how-num">3</div>
              <svg className="whl-how-viz" viewBox="0 0 200 90" aria-label="Connect step illustration">
                <rect x="10" y="14" width="180" height="62" rx="10" fill="var(--gesso-surface-recessed)" />
                <circle cx="70" cy="45" r="16" fill="none" stroke="var(--gesso-extra-1)" strokeWidth="4" />
                <circle cx="130" cy="45" r="16" fill="none" stroke="var(--gesso-secondary)" strokeWidth="4" />
                <path d="M86 45h28" stroke="var(--gesso-fg)" strokeWidth="3" strokeDasharray="4 4" />
              </svg>
              <h4>Connect</h4>
              <p>Book directly and get the job done.</p>
            </div>
          </div>
        </section>

        {/* ── Become a worker CTA band ── */}
        <section id="join" className="whl-join-band">
          <div className="whl-join-copy">
            <h2>Are you a skilled worker? Join WorkHub today.</h2>
            <p>Grow your client base, set your own schedule, and get paid for the work you love.</p>
            <Link href="/signup?role=WORKER" className="whl-btn whl-btn-primary">Become a Worker</Link>
          </div>
          <div className="whl-join-illustration">
            <svg viewBox="0 0 260 220">
              <rect x="30" y="90" width="200" height="100" rx="14" fill="var(--gesso-primary)" stroke="var(--gesso-fg)" strokeWidth="4" />
              <rect x="70" y="60" width="120" height="40" rx="10" fill="none" stroke="var(--gesso-fg)" strokeWidth="4" />
              <rect x="20" y="130" width="220" height="18" fill="var(--gesso-surface)" stroke="var(--gesso-fg)" strokeWidth="3" />
              <circle cx="130" cy="139" r="10" fill="var(--gesso-extra-1)" stroke="var(--gesso-fg)" strokeWidth="3" />
              <path d="M60 190l-10 20M200 190l10 20" stroke="var(--gesso-fg)" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="whl-footer">
          <div className="whl-footer-cols">
            <div>
              <h5>Company</h5>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div>
              <h5>Services</h5>
              <Link href="/search?q=Plumbing">Plumbing</Link>
              <Link href="/search?q=Electrical">Electrical</Link>
              <Link href="/search?q=AC%20Repair">AC Repair</Link>
              <Link href="/search?q=Gardening">Gardening</Link>
            </div>
            <div>
              <h5>For Workers</h5>
              <Link href="/signup?role=WORKER">Join WorkHub</Link>
              <Link href="/worker/dashboard">Worker App</Link>
              <a href="#">Success Stories</a>
            </div>
            <div>
              <h5>Support</h5>
              <a href="#">Help Center</a>
              <a href="#">Safety</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <div className="whl-footer-bottom">
            <span>© 2024 WorkHub. All rights reserved.</span>
            <span>Made for local workers, everywhere.</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
