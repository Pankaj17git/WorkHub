'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  ArrowLeft,
  User,
  LogOut,
  Briefcase,
  ArrowLeftRight,
  Home,
} from 'lucide-react';
import { clearSession, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity] = useState('Chandigarh');
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  // Check if user is currently on login or signup pages
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  /* Minimalist Header for Login & Signup Pages */
  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 bg-[#f4eee4] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-[#f5a623] flex items-center justify-center text-[#000000] group-hover:scale-105 transition-transform">
                <Home size={18} strokeWidth={2.25} />
              </div>
              <span className="whl-h3" style={{ fontSize: 20 }}>WorkHub</span>
            </Link>

            {/* Right side: Login / Signup links + Return Home */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`whl-btn ${
                  pathname.includes('login') ? 'whl-btn-primary' : 'whl-btn-outline'
                }`}
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className={`whl-btn hidden sm:inline-flex ${
                  pathname.includes('signup') ? 'whl-btn-primary' : 'whl-btn-outline'
                }`}
              >
                Sign up
              </Link>

              <span className="w-px h-5 bg-black/10 hidden sm:inline-block" />

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#606060] hover:text-[#2a2a2a] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Marketplace</span>
              </Link>
            </div>

          </div>
        </div>
      </header>
    );
  }

  /* Full Standard Marketplace Header */
  return (
    <header className="sticky top-0 z-50 bg-[#f4eee4]/95 backdrop-blur-md border-b border-black/5">
      {/* Top micro alert banner */}
      <div className="bg-[#2a2a2a] text-[#fbfbf3] px-4 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#f5a623]" />
        <span>100% Background-Checked Professionals & Up to ₹10,000 Damage Cover</span>
        <span className="hidden md:inline-block text-[#fbfbf3]/40">|</span>
        <span className="hidden md:inline-block text-[#87b5ff]">Use code WORKHUB100 for ₹100 off your first booking</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-4">

          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-[#f5a623] flex items-center justify-center text-[#000000] group-hover:scale-105 transition-transform">
                <Home size={20} strokeWidth={2.25} />
              </div>
              <span className="whl-h3 text-xl">WorkHub</span>
            </Link>

            {/* City selector dropdown */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eae4db] text-sm text-[#2a2a2a] hover:bg-[#e0d8cc] cursor-pointer transition-colors">
              <MapPin className="w-4 h-4 text-[#875b13]" />
              <span className="font-medium">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#606060]" />
            </div>
          </div>

          {/* Quick Search in Nav */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form action="/search" method="GET" className="relative w-full">
              <input
                type="text"
                name="q"
                placeholder="Search electrician, plumber, AC service..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#bcbcbc] rounded-lg focus:outline-none focus:border-[#f5a623] focus:ring-[3px] focus:ring-[#f5a623]/15 transition-all text-[#2a2a2a] placeholder:text-[#9c9c9c]"
              />
              <Search className="w-4 h-4 text-[#606060] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              className="px-3 py-2 text-sm font-medium text-[#2a2a2a] hover:text-[#606060] rounded-lg transition-colors"
            >
              Explore Services
            </Link>

            <Link
              href="/bookings/pro-1/track"
              className="px-3 py-2 text-sm font-medium text-[#2a2a2a] hover:text-[#606060] rounded-lg transition-colors"
            >
              Track Job
            </Link>

            {/* UI ROLE SWITCHER BUTTON */}
            {session?.role === 'WORKER' ? (
              <Link
                href="/worker/dashboard"
                className="whl-btn whl-btn-outline !py-1.5 !px-3 !text-xs flex items-center gap-1.5"
                title="Go to your Service Partner Dashboard"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Worker Dashboard</span>
              </Link>
            ) : session?.role === 'CUSTOMER' ? (
              <Link
                href="/worker/dashboard"
                className="whl-btn whl-btn-outline !py-1.5 !px-3 !text-xs flex items-center gap-1.5"
                title="Switch to Worker Mode"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Switch to Worker</span>
              </Link>
            ) : (
              <Link
                href="/signup?role=WORKER"
                className="whl-btn whl-btn-outline !py-1.5 !px-3 !text-xs flex items-center gap-1.5"
                title="Become a Worker"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Become a Worker</span>
              </Link>
            )}

            {/* Login / Account Buttons */}
            {session ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2a2a2a] bg-[#eae4db] rounded-lg">
                  <User className="w-3.5 h-3.5 text-[#875b13]" />
                  <span className="max-w-28 truncate">{session.name || session.email}</span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider border ${
                    session.role === 'WORKER'
                      ? 'bg-[#3b82f6]/10 text-[#2f68c5] border-[#3b82f6]/30'
                      : 'bg-[#f5a623]/15 text-[#875b13] border-[#f5a623]/40'
                  }`}>
                    {session.role === 'WORKER' ? 'Pro' : 'Customer'}
                  </span>
                </div>
                <button
                  onClick={() => { clearSession(); router.push('/login'); }}
                  className="p-2 text-xs font-semibold text-[#606060] hover:text-[#DC2626] hover:bg-[#DC2626]/10 rounded-lg transition-colors flex items-center justify-center"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="whl-btn whl-btn-outline">Log in</Link>
                <Link href="/signup" className="whl-btn whl-btn-primary">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {session ? (
              <button
                onClick={() => { clearSession(); router.push('/login'); }}
                className="p-2 text-[#606060] hover:text-[#DC2626] hover:bg-[#DC2626]/10 rounded-lg flex items-center"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link href="/login" className="whl-btn whl-btn-outline !py-1.5 !px-3 !text-xs">Log in</Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#2a2a2a] hover:bg-black/5"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-black/5 space-y-3">
            <form action="/search" method="GET" className="relative w-full">
              <input
                type="text"
                name="q"
                placeholder="Search electrician, plumber, carpenter..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#bcbcbc] rounded-lg focus:outline-none focus:border-[#f5a623]"
              />
              <Search className="w-4 h-4 text-[#606060] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[#2a2a2a] hover:bg-black/5 rounded-lg"
              >
                All Services
              </Link>
              <Link
                href="/bookings/pro-1/track"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[#2a2a2a] hover:bg-black/5 rounded-lg"
              >
                Track Live Booking
              </Link>

              {/* Mobile Become-a-worker entry */}
              {!session && (
                <Link
                  href="/signup?role=WORKER"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#eae4db] text-xs font-bold text-[#2a2a2a]"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#875b13]" />
                    <span>Become a Worker</span>
                  </div>
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5">
                {session ? (
                  <div className="col-span-2 flex items-center justify-between px-3 py-2.5 text-xs font-bold text-[#2a2a2a] bg-[#eae4db] rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#875b13]" />
                      <span className="truncate">{session.name || session.email}</span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider border ${
                      session.role === 'WORKER'
                        ? 'bg-[#3b82f6]/10 text-[#2f68c5] border-[#3b82f6]/30'
                        : 'bg-[#f5a623]/15 text-[#875b13] border-[#f5a623]/40'
                    }`}>
                      {session.role === 'WORKER' ? 'Pro' : 'Customer'}
                    </span>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center whl-btn whl-btn-outline"
                    >
                      Sign up
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center whl-btn whl-btn-primary"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
