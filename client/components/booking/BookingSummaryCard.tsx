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
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
      
      {/* Pro mini summary */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-[#e2e8f0]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pro.avatar}
          alt={pro.name}
          className="w-12 h-12 rounded-xl object-cover border border-[#e2e8f0]"
        />
        <div>
          <h4 className="text-sm font-bold text-[#091426]">{pro.name}</h4>
          <p className="text-xs text-[#64748b]">{pro.title}</p>
          <div className="flex items-center gap-1 text-[11px] text-[#0d9488] font-medium mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Background
          </div>
        </div>
      </div>

      {/* Selected Services breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#64748b] uppercase tracking-wider font-geist">
          <span>Selected Services ({selectedServices.length})</span>
        </div>

        {selectedServices.length === 0 ? (
          <p className="text-xs text-[#94a3b8] italic py-2">
            No services selected yet. Please select at least one service.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {selectedServices.map((srv) => (
              <div key={srv.id} className="flex items-center justify-between text-xs text-[#0d1c2e] py-1 border-b border-[#f1f5f9] last:border-b-0">
                <span className="truncate pr-2 font-medium">{srv.name}</span>
                <span className="font-geist font-semibold shrink-0">₹{srv.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Slot Details if chosen */}
      {(date || time) && (
        <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] space-y-1.5 text-xs text-[#334155]">
          {date && (
            <div className="flex items-center gap-2">
              <span className="text-[#64748b]">Scheduled:</span>
              <strong className="text-[#091426] font-geist">{date}</strong>
            </div>
          )}
          {time && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#0051d5]" />
              <span className="font-geist">{time}</span>
            </div>
          )}
        </div>
      )}

      {/* Price breakdown */}
      <div className="space-y-2 pt-2 border-t border-[#e2e8f0] text-xs">
        <div className="flex items-center justify-between text-[#475569]">
          <span>Service Total</span>
          <span className="font-geist">₹{baseTotal}</span>
        </div>
        <div className="flex items-center justify-between text-[#475569]">
          <span>Convenience & Safety Fee</span>
          <span className="font-geist">₹{platformFee}</span>
        </div>
        <div className="flex items-center justify-between text-[#475569]">
          <span>GST (18%)</span>
          <span className="font-geist">₹{tax}</span>
        </div>
        
        <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
          <span className="text-sm font-bold text-[#091426]">Total Payable</span>
          <PriceTag amount={finalTotal} size="lg" />
        </div>
      </div>

      {/* Guarantee badge */}
      <div className="p-2.5 rounded-lg bg-[#f0fdfa] border border-[#ccfbf1] text-[11px] text-[#0f766e] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#0d9488] shrink-0" />
        <span>Pay after service option available. 100% money-back guarantee.</span>
      </div>

      {/* CTA Button */}
      {showCta && (
        <div>
          {href ? (
            <Link
              href={href}
              className={`w-full py-3 px-4 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedServices.length > 0
                  ? 'bg-[#0051d5] hover:bg-[#0042b0] text-white shadow-md hover:shadow-lg'
                  : 'bg-[#cbd5e1] text-[#94a3b8] cursor-not-allowed pointer-events-none'
              }`}
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={onProceed}
              disabled={selectedServices.length === 0}
              className={`w-full py-3 px-4 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedServices.length > 0
                  ? 'bg-[#0051d5] hover:bg-[#0042b0] text-white shadow-md hover:shadow-lg'
                  : 'bg-[#cbd5e1] text-[#94a3b8] cursor-not-allowed'
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
