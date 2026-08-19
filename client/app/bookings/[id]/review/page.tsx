'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  ThumbsUp, 
  Camera, 
  CheckCircle2, 
  Heart,
  Sparkles
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';

export default function BookingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const proId = (params.id as string) || 'pro-1';
  const pro = MOCK_PROS.find((p) => p.id === proId) || MOCK_PROS[0];

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Punctual & On Time',
    'Neat & Clean Wiring',
    'Polite Behavior',
  ]);
  const [feedback, setFeedback] = useState(
    'Rahul was phenomenal! He arrived within 15 minutes, identified the tripping issue right away, and ensured our safety earthing was working properly before leaving.'
  );
  const [tipAmount, setTipAmount] = useState<number>(100);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableTags = [
    'Punctual & On Time',
    'Neat & Clean Wiring',
    'Polite Behavior',
    'Fair & Transparent',
    'Expert Diagnostics',
    'Cleaned Up Afterwards',
    'Brought Right Tools',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#0d9488] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-[#091426]">
            Thank You for Your Feedback!
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] max-w-md mx-auto">
            Your review helps {pro.name} maintain his verified status and assists fellow residents in Chandigarh.
          </p>
        </div>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="px-6 py-2.5 bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#091426] text-xs font-semibold rounded-xl border border-[#e2e8f0] transition-colors"
          >
            Explore More Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Back */}
      <div className="flex items-center justify-between">
        <Link
          href={`/bookings/${pro.id}/track`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Tracking</span>
        </Link>
        <span className="text-xs text-[#64748b] font-geist font-semibold">
          Order #WH-784920
        </span>
      </div>

      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Pro Banner Header */}
        <div className="text-center space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pro.avatar}
            alt={pro.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md mx-auto"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#091426]">
              How was your service with {pro.name}?
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Service: Complete Switchboard & Wiring Inspection • Sector 35-C
            </p>
          </div>
        </div>

        {/* 5-Star Interactive Rating */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-[#cbd5e1]'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-[#0051d5] font-geist">
            {rating === 5 && 'Excellent & Flawless Experience (5.0)'}
            {rating === 4 && 'Very Good & Professional (4.0)'}
            {rating === 3 && 'Average Service (3.0)'}
            {rating < 3 && 'Needs Improvement'}
          </p>
        </div>

        {/* Positive Highlight Tags */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#64748b] font-geist block text-center">
            What went especially well?
          </label>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#0051d5] text-white border border-[#0051d5] shadow-xs'
                      : 'bg-[#f8f9ff] text-[#334155] border border-[#e2e8f0] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {isSelected && '✓ '}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Written Review */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#334155] block">
            Write a detailed review (Optional)
          </label>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-3.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#0d1c2e] leading-relaxed"
            placeholder="Share specific details about the work done, punctuality, and behavior..."
          />
        </div>

        {/* Add a Tip for Rahul */}
        <div className="p-4 rounded-2xl bg-[#f0fdfa] border border-[#ccfbf1] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#0d9488]" />
              <h4 className="text-xs font-bold text-[#0f766e]">
                Add a Tip for {pro.name}?
              </h4>
            </div>
            <span className="text-[10px] text-[#0d9488] font-geist font-semibold">
              100% goes directly to the pro
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0, 50, 100, 200].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTipAmount(amt)}
                className={`py-2 rounded-xl text-xs font-bold font-geist border transition-all ${
                  tipAmount === amt
                    ? 'bg-[#0d9488] text-white border-[#0d9488] shadow-sm'
                    : 'bg-white text-[#0f766e] border-[#99f6e4] hover:bg-[#ccfbf1]/50'
                }`}
              >
                {amt === 0 ? 'No Tip' : `₹${amt}`}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Review Button */}
        <button
          onClick={handleSubmitReview}
          className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Submit Verified Review {tipAmount > 0 ? `& Pay ₹${tipAmount} Tip` : ''}</span>
        </button>

      </div>

    </div>
  );
}
