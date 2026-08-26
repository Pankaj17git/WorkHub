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
  Sparkles
} from 'lucide-react';
import { clearSession, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Chandigarh');
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  // Check if user is currently on login or signup pages
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  /* Minimalist Header for Login & Signup Pages */
  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 bg-[#ffffff] border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#091426] to-[#0051d5] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                W<span className="text-[#38bdf8]">H</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-[#091426] leading-none">
                  Work<span className="text-[#0051d5]">Hub</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider font-geist mt-0.5">
                  Verified Marketplace
                </span>
              </div>
            </Link>

            {/* Right side: Login / Signup links + Return Home */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  pathname.includes('login')
                    ? 'bg-[#f1f5f9] text-[#091426]'
                    : 'text-[#64748b] hover:text-[#091426]'
                }`}
              >
                Log In
              </Link>

              <Link
                href="/signup"
                className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all ${
                  pathname.includes('signup')
                    ? 'bg-[#0051d5] text-white shadow-md'
                    : 'bg-[#eff6ff] text-[#0051d5] hover:bg-[#dbeafe]'
                }`}
              >
                Sign Up
              </Link>

              <span className="w-px h-5 bg-[#e2e8f0] hidden sm:inline-block" />

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#091426] transition-colors"
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
    <header className="sticky top-0 z-50 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e2e8f0]">
      {/* Top micro alert banner */}
      <div className="bg-[#091426] text-[#ffffff] px-4 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0d9488]" />
        <span>100% Background-Checked Professionals & Up to ₹10,000 Damage Cover</span>
        <span className="hidden md:inline-block text-[#94a3b8]">|</span>
        <span className="hidden md:inline-block text-[#38bdf8]">Use code WORKHUB100 for ₹100 off your first booking</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#091426] to-[#0051d5] flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                W<span className="text-[#38bdf8]">H</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#091426] leading-none">
                  Work<span className="text-[#0051d5]">Hub</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#64748b] tracking-wider font-geist mt-0.5">
                  Verified Local Pros
                </span>
              </div>
            </Link>

            {/* City selector dropdown */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] text-sm text-[#0d1c2e] hover:bg-[#e2e8f0] cursor-pointer transition-colors">
              <MapPin className="w-4 h-4 text-[#0051d5]" />
              <span className="font-medium">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
            </div>
          </div>

          {/* Quick Search in Nav */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form action="/search" method="GET" className="relative w-full">
              <input
                type="text"
                name="q"
                placeholder="Search electrician, plumber, AC service..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/15 transition-all text-[#0d1c2e] placeholder:text-[#94a3b8]"
              />
              <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              className="px-3.5 py-2 text-sm font-medium text-[#475569] hover:text-[#091426] hover:bg-[#f1f5f9] rounded-lg transition-colors"
            >
              Explore Services
            </Link>
            
            <Link
              href="/bookings/pro-1/track"
              className="px-3.5 py-2 text-sm font-medium text-[#475569] hover:text-[#091426] hover:bg-[#f1f5f9] rounded-lg transition-colors"
            >
              Track Job
            </Link>

            {/* UI ROLE SWITCHER BUTTON */}
            {session?.role === 'WORKER' ? (
              <Link
                href="/worker/dashboard"
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#0d9488] hover:bg-[#0b7c73] text-white shadow-xs transition-all flex items-center gap-1.5 group"
                title="Go to your Service Partner Dashboard"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#99f6e4] group-hover:scale-110 transition-transform" />
                <span>Worker Dashboard</span>
              </Link>
            ) : session?.role === 'CUSTOMER' ? (
              <Link
                href="/worker/dashboard"
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#091426] border border-[#cbd5e1] transition-all flex items-center gap-1.5"
                title="Switch to Worker Mode"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Switch to Worker</span>
              </Link>
            ) : (
              <Link
                href="/login?role=WORKER"
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0] transition-all flex items-center gap-1.5"
                title="Worker Portal"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#0d9488]" />
                <span>Worker Portal</span>
              </Link>
            )}

            {/* Login / Account Buttons */}
            {session ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#091426] bg-[#f1f5f9] rounded-xl border border-[#e2e8f0]">
                  <User className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span className="max-w-28 truncate">{session.name || session.email}</span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    session.role === 'WORKER'
                      ? 'bg-[#ecfdf5] text-[#0d9488] border border-[#a7f3d0]'
                      : 'bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe]'
                  }`}>
                    {session.role === 'WORKER' ? 'Pro' : 'Customer'}
                  </span>
                </div>
                <button
                  onClick={() => { clearSession(); router.push('/login'); }}
                  className="p-2 text-xs font-semibold text-[#64748b] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-[#091426] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                >
                  Log In
                </Link>

                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#0051d5] hover:bg-[#0042b0] rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile quick role switcher icon/button */}
            {session?.role === 'WORKER' ? (
              <Link
                href="/worker/dashboard"
                className="px-2.5 py-1 text-xs font-bold bg-[#0d9488] text-white rounded-lg flex items-center gap-1"
              >
                <Briefcase className="w-3 h-3" />
                <span>Pro</span>
              </Link>
            ) : (
              <Link
                href="/worker/dashboard"
                className="px-2.5 py-1 text-xs font-bold bg-[#f1f5f9] text-[#091426] border border-[#cbd5e1] rounded-lg flex items-center gap-1"
              >
                <ArrowLeftRight className="w-3 h-3 text-[#0051d5]" />
                <span>Worker</span>
              </Link>
            )}

            {session ? (
              <button
                onClick={() => { clearSession(); router.push('/login'); }}
                className="px-2.5 py-1 text-xs font-bold text-[#64748b] hover:text-red-600 bg-[#f1f5f9] rounded-lg flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1 text-xs font-bold text-[#0051d5] bg-[#eff6ff] rounded-lg"
              >
                Log In
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#0d1c2e] hover:bg-[#f1f5f9]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#e2e8f0] space-y-3">
            <form action="/search" method="GET" className="relative w-full">
              <input
                type="text"
                name="q"
                placeholder="Search electrician, plumber, carpenter..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0051d5]"
              />
              <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[#0d1c2e] hover:bg-[#f1f5f9] rounded-lg"
              >
                All Services
              </Link>
              <Link
                href="/bookings/pro-1/track"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[#0d1c2e] hover:bg-[#f1f5f9] rounded-lg"
              >
                Track Live Booking
              </Link>

              {/* Mobile UI Role Switcher Button */}
              <Link
                href="/worker/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#f0fdfa] border border-[#a7f3d0] text-xs font-bold text-[#0d9488]"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#0d9488]" />
                  <span>{session?.role === 'WORKER' ? 'Go to Worker Dashboard' : 'Switch to Worker Mode'}</span>
                </div>
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f1f5f9]">
                {session ? (
                  <div className="col-span-2 flex items-center justify-between px-3 py-2.5 text-xs font-bold text-[#091426] bg-[#f1f5f9] rounded-xl">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0051d5]" />
                      <span className="truncate">{session.name || session.email}</span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      session.role === 'WORKER'
                        ? 'bg-[#ecfdf5] text-[#0d9488] border border-[#a7f3d0]'
                        : 'bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe]'
                    }`}>
                      {session.role === 'WORKER' ? 'Pro' : 'Customer'}
                    </span>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 text-xs font-bold text-[#091426] bg-[#f1f5f9] rounded-xl"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 text-xs font-bold text-white bg-[#0051d5] rounded-xl"
                    >
                      Sign Up
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
