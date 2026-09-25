'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Zap,
  Snowflake,
  Hammer,
  Package,
  Brush,
  Users,
  Briefcase,
  CheckCircle2,
  ArrowUpRight,
  Droplet
} from 'lucide-react';
import {
  POPULAR_SERVICES,
  HOW_IT_WORKS_STEPS,
  TRUST_STATS,
  USER_TESTIMONIALS,
  TRUSTED_BADGES,
} from '@/data/landingData';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

export default function HomePage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  useEffect(() => {
    if (session?.role === 'CUSTOMER') {
      router.replace('/dashboard');
    } else if (session?.role === 'WORKER') {
      router.replace('/worker/dashboard');
    }
  }, [session, router]);

  if (session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0066f5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Header / Navigation Bar */}
      <Navbar />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-blue-100/60 via-sky-50/40 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-6 space-y-6">

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#0f172a] tracking-tight leading-[1.12]">
                Find Skilled Workers <br />
                for{' '}
                <span className="text-[#0066f5]">
                  Any Job, Anytime
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl font-normal">
                WorkHub connects you with verified professionals for home services, maintenance, repairs and more — quickly, safely and conveniently.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#0066f5] hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all hover:-translate-y-0.5"
                >
                  <span>Find a Worker</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/signup?role=WORKER"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white hover:bg-blue-50/50 text-[#0066f5] border border-blue-200 text-sm font-bold shadow-xs hover:border-blue-300 transition-all hover:-translate-y-0.5"
                >
                  <span>Become a Worker</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-100">
                {
                  TRUSTED_BADGES.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                      <div key={index} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0066f5] shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 leading-tight">
                          {badge.label}
                        </span>
                      </div>
                    );
                  })
                }
              </div>

            </div>

            {/* Hero Right Visual Collage */}
            <div className="lg:col-span-6 relative flex items-center justify-center pt-6 lg:pt-0">
              
              {/* Decorative radial background */}
              <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-blue-100 via-sky-100 to-indigo-50 -z-10 blur-xl opacity-80" />

              {/* Main Worker Image */}
              <div className="relative w-full max-w-[700px] rounded-3xl overflow-hidden">
                <img
                  src="/images/hero-image.png"
                  alt="WorkHub skilled professionals team"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Popular Services Section */}
      <section className="py-16 sm:py-20 bg-[#fafcff] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Top Header with Badge & "View All Services" */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3 max-w-2xl">

              {/* Title with decorative dashes */}
              <div className="relative inline-block">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
                  Popular <span className="text-[#0066f5] relative">
                    Services
                    {/* Decorative accent dashes */}
                    <Sparkles className="absolute -top-3.5 -right-6 w-5 h-5 text-[#0066f5]" />
                  </span>
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-500">
                Find the right professional for your needs. From home repairs to professional maintenance, we&apos;ve got you covered.
              </p>
            </div>

            {/* View All Services Button */}
            <div className="shrink-0">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-200/80 bg-white hover:bg-blue-50 text-xs sm:text-sm font-bold text-[#0066f5] shadow-xs hover:border-blue-300 transition-all group"
              >
                <span>View All Services</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 8-Card Grid (4 cols x 2 rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Top Image / Collage */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    {service.isCollage ? (
                      <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-0.5 p-0.5 bg-slate-200">
                        {service.collageImages?.map((cImg, idx) => (
                          <img
                            key={idx}
                            src={cImg}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ))}
                      </div>
                    ) : (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Category Title & Icon */}
                    <Link
                      href={service.href}
                      className="flex items-center justify-between group/link"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${service.bg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover/link:text-[#0066f5] transition-colors leading-snug">
                            {service.title}
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover/link:text-[#0066f5] group-hover/link:translate-x-0.5 transition-all shrink-0" />
                    </Link>

                    {/* Sub-services Checklist (2x2 grid) */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3 pt-3 border-t border-slate-100/80">
                      {service.subServices.map((sub, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1.5 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="text-[11px] text-slate-600 truncate font-medium">
                            {sub}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Rating & "View Details" CTA */}
                  <div className="px-4 pb-4 pt-2.5 border-t border-slate-50 flex items-center justify-between mt-auto">
                    {/* User Avatars & Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <img
                          className="inline-block h-5 w-5 rounded-full ring-1 ring-white object-cover"
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                          alt="User"
                        />
                        <img
                          className="inline-block h-5 w-5 rounded-full ring-1 ring-white object-cover"
                          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&auto=format&fit=crop&q=80"
                          alt="User"
                        />
                        <img
                          className="inline-block h-5 w-5 rounded-full ring-1 ring-white object-cover"
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80"
                          alt="User"
                        />
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 leading-tight">
                        {service.rating} <span className="text-[10px] text-slate-400 font-normal">({service.reviews})</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0066f5] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow transition-all shrink-0"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Bottom Guarantee Banner: "Trusted Professionals, Guaranteed" */}
          <div className="mt-12 bg-[#f0f6ff] border border-blue-100 rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
            
            {/* Left: Shield & Heading */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#0066f5] text-white flex items-center justify-center shadow-md shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm  font-extrabold text-slate-900">
                  Trusted Professionals, Guaranteed
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  All our workers are verified, skilled and rated by real customers.
                </p>
              </div>
            </div>

            {/* Center: 4 trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
              {
                TRUSTED_BADGES.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#0066f5] shrink-0" />
                      <span className="text-[11px] sm:text-xs">{badge.label}</span>
                    </div>
                  );
                })
              }
            </div>

            {/* Right: Find a Worker Button & Handwritten playful note */}
            <div className="flex items-center gap-3 relative shrink-0">
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0066f5] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Find a Worker</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {/* Playful callout text */}
              <div className="hidden xl:flex items-center gap-1 text-[#0066f5] font-serif italic text-xs -rotate-2 select-none">
                <span className="leading-tight">Quality work<br />just a click away!</span>
                <ArrowUpRight className="w-5 h-5 text-[#0066f5]" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f0f6ff]/70 border border-blue-100/80 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* Left Column: Heading + 4 Horizontal Steps */}
              <div className="lg:col-span-8 space-y-8">
                {/* Section Header */}
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
                    How It Works
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 mt-2">
                    Get your job done in just a few simple steps.
                  </p>
                </div>

                {/* 4 Steps in a single horizontal row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  {HOW_IT_WORKS_STEPS.map((step, idx) => (
                    <div key={step.number} className="relative flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-9 h-9 rounded-full ${step.color} text-white font-extrabold text-sm flex items-center justify-center shadow-md shrink-0`}
                        >
                          {step.number}
                        </div>

                        {/* Connecting chevron arrow if not the last step */}
                        {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                          <ChevronRight className="hidden lg:block w-4 h-4 text-blue-400 select-none pr-1" />
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {step.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Smartphone Mockup with Sparks */}
              <div className="lg:col-span-4 flex justify-center relative pt-4 lg:pt-0">
                
                {/* Decorative Purple Sparks on the left */}
                <div className="absolute -left-4 sm:-left-6 top-1/3 flex flex-col gap-1 text-purple-400 select-none pointer-events-none">
                  <Sparkles className="w-5 h-5" />
                  <Sparkles className="w-3.5 h-3.5 ml-2" />
                </div>

                {/* Decorative Cyan Sparks on the top right */}
                <div className="absolute -right-2 sm:-right-4 top-6 flex flex-col gap-1 text-sky-400 select-none pointer-events-none">
                  <Sparkles className="w-5 h-5" />
                  <Sparkles className="w-3.5 h-3.5 ml-2" />
                </div>

                {/* Smartphone Frame */}
                <div className="relative w-[260px] sm:w-[280px] bg-slate-900 rounded-[2.75rem] p-3 shadow-2xl ring-1 ring-slate-900/10">
                  {/* Dynamic island / speaker */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20" />

                  {/* Smartphone Screen Content */}
                  <div className="relative bg-white rounded-[2.25rem] overflow-hidden pt-7 pb-4 px-3 flex flex-col space-y-3">
                    
                    {/* Photo of AC technician servicing unit */}
                    <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                      <img
                        src="/images/ac-technician.jpg"
                        alt="AC repair in progress"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-blue-700 shadow-sm">
                        On-Demand
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-2 px-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">AC Repair & Service</h4>
                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                          4.9 ★
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Abu Dhabi / Local</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Today, 10:00 AM - 2:00 PM</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-semibold">Estimated Price</div>
                          <div className="text-xs font-extrabold text-slate-900">AED 150 - 250</div>
                        </div>
                      </div>

                      {/* Book Now Button */}
                      <Link
                        href="/search?category=appliance-repair"
                        className="w-full py-2 bg-[#0066f5] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center transition-all mt-1"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>

                  {/* Floating "Secure & Reliable" badge */}
                  <div className="absolute top-28 -right-6 sm:-right-8 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl border border-slate-100 flex items-center gap-2.5 z-30">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#0066f5] shadow-xs shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 leading-tight">Secure</div>
                      <div className="text-[10px] text-slate-500 font-medium">& Reliable</div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. Trusted by Thousands (Social Proof / Stats - Without Cards, Divider Borders Only) */}
      <section className="py-16 sm:py-20 bg-[#fafcff] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Trusted by Thousands
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              Join our growing community of happy customers and skilled professionals.
            </p>
          </div>

          {/* Stats row without cards, separated only by borders */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 max-w-5xl mx-auto text-center">
            {TRUST_STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="py-6 sm:py-4 px-4 flex flex-col items-center"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3.5 ${stat.bg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. What Our Users Say (Testimonials) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {USER_TESTIMONIALS.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                  />
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.name}</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(item.rating)].map((_, starIndex) => (
                      <Star key={starIndex} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Ready to get started? (Bottom CTA Banner) */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#3b82f6] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to get started?
            </h3>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
              Join WorkHub today and experience a smarter way to get things done.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 shrink-0">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-[#0066f5] rounded-xl font-bold text-sm shadow-md transition-all hover:-translate-y-0.5"
            >
              <span>Find a Worker</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup?role=WORKER"
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-white/10 text-white border border-white/40 hover:border-white rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            >
              <span>Become a Worker</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <Footer/>
    </div>
  );
}


