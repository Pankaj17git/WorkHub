'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, Clock, ThumbsUp, Filter } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

interface ReviewItem {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  date: string;
  service: string;
  comment: string;
  verified: boolean;
}

const mockReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    customerName: 'Rashid Al Nuaimi',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    date: '15 Apr 2025',
    service: 'AC Installation & Duct Sealing',
    comment:
      'Ahmed arrived exactly on time with all the proper equipment. Fixed the cooling efficiency issue in less than 2 hours. Very polite and professional work!',
    verified: true,
  },
  {
    id: 'rev-2',
    customerName: 'Fatima Al Mansoori',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    date: '12 Apr 2025',
    service: 'Emergency Electrical MCB Trip',
    comment:
      'Rapid response when our main distribution box started tripping. Diagnosed the short circuit safely and cleaned up the wiring thoroughly.',
    verified: true,
  },
  {
    id: 'rev-3',
    customerName: 'Vikram Mehta',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    rating: 4,
    date: '08 Apr 2025',
    service: 'Ceiling Fan & Light Fixtures Assembly',
    comment:
      'Solid execution. Installed 3 heavy fans and chandeliers. Good attention to detail, highly recommended for electrical setups.',
    verified: true,
  },
];

export default function WorkerReviewsPage() {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const filteredReviews =
    filterRating === 'all'
      ? mockReviews
      : mockReviews.filter((r) => r.rating === filterRating);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-geist">
          Reviews & Ratings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your customer satisfaction scores, ratings breakdown, and verified client testimonials.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Average Rating"
          value="★ 4.8"
          trend="Top 5% in Region"
          trendType="positive"
          variant="amber"
          icon={Star}
        />
        <StatCard
          title="Total Reviews"
          value="48"
          trend="↑ 6 this month"
          trendType="positive"
          variant="blue"
          icon={MessageSquare}
        />
        <StatCard
          title="5-Star Ratings"
          value="92%"
          trend="42 positive reviews"
          trendType="positive"
          variant="green"
          icon={ThumbsUp}
        />
        <StatCard
          title="On-Time Rate"
          value="98.5%"
          trend="Fast arrival guarantee"
          variant="purple"
          icon={Clock}
        />
      </div>

      {/* Main Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Rating Breakdown Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Rating Breakdown</h3>
          
          <div className="flex items-center gap-4 py-2 border-b border-slate-100">
            <div className="text-4xl font-black text-slate-900 font-geist">4.8</div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Based on 48 verified customer ratings</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { stars: 5, count: 42, pct: 88 },
              { stars: 4, count: 5, pct: 10 },
              { stars: 3, count: 1, pct: 2 },
              { stars: 2, count: 0, pct: 0 },
              { stars: 1, count: 0, pct: 0 },
            ].map((bar) => (
              <div key={bar.stars} className="flex items-center gap-3">
                <span className="w-12 text-slate-600 font-semibold">{bar.stars} Stars</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-slate-400">{bar.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Testimonials List */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Customer Testimonials</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Stars</option>
                <option value={5}>5 Stars only</option>
                <option value={4}>4 Stars</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 space-y-4">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rev.customerAvatar}
                      alt={rev.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{rev.customerName}</span>
                        {rev.verified && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Customer
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-[#0062ff] font-medium">{rev.service}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{rev.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
