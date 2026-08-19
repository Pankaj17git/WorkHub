'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Users, 
  Award, 
  Clock, 
  Zap,
  TrendingUp
} from 'lucide-react';
import CategoryGrid from '@/components/marketplace/CategoryGrid';
import ProCard from '@/components/marketplace/ProCard';
import { MOCK_PROS } from '@/data/mockData';
import DotDistortionBackground from '@/components/ui/DotDistortionBackground';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('Chandigarh');
  const parentcontainerRef = useRef<HTMLDivElement>(null);

  const popularSearches = [
    'Fan Repair',
    'AC Foam Wash',
    'MCB Trip Diagnostic',
    'Kitchen Faucet Leak',
    'Smart Lock Fitting',
    'Water Tank Clean',
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section ref={parentcontainerRef} className="relative bg-gradient-to-b from-[#091426] via-[#0f1d38] to-[#091426] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Dot Distortion Background */}
        <DotDistortionBackground
          dotSize={1.6}
          dotSpacing={26}
          dotColor="#38bdf8"
          dotOpacity={0.4}
          distortionIntensity={9}
          interactionRadius={140}
          interactionStrength={24}
          containerRef={parentcontainerRef}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e293b]/90 border border-[#334155] text-xs font-semibold text-[#38bdf8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chandigarh’s #1 Verified Trades & Services Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Book Trusted, Background-Checked <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#60a5fa] to-[#93c5fd] bg-clip-text text-transparent">
              Local Professionals
            </span> In Minutes.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#cbd5e1] leading-relaxed">
            Direct pricing, real-time arrival tracking, and a ₹10,000 damage protection guarantee on every home service booking.
          </p>

          {/* Main Search Container */}
          <div className="max-w-3xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2 text-[#0d1c2e] mt-8">
            
            {/* Location selector */}
            <div className="flex items-center gap-2 px-3 py-2 sm:py-3 w-full sm:w-48 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
              <MapPin className="w-4 h-4 text-[#0051d5] shrink-0" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-[#091426] focus:outline-none w-full cursor-pointer"
              >
                <option value="Chandigarh">Chandigarh</option>
                <option value="Mohali">Mohali</option>
                <option value="Panchkula">Panchkula</option>
                <option value="Zirakpur">Zirakpur</option>
              </select>
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
