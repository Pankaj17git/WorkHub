'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Clock, 
  MapPin, 
  Lock,
  Sparkles
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';
import { ServiceItem, Professional } from '@/types';
import PriceTag from '@/components/ui/PriceTag';
import { getToken } from '@/lib/auth-client';

interface ActiveBookingData {
  proId?: string;
  proName?: string;
  selectedServices?: ServiceItem[];
  date?: string;
  timeSlot?: string;
  address?: string;
  city?: string;
  contactNumber?: string;
  instructions?: string;
}

export default function BookingConfirmCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const proId = (params.id as string) || 'pro-1';
  const fallbackPro = MOCK_PROS.find((p) => p.id === proId) || MOCK_PROS[0];
  const [pro, setPro] = useState<Professional>(fallbackPro);
  const [bookingData, setBookingData] = useState<ActiveBookingData | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [promoCode, setPromoCode] = useState('WORKHUB100');
  const [promoApplied, setPromoApplied] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBooking = () => {
      try {
        const stored = localStorage.getItem('active_booking');

        if (stored) {
          const parsed = JSON.parse(stored) as ActiveBookingData;

          if (!cancelled) {
            setBookingData(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to parse active_booking from localStorage', e);
      }
    };

    const timeoutId = window.setTimeout(loadBooking, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {

    // Fetch live worker details if real numeric worker ID
    if (!proId || proId.startsWith('pro-')) return;

    const fetchWorker = async () => {
      try {
        const res = await fetch(`/api/workers/${proId}`);
        if (res.ok) {
          const data = await res.json();
          const w = data.worker || data.data?.worker;
          if (w) {
            setPro({
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
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch worker details for checkout:', err);
      }
    };

    fetchWorker();
  }, [proId]);

  // Booking calculation: use services from active_booking if available, else first pro service
  const services =
    bookingData?.selectedServices && bookingData.selectedServices.length > 0
      ? bookingData.selectedServices
      : pro.services.slice(0, 1);
  const baseTotal = services.reduce((s, i) => s + i.price, 0);
  const platformFee = 49;
  const tax = Math.round(baseTotal * 0.18);
  const discount = promoApplied ? 100 : 0;
  const grandTotal = Math.max(0, baseTotal + platformFee + tax - discount);

  const handleCompleteBooking = async () => {
    const token = getToken();
    if (!token) {
      router.push(`/login?role=CUSTOMER&redirect=/book/${pro.id}/confirm`);
      return;
    }

    setIsProcessing(true);
    setBookingError(null);

    const getTomorrowDate = () =>
      new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const parseBookingDate = () => {
      if (!bookingData?.date) return getTomorrowDate();
      const d = new Date(bookingData.date);
      return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : getTomorrowDate();
    };

    const parseTimes = () => {
      const rawSlot = bookingData?.timeSlot || '10:00 - 12:00';
      const parts = rawSlot.split('-');
      return {
        start: parts[0]?.trim() || '10:00',
        end: parts[1]?.trim() || '12:00',
      };
    };

    try {
      const numericWorkerId = pro.id.replace(/\D/g, '') || '1';
      const times = parseTimes();

      const res = await fetch('/api/direct-hire-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workerId: numericWorkerId,
          serviceName: services[0]?.name || 'Home Maintenance Service',
          requestedDate: parseBookingDate(),
          requestedStartTime: times.start,
          requestedEndTime: times.end,
          customerMessage: bookingData?.instructions
            ? `${bookingData.instructions} (Payment mode: ${paymentMethod}, Contact: ${bookingData.contactNumber || 'N/A'})`
            : `Direct booking with payment mode ${paymentMethod}.`,
          proposedPrice: grandTotal,
          address: {
            address: bookingData?.address || 'Customer Job Address',
            city: bookingData?.city || 'Chandigarh',
            state: 'Punjab',
            country: 'India',
            latitude: 30.7333,
            longitude: 76.7794,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error || 'Failed to submit direct hire request.');
        setIsProcessing(false);
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('active_booking');
      }

      router.push(`/book/${pro.id}/success?requestId=${data.request?.id || ''}`);
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingError('An error occurred during checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Back */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[#64748b]">
        <Link href={`/book/${pro.id}`} className="hover:text-[#091426] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Configuration</span>
        </Link>
        <span>/</span>
        <span className="text-[#091426]">Step 2 of 2: Review & Secure Checkout</span>
      </div>

      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#091426]">
            Review & Finalize Booking
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Check your job summary and select your preferred payment mode.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#0d9488] bg-[#f0fdfa] px-3 py-1.5 rounded-full border border-[#ccfbf1] font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {bookingError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {bookingError}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Order Summary & Payment Mode (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Appointment Recap */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748b] font-geist">
              Appointment Summary
            </h3>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pro.avatar}
                alt={pro.name}
                className="w-14 h-14 rounded-xl object-cover border border-[#e2e8f0]"
              />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#091426]">{pro.name}</h4>
                <p className="text-xs text-[#475569]">{pro.title}</p>
                <div className="flex items-center gap-3 text-xs text-[#64748b] pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0051d5]" />
                    {bookingData?.date || 'Wed, 19 Aug'} • {bookingData?.timeSlot || '10:30 AM'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#64748b]" />
                    {bookingData?.address
                      ? `${bookingData.address}${bookingData.city ? ', ' + bookingData.city : ''}`
                      : 'Address specified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold text-[#091426]">Tasks Included:</h5>
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#f1f5f9]">
                  <span className="text-[#334155]">{s.name}</span>
                  <span className="font-geist font-semibold text-[#091426]">₹{s.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748b] font-geist">
              Select Payment Method
            </h3>

            <div className="space-y-3">
              {/* UPI */}
              <div
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'UPI'
                    ? 'border-[#0051d5] bg-[#eff6ff]/40 shadow-xs'
                    : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#eff6ff] text-[#0051d5] flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#091426]">Instant UPI (GPay / PhonePe / Paytm)</h4>
                    <p className="text-xs text-[#64748b]">Pay securely via your favorite UPI app</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="accent-[#0051d5] w-4 h-4"
                />
              </div>

              {/* Cards */}
              <div
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'CARD'
                    ? 'border-[#0051d5] bg-[#eff6ff]/40 shadow-xs'
                    : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] text-[#334155] flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#091426]">Credit / Debit Card / NetBanking</h4>
                    <p className="text-xs text-[#64748b]">Visa, Mastercard, RuPay & all major banks</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="accent-[#0051d5] w-4 h-4"
                />
              </div>

              {/* Pay after service */}
              <div
                onClick={() => setPaymentMethod('CASH')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'CASH'
                    ? 'border-[#0051d5] bg-[#eff6ff]/40 shadow-xs'
                    : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f0fdfa] text-[#0d9488] flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#091426]">Pay After Service Completion</h4>
                    <p className="text-xs text-[#64748b]">Pay cash or UPI directly to Rahul after job inspection</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CASH'}
                  onChange={() => setPaymentMethod('CASH')}
                  className="accent-[#0051d5] w-4 h-4"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Cost Breakdown & Confirm Button (1 col) */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748b] font-geist">
              Payment Summary
            </h3>

            {/* Promo Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#334155] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0051d5]" />
                <span>Promo Code</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs bg-[#f8f9ff] border border-[#e2e8f0] rounded-lg font-geist font-bold uppercase"
                />
                <button
                  type="button"
                  onClick={() => setPromoApplied(!promoApplied)}
                  className="px-3 py-2 text-xs font-semibold bg-[#091426] text-white rounded-lg hover:bg-[#1e293b]"
                >
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {promoApplied && (
                <p className="text-[11px] text-[#0d9488] font-medium">
                  ✓ WORKHUB100 applied (-₹100 savings)
                </p>
              )}
            </div>

            {/* Cost Rows */}
            <div className="space-y-2 pt-3 border-t border-[#f1f5f9] text-xs">
              <div className="flex justify-between text-[#475569]">
                <span>Items Subtotal</span>
                <span className="font-geist">₹{baseTotal}</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Safety & Insurance Fee</span>
                <span className="font-geist">₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Taxes (GST 18%)</span>
                <span className="font-geist">₹{tax}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-[#0d9488] font-semibold">
                  <span>First Booking Discount</span>
                  <span className="font-geist">-₹{discount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#e2e8f0] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#091426]">Total Amount</span>
                <PriceTag amount={grandTotal} size="lg" />
              </div>
            </div>

            {/* Confirm CTA */}
            <button
              onClick={handleCompleteBooking}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isProcessing ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Schedule</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-[#94a3b8] leading-tight">
              By confirming, you agree to WorkHub Terms of Service and Cancellation Policy.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
