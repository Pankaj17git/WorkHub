'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  User, 
  MapPin, 
  CheckCircle2, 
  Upload, 
  Lock,
  Sparkles
} from 'lucide-react';

export default function WorkerSignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('Chandigarh');
  const [experienceYears, setExperienceYears] = useState('5');
  const [tradeCategory, setTradeCategory] = useState('Electricians');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) return;
    setOtpSent(true);
  };

  const handleVerifyAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/worker/onboarding/skills');
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WorkHub Pro Partner Registration</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#091426] tracking-tight">
          Join 1,500+ Verified Pros in Chandigarh
        </h1>
        <p className="text-xs sm:text-sm text-[#64748b] max-w-lg mx-auto">
          Get direct customer bookings, instant daily payouts, zero hidden commissions, and ₹10,000 accidental damage protection.
        </p>
      </div>

      {/* Main Registration Box */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        
        {/* Stepper Progress */}
        <div className="flex items-center justify-between pb-6 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#0051d5] text-white flex items-center justify-center text-xs font-bold font-geist">
              1
            </span>
            <span className="text-xs font-bold text-[#0051d5]">Personal & Contact</span>
          </div>
          <span className="w-12 h-px bg-[#e2e8f0]" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center text-xs font-bold font-geist">
              2
            </span>
            <span className="text-xs font-medium text-[#64748b]">Skill Selection</span>
          </div>
          <span className="w-12 h-px bg-[#e2e8f0]" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center text-xs font-bold font-geist">
              3
            </span>
            <span className="text-xs font-medium text-[#64748b]">KYC Verification</span>
          </div>
        </div>

        {!otpSent ? (
          /* Step 1A: Basic Details */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Full Legal Name (as on Aadhaar card)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Mobile Phone Number (for WhatsApp & OTP)</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] font-geist"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Primary Working City</span>
                </label>
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
                <label className="text-xs font-bold text-[#334155]">Years of Trade Experience</label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] font-geist"
                >
                  <option value="2">2+ Years</option>
                  <option value="5">5+ Years</option>
                  <option value="8">8+ Years</option>
                  <option value="12">12+ Years (Master)</option>
                </select>
              </div>

            </div>

            {/* Trust check */}
            <div className="p-3.5 rounded-xl bg-[#f0fdfa] border border-[#ccfbf1] text-xs text-[#0f766e] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0d9488] shrink-0" />
              <span>We do not share your private number. All bookings are protected under WorkHub Partner terms.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Verify Mobile & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 1B: OTP Verification */
          <form onSubmit={handleVerifyAndProceed} className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#091426]">Enter 4-Digit Verification Code</h3>
              <p className="text-xs text-[#64748b]">
                Sent via SMS to <strong className="text-[#091426] font-geist">+91 {mobileNumber}</strong>
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                placeholder="4829"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className="w-full text-center tracking-[1em] text-2xl font-bold font-geist py-3 px-4 bg-[#f8f9ff] border-2 border-[#0051d5] rounded-xl focus:outline-none"
              />
              <span className="text-[11px] text-[#64748b] block mt-2">
                (Demo OTP: <strong>4829</strong>)
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <span>Verifying...</span> : <span>Confirm & Proceed to Skill Selection</span>}
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
