'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
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
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6 bg-[#f4eee4] min-h-screen">
        <div className="w-16 h-16 rounded-full bg-[rgba(20,147,67,0.1)] text-[#149343] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <h2 className="whl-h2 text-2xl sm:text-3xl text-[#2a2a2a]">
            Thank You for Your Feedback!
          </h2>
          <p className="text-xs sm:text-sm text-[#606060] max-w-md mx-auto">
            Your review helps {pro.name} maintain his verified status and assists fellow residents in Chandigarh.
          </p>
        </div>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="whl-btn whl-btn-primary px-6 py-2.5 text-xs"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="whl-btn whl-btn-outline px-6 py-2.5 text-xs"
          >
            Explore More Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#f4eee4] min-h-screen">

      {/* Header Back */}
      <div className="flex items-center justify-between">
        <Link
          href={`/bookings/${pro.id}/track`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#606060] hover:text-[#2a2a2a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Tracking</span>
        </Link>
        <span
          className="text-xs text-[#606060] font-semibold"
          style={{ fontFamily: 'var(--gesso-font-mono)' }}
        >
          Order #WH-784920
        </span>
      </div>

      <div className="whl-panel rounded-xl p-6 sm:p-8 space-y-8">

        {/* Pro Banner Header */}
        <div className="text-center space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pro.avatar}
            alt={pro.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] mx-auto"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2a2a2a]" style={{ fontFamily: 'var(--gesso-font-display)' }}>
              How was your service with {pro.name}?
            </h1>
            <p className="text-xs text-[#606060] mt-0.5">
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
                className="p-1 hover:scale-125 transition-transform"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-[#f5a623] text-[#f5a623]'
                      : 'text-[#bcbcbc]'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-[#875b13]">
            {rating === 5 && 'Excellent & Flawless Experience (5.0)'}
            {rating === 4 && 'Very Good & Professional (4.0)'}
            {rating === 3 && 'Average Service (3.0)'}
            {rating < 3 && 'Needs Improvement'}
          </p>
        </div>

        {/* Positive Highlight Tags */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#606060] block text-center">
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
                  className={`whl-chip !text-xs px-3 py-1.5 transition-all ${
                    isSelected
                      ? '!bg-[rgba(245,166,35,0.14)] !text-[#875b13] border border-[#f5a623]'
                      : 'bg-white text-[#2a2a2a] border border-[#dddddd] hover:bg-[#eae4db]'
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
          <label className="text-xs font-bold text-[#2a2a2a] block">
            Write a detailed review (Optional)
          </label>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="whl-input w-full p-3.5 text-xs sm:text-sm leading-relaxed resize-none"
            placeholder="Share specific details about the work done, punctuality, and behavior..."
          />
        </div>

        {/* Add a Tip for Rahul */}
        <div className="p-4 rounded-xl bg-[#eae4db] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#875b13]" />
              <h4 className="text-xs font-bold text-[#2a2a2a]" style={{ fontFamily: 'var(--gesso-font-display)' }}>
                Add a Tip for {pro.name}?
              </h4>
            </div>
            <span className="text-[10px] text-[#606060] font-semibold">
              100% goes directly to the pro
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0, 50, 100, 200].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTipAmount(amt)}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  tipAmount === amt
                    ? 'bg-[#f5a623] text-black border-[#f5a623]'
                    : 'bg-white text-[#2a2a2a] border-[#dddddd] hover:bg-[#f4eee4]'
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
          className="whl-btn whl-btn-primary w-full py-3.5 px-4 text-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Submit Verified Review {tipAmount > 0 ? `& Pay ₹${tipAmount} Tip` : ''}</span>
        </button>

      </div>

    </div>
  );
}
