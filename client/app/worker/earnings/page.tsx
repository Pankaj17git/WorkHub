'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  Download,
  Building,
  CheckCircle2,
  Clock,
  Heart,
  ShieldCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { MOCK_WORKER_METRICS, MOCK_EARNINGS_HISTORY } from '@/data/mockWorkerData';
import MetricCard from '@/components/worker/MetricCard';
import PriceTag from '@/components/ui/PriceTag';

export default function WorkerEarningsAnalyticsPage() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
    }, 1200);
  };

  const maxAmount = Math.max(...MOCK_EARNINGS_HISTORY.map((h) => h.amount));

  return (
    <div className="space-y-8">

      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold text-[#2a2a2a] tracking-tight"
            style={{ fontFamily: 'var(--gesso-font-display)' }}
          >
            Earnings & Payout Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#606060] mt-1">
            Track daily job revenues, direct customer tips, and initiate instant bank withdrawals.
          </p>
        </div>

        <button
          onClick={() => alert('Tax report PDF generated and downloaded.')}
          className="px-4 py-2.5 bg-[#f4eee4] hover:bg-[#eae4db] text-[#2a2a2a] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Statement (GST/TDS)</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Available Wallet Balance"
          value={`₹${MOCK_WORKER_METRICS.walletBalance.toLocaleString('en-IN')}`}
          subtitle="Instant 24/7 IMPS/UPI Payout"
          icon={Wallet}
          variant="teal"
        />
        <MetricCard
          title="This Week's Revenue"
          value={`₹${MOCK_WORKER_METRICS.weeklyEarnings.toLocaleString('en-IN')}`}
          subtitle="27 Completed assignments"
          icon={TrendingUp}
          variant="primary"
          trend="+22% vs last week"
        />
        <MetricCard
          title="Customer Tips Received"
          value={`₹1,250`}
          subtitle="100% credited to your wallet"
          icon={Heart}
          variant="amber"
        />
      </div>

      {/* Main Grid: Weekly Chart + Bank Transfer Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left 2 Cols: Weekly Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="text-base font-bold text-[#2a2a2a]"
                style={{ fontFamily: 'var(--gesso-font-display)' }}
              >
                Weekly Earnings Trend
              </h3>
              <p className="text-xs text-[#606060]">Revenues from 13 Aug – 19 Aug 2026</p>
            </div>
            <span className="text-xs font-bold text-[#5E7B3A] bg-[rgba(94,123,58,0.12)] px-3 py-1 rounded-full">
              Avg. ₹2,400 / day
            </span>
          </div>

          {/* Bar chart visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-black/5">
            {MOCK_EARNINGS_HISTORY.map((item) => {
              const heightPercent = Math.round((item.amount / maxAmount) * 100);
              const isToday = item.day.includes('Today');

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[11px] font-bold text-[#2a2a2a] opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{item.amount}
                  </span>

                  <div className="w-full max-w-[40px] bg-[#eae4db] rounded-t-lg overflow-hidden h-40 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-[#5E7B3A]'
                          : 'bg-[#5E7B3A]/30 group-hover:bg-[#5E7B3A]'
                      }`}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-bold ${
                      isToday ? 'text-[#2a2a2a]' : 'text-[#606060]'
                    }`}
                  >
                    {item.day.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Recent Payout Transactions list */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#606060]">
              Recent Completed Payouts
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4eee4] text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(20,147,67,0.12)] text-[#149343] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-[#2a2a2a] block">HDFC Bank (A/C •••• 9128)</strong>
                    <span className="text-[#606060]">18 Aug 2026 • Ref #IMPS-89312</span>
                  </div>
                </div>
                <span className="font-bold text-[#149343] text-sm">+₹6,500</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4eee4] text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(20,147,67,0.12)] text-[#149343] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-[#2a2a2a] block">HDFC Bank (A/C •••• 9128)</strong>
                    <span className="text-[#606060]">12 Aug 2026 • Ref #IMPS-87410</span>
                  </div>
                </div>
                <span className="font-bold text-[#149343] text-sm">+₹8,200</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Transfer to Bank Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#606060]">
              Withdraw to Bank
            </h3>

            {/* Linked Bank Card */}
            <div className="p-4 rounded-xl bg-[#f4eee4] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2a2a2a]">
                  <Building className="w-4 h-4 text-[#C9713A]" />
                  <span>HDFC Bank Limited</span>
                </div>
                <span className="text-[10px] font-bold text-[#149343] bg-[rgba(20,147,67,0.12)] px-2 py-0.5 rounded">
                  Primary
                </span>
              </div>
              <div className="text-xs text-[#606060]">
                A/C: ••••••••• 9128 • IFSC: HDFC0001244
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#2a2a2a]">Withdrawal Amount</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#2a2a2a]">
                  ₹
                </span>
                <input
                  type="text"
                  readOnly
                  value="8,420"
                  className="whl-input w-full pl-8 pr-4 py-2.5 text-sm font-bold"
                />
              </div>
            </div>

            {withdrawSuccess ? (
              <div className="p-4 rounded-xl bg-[rgba(20,147,67,0.12)] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#149343] mx-auto" />
                <h4 className="text-sm font-bold text-[#149343]">Transfer Initiated!</h4>
                <p className="text-xs text-[#149343]">
                  ₹8,420 will arrive in your HDFC account within 15 minutes.
                </p>
              </div>
            ) : (
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="w-full py-3.5 px-4 bg-[#f5a623] hover:brightness-95 text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isWithdrawing ? (
                  <span>Processing Transfer...</span>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Transfer ₹8,420 to Account</span>
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-2 text-[11px] text-[#606060]">
              <ShieldCheck className="w-4 h-4 text-[#149343] shrink-0" />
              <span>Direct Bank IMPS Transfer • Zero processing fees</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
