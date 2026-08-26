'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Lock,
  Sparkles
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';
import PriceTag from '@/components/ui/PriceTag';

export default function BookingConfirmCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const proId = (params.id as string) || 'pro-1';
  const pro = MOCK_PROS.find((p) => p.id === proId) || MOCK_PROS[0];

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [promoCode, setPromoCode] = useState('WORKHUB100');
  const [promoApplied, setPromoApplied] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock booking calculation
  const services = pro.services.slice(0, 1);
  const baseTotal = services.reduce((s, i) => s + i.price, 0);
  const platformFee = 49;
  const tax = Math.round(baseTotal * 0.18);
  const discount = promoApplied ? 100 : 0;
  const grandTotal = Math.max(0, baseTotal + platformFee + tax - discount);

  const handleCompleteBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      router.push(`/book/${pro.id}/success`);
    }, 900);
  };

  return (
    <div
      className="min-h-screen bg-[#f4eee4]"
      style={{ fontFamily: 'var(--gesso-font-body)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Back */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#606060]">
          <Link href={`/book/${pro.id}`} className="hover:text-[#2a2a2a] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Configuration</span>
          </Link>
          <span>/</span>
          <span className="text-[#2a2a2a]">Step 2 of 2: Review & Secure Checkout</span>
        </div>

        <div className="bg-[#ffffff] rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <h1
              className="text-xl sm:text-2xl font-extrabold text-[#2a2a2a]"
              style={{ fontFamily: 'var(--gesso-font-display)' }}
            >
              Review & Finalize Booking
            </h1>
            <p className="text-xs text-[#606060] mt-0.5">
              Check your job summary and select your preferred payment mode.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#2f68c5] bg-[rgba(59,130,246,0.1)] px-3 py-1.5 rounded-full font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Order Summary & Payment Mode (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Appointment Recap */}
            <div className="bg-[#ffffff] rounded-xl p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#606060]">
                Appointment Summary
              </h3>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#eae4db]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pro.avatar}
                  alt={pro.name}
                  className="w-14 h-14 rounded-xl object-cover border border-black/5"
                />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#2a2a2a]">{pro.name}</h4>
                  <p className="text-xs text-[#606060]">{pro.title}</p>
                  <div className="flex items-center gap-3 text-xs text-[#606060] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2f68c5]" />
                      Wed, 19 Aug • 10:30 AM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#606060]" />
                      Sector 35-C, Chandigarh
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold text-[#2a2a2a]">Tasks Included:</h5>
                {services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-black/5">
                    <span className="text-[#2a2a2a]">{s.name}</span>
                    <span className="font-semibold text-[#2a2a2a]">₹{s.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-[#ffffff] rounded-xl p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#606060]">
                Select Payment Method
              </h3>

              <div className="space-y-3">
                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'UPI'
                      ? 'border-[#f5a623] bg-[rgba(245,166,35,0.12)]'
                      : 'border-[#eae4db] bg-white hover:bg-[#f4eee4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.1)] text-[#2f68c5] flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2a2a2a]">Instant UPI (GPay / PhonePe / Paytm)</h4>
                      <p className="text-xs text-[#606060]">Pay securely via your favorite UPI app</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="accent-[#f5a623] w-4 h-4"
                  />
                </div>

                {/* Cards */}
                <div
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'CARD'
                      ? 'border-[#f5a623] bg-[rgba(245,166,35,0.12)]'
                      : 'border-[#eae4db] bg-white hover:bg-[#f4eee4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#eae4db] text-[#606060] flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2a2a2a]">Credit / Debit Card / NetBanking</h4>
                      <p className="text-xs text-[#606060]">Visa, Mastercard, RuPay & all major banks</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="accent-[#f5a623] w-4 h-4"
                  />
                </div>

                {/* Pay after service */}
                <div
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'CASH'
                      ? 'border-[#f5a623] bg-[rgba(245,166,35,0.12)]'
                      : 'border-[#eae4db] bg-white hover:bg-[#f4eee4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(20,147,67,0.1)] text-[#149343] flex items-center justify-center">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2a2a2a]">Pay After Service Completion</h4>
                      <p className="text-xs text-[#606060]">Pay cash or UPI directly to Rahul after job inspection</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'CASH'}
                    onChange={() => setPaymentMethod('CASH')}
                    className="accent-[#f5a623] w-4 h-4"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Cost Breakdown & Confirm Button (1 col) */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#ffffff] rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#606060]">
                Payment Summary
              </h3>

              {/* Promo Code Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#606060] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#875b13]" />
                  <span>Promo Code</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="whl-input flex-1 px-3 py-2 text-xs font-bold uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setPromoApplied(!promoApplied)}
                    className="whl-btn whl-btn-outline px-3 py-2 text-xs whitespace-nowrap"
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-[11px] text-[#149343] font-medium">
                    ✓ WORKHUB100 applied (-₹100 savings)
                  </p>
                )}
              </div>

              {/* Cost Rows */}
              <div className="space-y-2 pt-3 border-t border-black/5 text-xs">
                <div className="flex justify-between text-[#606060]">
                  <span>Items Subtotal</span>
                  <span>₹{baseTotal}</span>
                </div>
                <div className="flex justify-between text-[#606060]">
                  <span>Safety & Insurance Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-[#606060]">
                  <span>Taxes (GST 18%)</span>
                  <span>₹{tax}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-[#149343] font-semibold">
                    <span>First Booking Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-black/5 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#2a2a2a]">Total Amount</span>
                  <PriceTag amount={grandTotal} size="lg" />
                </div>
              </div>

              {/* Confirm CTA */}
              <button
                onClick={handleCompleteBooking}
                disabled={isProcessing}
                className="whl-btn whl-btn-primary w-full py-3.5 px-4 text-sm disabled:opacity-75"
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

              <p className="text-[11px] text-center text-[#9c9c9c] leading-tight">
                By confirming, you agree to WorkHub Terms of Service and Cancellation Policy.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
