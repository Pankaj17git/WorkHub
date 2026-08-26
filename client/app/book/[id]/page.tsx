'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Check, 
  Info,
  Phone,
  FileText
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';
import { ServiceItem } from '@/types';
import TimeSlotPicker from '@/components/booking/TimeSlotPicker';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard';
import PriceTag from '@/components/ui/PriceTag';

export default function BookingStep1Page() {
  const params = useParams();
  const router = useRouter();
  const proId = (params.id as string) || 'pro-1';
  const pro = MOCK_PROS.find((p) => p.id === proId) || MOCK_PROS[0];

  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([
    pro.services[0],
  ]);
  const [selectedDate, setSelectedDate] = useState('Wed, 19 Aug 2026');
  const [selectedTime, setSelectedTime] = useState('10:30 AM - 11:30 AM');
  const [address, setAddress] = useState('House # 1422, Sector 35-C');
  const [city, setCity] = useState('Chandigarh');
  const [contactNumber, setContactNumber] = useState('+91 98765 43210');
  const [instructions, setInstructions] = useState('');

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
    // Store in localStorage for demo multi-step consistency
    if (typeof window !== 'undefined') {
      const bookingPayload = {
        proId: pro.id,
        selectedServices,
        date: selectedDate,
        timeSlot: selectedTime,
        address: `${address}, ${city}`,
        contactNumber,
        instructions,
      };
      localStorage.setItem('active_booking', JSON.stringify(bookingPayload));
    }
    router.push(`/book/${pro.id}/confirm`);
  };

  return (
    <div
      className="min-h-screen bg-[#f4eee4]"
      style={{ fontFamily: 'var(--gesso-font-body)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#606060]">
          <Link href={`/pro/${pro.id}`} className="hover:text-[#2a2a2a] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {pro.name}</span>
          </Link>
          <span>/</span>
          <span className="text-[#2a2a2a]">Step 1 of 2: Schedule & Address</span>
        </div>

        {/* Stepper indicator banner */}
        <div className="bg-[#ffffff] rounded-xl p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <h1
              className="text-xl sm:text-2xl font-extrabold text-[#2a2a2a]"
              style={{ fontFamily: 'var(--gesso-font-display)' }}
            >
              Configure Your Service Request
            </h1>
            <p className="text-xs text-[#606060] mt-0.5">
              Choose your required tasks, preferred appointment window, and service address.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span className="text-xs font-semibold text-[#2a2a2a]">Service & Time</span>
            <span className="w-6 h-px bg-[#dddddd]" />
            <span className="w-8 h-8 rounded-full bg-[#eae4db] text-[#606060] flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span className="text-xs font-medium text-[#606060]">Review & Pay</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Services to perform */}
            <div className="bg-[#ffffff] rounded-xl p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-bold text-[#2a2a2a] flex items-center gap-2"
                  style={{ fontFamily: 'var(--gesso-font-display)' }}
                >
                  <span className="w-6 h-6 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Select Services Needed</span>
                </h3>
                <span className="text-xs text-[#606060]">
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
                          ? 'border-[#f5a623] bg-[rgba(245,166,35,0.12)]'
                          : 'border-[#eae4db] bg-white hover:bg-[#f4eee4]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-[#f5a623] border-[#f5a623] text-black' : 'border-[#bcbcbc]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-[#2a2a2a]">
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
            <div className="bg-[#ffffff] rounded-xl p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h3
                className="text-base font-bold text-[#2a2a2a] flex items-center gap-2"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                <span className="w-6 h-6 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-xs font-bold">
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
            <div className="bg-[#ffffff] rounded-xl p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h3
                className="text-base font-bold text-[#2a2a2a] flex items-center gap-2"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                <span className="w-6 h-6 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>Service Location & Instructions</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#606060] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2f68c5]" />
                    <span>Street Address / House Number</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="whl-input w-full px-3.5 py-2.5 text-xs sm:text-sm"
                    placeholder="e.g. Flat 302, Palm Heights, Sector 35"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#606060]">City / Region</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="whl-input w-full px-3.5 py-2.5 text-xs sm:text-sm"
                  >
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Mohali">Mohali</option>
                    <option value="Panchkula">Panchkula</option>
                    <option value="Zirakpur">Zirakpur</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#606060] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#2f68c5]" />
                    <span>Contact Mobile Number</span>
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="whl-input w-full px-3.5 py-2.5 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#606060] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#606060]" />
                    <span>Special Note / Symptoms (Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="whl-input w-full px-3.5 py-2.5 text-xs sm:text-sm"
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
    </div>
  );
}
