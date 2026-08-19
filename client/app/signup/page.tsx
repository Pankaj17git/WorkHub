'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Lock,
  Sparkles,
  CheckCircle2,
  Briefcase,
  ShoppingBag,
  Zap
} from 'lucide-react';
import OtpPinInput from '@/components/ui/OtpPinInput';

export default function SignupPage() {
  const router = useRouter();

  // Role toggle: 'CUSTOMER' | 'WORKER'
  const [accountType, setAccountType] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Chandigarh');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccountTypeChange = (type: 'CUSTOMER' | 'WORKER') => {
    setAccountType(type);
    if (type === 'WORKER') {
      router.push('/worker/signup');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !fullName) return;
    setOtpSent(true);
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/');
    }, 800);
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#091426] to-[#0051d5] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
          W<span className="text-[#38bdf8]">H</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
          Create Your WorkHub Account
        </h1>
        <p className="text-xs text-[#64748b] max-w-sm mx-auto">
          Choose your account type below to get started with the right portal.
        </p>
      </div>

      {/* Explicit Account Type Chooser Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#64748b] font-geist block text-center">
          Step 1: Select Who You Are
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          
          {/* Customer Choice */}
          <button
            type="button"
            onClick={() => handleAccountTypeChange('CUSTOMER')}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
              accountType === 'CUSTOMER'
                ? 'border-[#0051d5] bg-[#eff6ff] ring-2 ring-[#0051d5]/20 shadow-xs'
                : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#0051d5] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              {accountType === 'CUSTOMER' && (
                <span className="w-5 h-5 rounded-full bg-[#0051d5] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <strong className="text-sm font-bold text-[#091426] block">
                I&apos;m a Customer
              </strong>
              <span className="text-[11px] text-[#64748b] leading-tight block mt-0.5">
                Book verified pros for home repairs & services
              </span>
            </div>
          </button>

          {/* Worker Pro Choice */}
          <button
            type="button"
            onClick={() => handleAccountTypeChange('WORKER')}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
              accountType === 'WORKER'
                ? 'border-[#0d9488] bg-[#f0fdfa] ring-2 ring-[#0d9488]/20 shadow-xs'
                : 'border-[#e2e8f0] bg-white hover:bg-[#f8f9ff]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#0d9488] text-white flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#0d9488] text-[9px] font-bold font-geist border border-[#a7f3d0]">
                Earn ₹
              </span>
            </div>
            <div>
              <strong className="text-sm font-bold text-[#091426] block">
                I&apos;m a Service Pro
              </strong>
              <span className="text-[11px] text-[#64748b] leading-tight block mt-0.5">
                Register as a worker to accept jobs & get paid
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* Main Registration Card for Customer */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
          <span className="text-xs font-bold text-[#0051d5] flex items-center gap-1.5 font-geist uppercase">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Customer Registration Form</span>
          </span>
          <span className="text-[11px] text-[#0d9488] font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Free Signup</span>
          </span>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Amit Verma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Mobile Phone Number</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-geist text-[#64748b]">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] font-geist"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Email Address (Optional)</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>City / Region</span>
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

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Verify Mobile & Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleCompleteRegistration} className="space-y-6 text-center">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#091426]">Verify Phone Number</h3>
              <p className="text-xs text-[#64748b]">
                Enter 4-digit code sent to <strong className="text-[#091426] font-geist">+91 {phone}</strong>
              </p>
            </div>

            <div className="py-2 space-y-2">
              <OtpPinInput
                length={4}
                value={otpValue}
                onChange={setOtpValue}
                autoFocus={true}
              />
              <span className="text-[11px] text-[#64748b] block">
                (Demo OTP: <strong>4829</strong>)
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpValue.length < 4}
              className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'Creating Account...' : 'Confirm & Go to Home'}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="text-xs text-[#0051d5] font-semibold hover:underline block mx-auto pt-1"
            >
              &larr; Change Phone Number
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-[#64748b]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0051d5] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>

    </div>
  );
}
