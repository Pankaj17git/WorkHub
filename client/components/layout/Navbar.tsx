'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, ShieldCheck, ChevronDown, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Chandigarh');

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
              Track Active Job
            </Link>

            <Link
              href="/search"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0051d5] hover:bg-[#0042b0] rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              Book a Pro
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
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
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#0051d5] rounded-lg"
              >
                Book a Verified Pro
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
