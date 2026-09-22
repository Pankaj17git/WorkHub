import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ChevronDown } from 'lucide-react';

export interface WeeklyEarningBar {
  week: string;
  amount: number;
  heightPercent: number; // 0 to 100
}

interface WorkerEarningsChartProps {
  totalAmount?: number | string;
  trendPercent?: number | string;
  trendLabel?: string;
  bars?: WeeklyEarningBar[];
  className?: string;
}

const defaultBars: WeeklyEarningBar[] = [
  { week: 'W1', amount: 3200, heightPercent: 40 },
  { week: 'W2', amount: 5800, heightPercent: 72 },
  { week: 'W3', amount: 4900, heightPercent: 62 },
  { week: 'W4', amount: 7600, heightPercent: 92 },
];

export default function WorkerEarningsChart({
  totalAmount = '12,450',
  trendPercent = '+18%',
  trendLabel = 'vs last month',
  bars = defaultBars,
  className = '',
}: WorkerEarningsChartProps) {
  const [timeframe, setTimeframe] = useState<'This Month' | 'Last Month' | 'All Time'>('This Month');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const formattedTotal =
    typeof totalAmount === 'number'
      ? `₹ ${totalAmount.toLocaleString('en-IN')}`
      : totalAmount.startsWith('₹')
      ? totalAmount
      : `₹ ${totalAmount}`;

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all ${className}`}
    >
      {/* Header with Timeframe Dropdown */}
      <div className="flex items-center justify-between relative">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Earnings Overview
        </h3>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 transition-colors"
          >
            <span>{timeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
              {(['This Month', 'Last Month', 'All Time'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setTimeframe(opt);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${
                    timeframe === opt ? 'bg-blue-50 text-[#0062ff] font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Total & Growth Indicator */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-900 font-geist">
          {formattedTotal}
        </span>
        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3" />
          <span>{trendPercent}</span>
          <span className="text-[10px] text-emerald-600/80 font-normal ml-0.5">{trendLabel}</span>
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="mt-6">
        <div className="flex items-end gap-3 h-28 pt-2">
          {/* Y Axis scale markers */}
          <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 font-medium shrink-0 pr-1 select-none">
            <span>15k</span>
            <span>10k</span>
            <span>5k</span>
            <span>0</span>
          </div>

          {/* Bars Container */}
          <div className="flex-1 grid grid-cols-4 gap-3 items-end h-full border-b border-slate-200/80 pb-0.5">
            {bars.map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <div
                  className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-[#0052d4] via-[#2563eb] to-[#38bdf8] transition-all duration-300 group-hover:brightness-110 shadow-xs cursor-pointer relative"
                  style={{ height: `${Math.max(bar.heightPercent, 12)}%` }}
                  title={`${bar.week}: ₹${bar.amount.toLocaleString('en-IN')}`}
                >
                  {/* Tooltip on hover */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-10">
                    ₹{bar.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* X Axis Labels */}
        <div className="flex pl-7 justify-around text-[11px] font-medium text-slate-400 mt-2">
          {bars.map((bar, idx) => (
            <span key={idx} className="text-center w-full max-w-[28px]">
              {bar.week}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Link to Full Wallet */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-right">
        <Link
          href="/worker/earnings"
          className="text-xs font-semibold text-[#0062ff] hover:underline inline-flex items-center gap-1"
        >
          <span>View Detailed Payouts</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
