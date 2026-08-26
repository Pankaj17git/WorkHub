'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Award, 
  Check, 
  Star, 
  CheckCircle2, 
  Calendar, 
  ArrowLeft,
  Share2,
  Heart,
  PhoneCall,
  Zap
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';
import { ServiceItem } from '@/types';
import RatingStars from '@/components/ui/RatingStars';
import Badge from '@/components/ui/Badge';
import PriceTag from '@/components/ui/PriceTag';
import ReviewCard from '@/components/marketplace/ReviewCard';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';

export default function ProDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proId = (params.id as string) || 'pro-1';
  
  // Find pro or fallback to pro-1
  const pro = MOCK_PROS.find((p) => p.id === proId) || MOCK_PROS[0];

  // Selected services state for interactive configuration
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([
    pro.services[0], // default select first service
  ]);

  const toggleService = (srv: ServiceItem) => {
    if (selectedServices.some((s) => s.id === srv.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== srv.id));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleProceedToBooking = () => {
    router.push(`/book/${pro.id}`);
  };

  return (
    <div className="bg-[#f4eee4] min-h-screen" style={{ fontFamily: 'var(--gesso-font-body)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
        {/* Back button & quick navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#606060] hover:text-[#2a2a2a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Specialists</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white text-[#606060] hover:text-[#2a2a2a] hover:bg-[#f4eee4] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white text-[#606060] hover:text-[#2a2a2a] hover:bg-[#f4eee4] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="bg-[#ffffff] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          
          {/* Cover Photo */}
          <div className="h-44 sm:h-56 relative bg-gradient-to-r from-[#eae4db] to-[#dcd3c5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pro.coverImage}
              alt="Cover"
              className="w-full h-full object-cover opacity-50 mix-blend-multiply"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {pro.badges.map((b, idx) => (
                <span
                  key={idx}
                  className="hidden sm:inline-block px-3 py-1 text-xs font-bold bg-white/90 backdrop-blur-md text-[#2a2a2a] rounded-full border border-[rgba(0,0,0,0.06)]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Profile info section */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
              
              {/* Avatar & Main Titles */}
              <div className="flex items-end gap-5">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-4 ring-[#eae4db] bg-[#eae4db]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {pro.online && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-[#149343] text-white text-[10px] font-bold shadow-md border-2 border-white">
                      Online
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl whl-display font-extrabold text-[#2a2a2a] tracking-tight">
                      {pro.name}
                    </h1>
                    {pro.verified && (
                      <Badge variant="verified">Verified Master Pro</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#606060]">{pro.title}</p>
                  <div className="flex items-center gap-2 text-xs text-[#606060] pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2f68c5]" />
                    <span>{pro.location}</span>
                  </div>
                </div>
              </div>

              {/* Quick stats on top card */}
              <div className="flex items-center gap-6 sm:gap-8 bg-[#eae4db] border border-transparent p-4 rounded-xl w-full sm:w-auto justify-around">
                <div className="text-center">
                  <div className="text-xl whl-display font-extrabold text-[#2a2a2a]">
                    ★ {pro.rating.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-[#606060]">{pro.reviewCount} Reviews</div>
                </div>
                <div className="h-8 w-px bg-[rgba(0,0,0,0.08)]" />
                <div className="text-center">
                  <div className="text-xl whl-display font-extrabold text-[#2a2a2a]">
                    {pro.completedJobs}+
                  </div>
                  <div className="text-[11px] text-[#606060]">Jobs Done</div>
                </div>
                <div className="h-8 w-px bg-[rgba(0,0,0,0.08)]" />
                <div className="text-center">
                  <div className="text-xl whl-display font-extrabold text-[#2a2a2a]">
                    {pro.experienceYears} Yrs
                  </div>
                  <div className="text-[11px] text-[#606060]">Experience</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Main Content Layout (Left Details + Right Sticky Booking) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left 2 Columns: Services, About, Skills, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Services Menu & Interactive Selection */}
            <div className="bg-[#ffffff] rounded-xl p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="whl-h3">Services & Transparent Pricing</h3>
                  <p className="text-xs text-[#606060]">Select the services you need help with</p>
                </div>
                <span className="text-xs font-bold text-[#2f68c5] bg-[rgba(59,130,246,0.1)] px-2.5 py-1 rounded-full">
                  {selectedServices.length} Selected
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {pro.services.map((srv) => {
                  const isSelected = selectedServices.some((s) => s.id === srv.id);

                  return (
                    <div
                      key={srv.id}
                      onClick={() => toggleService(srv)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-[#3b82f6] bg-[rgba(59,130,246,0.05)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                          : 'border-[rgba(0,0,0,0.08)] bg-[#ffffff] hover:border-[#bcbcbc] hover:bg-[#faf7f2]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                              : 'border-[#bcbcbc] bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm whl-display font-bold text-[#2a2a2a]">{srv.name}</h4>
                            {srv.popular && (
                              <span className="text-[10px] font-bold text-[#C9713A] bg-[rgba(201,113,58,0.12)] px-1.5 py-0.5 rounded-full border border-[rgba(201,113,58,0.25)]">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#606060] leading-relaxed">
                            {srv.description}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#606060] font-semibold">
                            <Clock className="w-3 h-3 text-[#606060]" />
                            <span>Est. {srv.durationMinutes} mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <PriceTag amount={srv.price} size="md" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* About & Credentials */}
            <div className="bg-[#ffffff] rounded-xl p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="whl-h3">About the Professional</h3>
              <p className="text-sm text-[#606060] leading-relaxed">
                {pro.about}
              </p>

              <div className="pt-4 border-t border-[rgba(0,0,0,0.04)] space-y-3">
                <h4 className="text-[11px] font-bold text-[#606060] uppercase tracking-wider">
                  Specialized Competencies
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {pro.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full bg-[#eae4db] border border-transparent text-xs font-semibold text-[#606060]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="pt-4 border-t border-[rgba(0,0,0,0.04)] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs text-[#149343] font-semibold bg-[rgba(20,147,67,0.08)] p-3 rounded-xl border border-[rgba(20,147,67,0.2)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Govt. Aadhaar ID Verified</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#149343] font-semibold bg-[rgba(20,147,67,0.08)] p-3 rounded-xl border border-[rgba(20,147,67,0.2)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Police Criminal Background Cleared</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#149343] font-semibold bg-[rgba(20,147,67,0.08)] p-3 rounded-xl border border-[rgba(20,147,67,0.2)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Trade Certificate Audited</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#149343] font-semibold bg-[rgba(20,147,67,0.08)] p-3 rounded-xl border border-[rgba(20,147,67,0.2)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>WorkHub 100% Safety Pledge</span>
                </div>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-[#ffffff] rounded-xl p-6 space-y-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="whl-h3">Customer Reviews</h3>
                  <p className="text-xs text-[#606060]">Verified feedback from local households in Chandigarh</p>
                </div>
                <div className="text-right">
                  <div className="text-xl whl-display font-extrabold text-[#2a2a2a]">
                    {pro.rating.toFixed(2)} / 5.0
                  </div>
                  <div className="text-[11px] text-[#606060]">{pro.reviewCount} total ratings</div>
                </div>
              </div>

              <div className="space-y-4">
                {pro.reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            </div>

          </div>

          {/* Right Sticky Booking Column */}
          <div className="lg:col-span-1">
            <BookingSummaryCard
              pro={pro}
              selectedServices={selectedServices}
              ctaText="Select Date & Time Slot"
              onProceed={handleProceedToBooking}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
