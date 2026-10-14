'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Check, 
  Phone,
  FileText
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';
import { ServiceItem, Professional } from '@/types';
import TimeSlotPicker from '@/components/booking/TimeSlotPicker';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import PriceTag from '@/components/ui/PriceTag';

export default function BookingStep1Page() {
  const params = useParams();
  const router = useRouter();
  const proId = (params.id as string) || 'pro-1';
  const fallbackPro = MOCK_PROS.find((p) => p.id === proId) || MOCK_PROS[0];
  const [pro, setPro] = useState<Professional>(fallbackPro);

  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([
    fallbackPro.services[0],
  ]);
  const [selectedDate, setSelectedDate] = useState('Wed, 19 Aug 2026');
  const [selectedTime, setSelectedTime] = useState('10:30 AM - 11:30 AM');
  const [address, setAddress] = useState('House # 1422, Sector 35-C');
  const [city, setCity] = useState('Chandigarh');
  const [contactNumber, setContactNumber] = useState('+91 98765 43210');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (!proId || proId.startsWith('pro-')) return;

    const fetchWorker = async () => {
      try {
        const res = await fetch(`/api/workers/${proId}`);
        if (res.ok) {
          const data = await res.json();
          const w = data.worker || data.data?.worker;
          if (w) {
            const mappedPro: Professional = {
              id: w.id,
              name: w.name,
              title: w.headline || 'Verified Professional',
              avatar: w.profileImage,
              coverImage:
                'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80',
              category: w.skills?.[0] || 'Specialist',
              location: w.address
                ? `${w.address.city || ''}${w.address.state ? ', ' + w.address.state : ''}`
                : 'Location on request',
              distanceKm: 0,
              rating: w.rating || 5.0,
              reviewCount: w.reviewCount || 0,
              completedJobs: w.reviewCount ? w.reviewCount * 3 : 12,
              experienceYears: 5,
              hourlyRate: w.hourlyRate || 299,
              verified: w.isVerified,
              online: true,
              responseTimeMinutes: 15,
              about: w.bio || 'Verified service professional on WorkHub.',
              skills: w.skills || [],
              services:
                w.services && w.services.length > 0
                  ? w.services.map((s: { id: string; name: string; price: number }) => ({
                      id: s.id,
                      name: s.name,
                      description: `Professional service provided by ${w.name}`,
                      price: s.price,
                      durationMinutes: 60,
                    }))
                  : [
                      {
                        id: 'srv-1',
                        name: `${w.skills?.[0] || 'Specialist'} Consultation & Service`,
                        description: 'Standard specialist service booking',
                        price: w.hourlyRate || 299,
                        durationMinutes: 60,
                        popular: true,
                      },
                    ],
              reviews: [],
              badges: [w.isVerified ? 'Verified Specialist' : 'Direct Hire', 'Top Rated'],
            };
            setPro(mappedPro);
            if (mappedPro.services.length) {
              setSelectedServices([mappedPro.services[0]]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch worker for booking:', err);
      }
    };

    fetchWorker();
  }, [proId]);

  const toggleService = (srv: ServiceItem) => {
    if (selectedServices.some((s) => s.id === srv.id)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s.id !== srv.id));
      }
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleProceedToConfirm = () => {
    // Store in localStorage for multi-step booking consistency
    if (typeof window !== 'undefined') {
      const bookingPayload = {
        proId: pro.id,
        proName: pro.name,
        selectedServices,
        date: selectedDate,
        timeSlot: selectedTime,
        address,
        city,
        contactNumber,
        instructions,
      };
      localStorage.setItem('active_booking', JSON.stringify(bookingPayload));
    }
    router.push(`/book/${pro.id}/confirm`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#64748b]">
        <Link href={`/pro/${pro.id}`} className="hover:text-[#091426] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {pro.name}</span>
        </Link>
        <span>/</span>
        <span className="text-[#091426]">Step 1 of 2: Schedule & Address</span>
      </div>

      {/* Stepper indicator banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 sm:p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#091426]">
            Configure Your Service Request
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Choose your required tasks, preferred appointment window, and service address.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[#0051d5] text-white flex items-center justify-center text-xs font-bold font-geist">
            1
          </span>
          <span className="text-xs font-semibold text-[#0051d5]">Service & Time</span>
          <span className="w-6 h-px bg-[#cbd5e1]" />
          <span className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center text-xs font-bold font-geist">
            2
          </span>
          <span className="text-xs font-medium text-[#64748b]">Review & Pay</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Services to perform */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#091426] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center text-xs font-bold font-geist">
                  1
                </span>
                <span>Select Services Needed</span>
              </h3>
              <span className="text-xs text-[#64748b] font-geist">
                {selectedServices.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {pro.services.map((srv) => {
                const isChecked = selectedServices.some((s) => s.id === srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'border-[#0051d5] bg-[#eff6ff]/30'
                        : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-[#0051d5] border-[#0051d5] text-white' : 'border-[#cbd5e1]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-[#091426]">
                        {srv.name}
                      </span>
                    </div>
                    <PriceTag amount={srv.price} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Schedule appointment */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[#091426] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center text-xs font-bold font-geist">
                2
              </span>
              <span>Select Date & Time Window</span>
            </h3>

            <TimeSlotPicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />
          </div>

          {/* 3. Address & Contact */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[#091426] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center text-xs font-bold font-geist">
                3
              </span>
              <span>Service Location & Instructions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Street Address / House Number</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
                  placeholder="e.g. Flat 302, Palm Heights, Sector 35"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155]">City / Region</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
                >
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Mohali">Mohali</option>
                  <option value="Panchkula">Panchkula</option>
                  <option value="Zirakpur">Zirakpur</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Contact Mobile Number</span>
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] font-geist"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>Special Note / Symptoms (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
                  placeholder="e.g. Main MCB trips when AC turns on, please bring spare 32A breaker."
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Sticky Summary (1 col) */}
        <div className="lg:col-span-1">
          <BookingSummaryCard
            pro={pro}
            selectedServices={selectedServices}
            date={selectedDate}
            time={selectedTime}
            ctaText="Proceed to Review & Pay"
            onProceed={handleProceedToConfirm}
          />
        </div>

      </div>

    </div>
  );
}
