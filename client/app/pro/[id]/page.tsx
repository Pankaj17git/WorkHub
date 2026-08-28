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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & quick navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Specialists</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#091426] hover:bg-[#f8f9ff]">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#091426] hover:bg-[#f8f9ff]">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-sm">
        
        {/* Cover Photo */}
        <div className="h-44 sm:h-56 relative bg-gradient-to-r from-[#091426] to-[#0051d5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pro.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {pro.badges.map((b, idx) => (
              <span
                key={idx}
                className="hidden sm:inline-block px-3 py-1 text-xs font-semibold bg-[#091426]/80 backdrop-blur-md text-white rounded-full border border-white/20 font-geist"
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
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pro.avatar}
                    alt={pro.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {pro.online && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-[#16a34a] text-white text-[10px] font-bold font-geist shadow-md border-2 border-white">
                    Online
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
                    {pro.name}
                  </h1>
                  {pro.verified && (
                    <Badge variant="verified">Verified Master Pro</Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-[#475569]">{pro.title}</p>
                <div className="flex items-center gap-2 text-xs text-[#64748b] pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>{pro.location}</span>
                </div>
              </div>
            </div>

            {/* Quick stats on top card */}
            <div className="flex items-center gap-6 sm:gap-8 bg-[#f8f9ff] border border-[#e2e8f0] p-4 rounded-2xl w-full sm:w-auto justify-around">
              <div className="text-center">
                <div className="text-xl font-bold text-[#091426] font-geist">
                  ★ {pro.rating.toFixed(2)}
                </div>
                <div className="text-[11px] text-[#64748b]">{pro.reviewCount} Reviews</div>
              </div>
              <div className="h-8 w-px bg-[#e2e8f0]" />
              <div className="text-center">
                <div className="text-xl font-bold text-[#091426] font-geist">
                  {pro.completedJobs}+
                </div>
                <div className="text-[11px] text-[#64748b]">Jobs Done</div>
              </div>
              <div className="h-8 w-px bg-[#e2e8f0]" />
              <div className="text-center">
                <div className="text-xl font-bold text-[#091426] font-geist">
                  {pro.experienceYears} Yrs
                </div>
                <div className="text-[11px] text-[#64748b]">Experience</div>
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
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#091426]">Services & Transparent Pricing</h3>
                <p className="text-xs text-[#64748b]">Select the services you need help with</p>
              </div>
              <span className="text-xs font-semibold text-[#0051d5] font-geist bg-[#eff6ff] px-2.5 py-1 rounded-md">
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
                        ? 'border-[#0051d5] bg-[#eff6ff]/40 shadow-xs'
                        : 'border-[#e2e8f0] bg-[#ffffff] hover:border-[#cbd5e1] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#0051d5] border-[#0051d5] text-white'
                            : 'border-[#cbd5e1] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#091426]">{srv.name}</h4>
                          {srv.popular && (
                            <span className="text-[10px] font-bold text-[#0d9488] bg-[#f0fdfa] px-1.5 py-0.5 rounded border border-[#ccfbf1]">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          {srv.description}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748b] font-geist">
                          <Clock className="w-3 h-3 text-[#0051d5]" />
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
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#091426]">About the Professional</h3>
            <p className="text-sm text-[#475569] leading-relaxed">
              {pro.about}
            </p>

            <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
              <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider font-geist">
                Specialized Competencies
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {pro.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-xs font-medium text-[#334155]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="pt-4 border-t border-[#f1f5f9] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-[#0f766e] bg-[#f0fdfa] p-3 rounded-xl border border-[#ccfbf1]">
                <CheckCircle2 className="w-4 h-4 text-[#0d9488] shrink-0" />
                <span>Govt. Aadhaar ID Verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#0f766e] bg-[#f0fdfa] p-3 rounded-xl border border-[#ccfbf1]">
                <CheckCircle2 className="w-4 h-4 text-[#0d9488] shrink-0" />
                <span>Police Criminal Background Cleared</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#0f766e] bg-[#f0fdfa] p-3 rounded-xl border border-[#ccfbf1]">
                <CheckCircle2 className="w-4 h-4 text-[#0d9488] shrink-0" />
                <span>Trade Certificate Audited</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#0f766e] bg-[#f0fdfa] p-3 rounded-xl border border-[#ccfbf1]">
                <CheckCircle2 className="w-4 h-4 text-[#0d9488] shrink-0" />
                <span>WorkHub 100% Safety Pledge</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#091426]">Customer Reviews</h3>
                <p className="text-xs text-[#64748b]">Verified feedback from local households in Chandigarh</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-geist text-[#091426]">
                  {pro.rating.toFixed(2)} / 5.0
                </div>
                <div className="text-[11px] text-[#64748b]">{pro.reviewCount} total ratings</div>
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
  );
}
