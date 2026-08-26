import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Professional, ServiceItem } from '@/types';
import PriceTag from '../ui/PriceTag';

interface BookingSummaryCardProps {
  pro: Professional;
  selectedServices: ServiceItem[];
  date?: string;
  time?: string;
  onProceed?: () => void;
  ctaText?: string;
  showCta?: boolean;
  href?: string;
}

export default function BookingSummaryCard({
  pro,
  selectedServices,
  date,
  time,
  onProceed,
  ctaText = 'Proceed to Checkout',
  showCta = true,
  href,
}: BookingSummaryCardProps) {
  const baseTotal = selectedServices.reduce((sum, item) => sum + item.price, 0);
  const platformFee = baseTotal > 0 ? 49 : 0;
  const tax = Math.round(baseTotal * 0.18);
  const finalTotal = baseTotal + platformFee + tax;

  return (
    <div className="bg-[#ffffff] rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sticky top-24 space-y-6">
      
      {/* Pro mini summary */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-[rgba(0,0,0,0.06)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pro.avatar}
          alt={pro.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#eae4db] bg-[#eae4db]"
        />
        <div>
          <h4 className="text-sm whl-display font-bold text-[#2a2a2a]">{pro.name}</h4>
          <p className="text-xs text-[#606060]">{pro.title}</p>
          <div className="flex items-center gap-1 text-[11px] text-[#2f68c5] font-semibold mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Background
          </div>
        </div>
      </div>

      {/* Selected Services breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#606060] uppercase tracking-wider">
          <span>Selected Services ({selectedServices.length})</span>
        </div>

        {selectedServices.length === 0 ? (
          <p className="text-xs text-[#9c9c9c] italic py-2">
            No services selected yet. Please select at least one service.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {selectedServices.map((srv) => (
              <div key={srv.id} className="flex items-center justify-between text-xs text-[#2a2a2a] py-1 border-b border-[rgba(0,0,0,0.04)] last:border-b-0">
                <span className="truncate pr-2 font-semibold">{srv.name}</span>
                <span className="font-bold shrink-0">₹{srv.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Slot Details if chosen */}
      {(date || time) && (
        <div className="p-3 rounded-lg bg-[#eae4db] border border-transparent space-y-1.5 text-xs text-[#606060]">
          {date && (
            <div className="flex items-center gap-2">
              <span className="text-[#606060]">Scheduled:</span>
              <strong className="text-[#2a2a2a] font-bold">{date}</strong>
            </div>
          )}
          {time && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#2f68c5]" />
              <span className="font-semibold">{time}</span>
            </div>
          )}
        </div>
      )}

      {/* Price breakdown */}
      <div className="space-y-2 pt-2 border-t border-[rgba(0,0,0,0.06)] text-xs">
        <div className="flex items-center justify-between text-[#606060]">
          <span>Service Total</span>
          <span>₹{baseTotal}</span>
        </div>
        <div className="flex items-center justify-between text-[#606060]">
          <span>Convenience & Safety Fee</span>
          <span>₹{platformFee}</span>
        </div>
        <div className="flex items-center justify-between text-[#606060]">
          <span>GST (18%)</span>
          <span>₹{tax}</span>
        </div>
        
        <div className="pt-3 border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between">
          <span className="text-sm whl-display font-bold text-[#2a2a2a]">Total Payable</span>
          <PriceTag amount={finalTotal} size="lg" />
        </div>
      </div>

      {/* Guarantee badge */}
      <div className="p-2.5 rounded-lg bg-[rgba(20,147,67,0.08)] border border-[rgba(20,147,67,0.2)] text-[11px] text-[#149343] font-semibold flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>Pay after service option available. 100% money-back guarantee.</span>
      </div>

      {/* CTA Button */}
      {showCta && (
        <div>
          {href ? (
            <Link
              href={href}
              className={`w-full py-3 px-4 rounded-lg text-center text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                selectedServices.length > 0
                  ? 'bg-[#f5a623] hover:brightness-95 active:scale-[0.98] text-black'
                  : 'bg-[#eae4db] text-[#9c9c9c] cursor-not-allowed pointer-events-none'
              }`}
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={onProceed}
              disabled={selectedServices.length === 0}
              className={`w-full py-3 px-4 rounded-lg text-center text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                selectedServices.length > 0
                  ? 'bg-[#f5a623] hover:brightness-95 active:scale-[0.98] text-black'
                  : 'bg-[#eae4db] text-[#9c9c9c] cursor-not-allowed'
              }`}
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

    </div>
  );
}
