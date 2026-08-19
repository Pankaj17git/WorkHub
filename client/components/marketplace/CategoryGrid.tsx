import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Wrench, 
  Wind, 
  Hammer, 
  Paintbrush, 
  Sparkles, 
  ShieldAlert, 
  Cpu,
  ArrowRight
} from 'lucide-react';
import { MOCK_CATEGORIES } from '@/data/mockData';

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-6 h-6 text-[#0051d5]" />,
  Wrench: <Wrench className="w-6 h-6 text-[#0051d5]" />,
  Wind: <Wind className="w-6 h-6 text-[#0051d5]" />,
  Hammer: <Hammer className="w-6 h-6 text-[#0051d5]" />,
  Paintbrush: <Paintbrush className="w-6 h-6 text-[#0051d5]" />,
  Sparkles: <Sparkles className="w-6 h-6 text-[#0051d5]" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-[#0051d5]" />,
  Cpu: <Cpu className="w-6 h-6 text-[#0051d5]" />,
};

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {MOCK_CATEGORIES.map((cat) => (
        <Link
          key={cat.id}
          href={`/search?category=${encodeURIComponent(cat.name)}`}
          className="group relative p-5 bg-[#ffffff] border border-[#e2e8f0] rounded-2xl transition-all duration-200 hover:border-[#0051d5] hover:shadow-lg hover:shadow-[#0051d5]/5 hover:-translate-y-1 flex flex-col justify-between"
        >
          {cat.popular && (
            <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold font-geist uppercase tracking-wider text-[#0051d5] bg-[#eff6ff] rounded-full border border-[#bfdbfe]">
              Popular
            </span>
          )}

          <div>
            <div className="w-12 h-12 rounded-xl bg-[#f0f4ff] border border-[#dbeafe] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white transition-colors">
              <span className="group-hover:[&>svg]:text-white transition-colors">
                {iconMap[cat.iconName] || <Zap className="w-6 h-6 text-[#0051d5]" />}
              </span>
            </div>
            <h3 className="mt-4 font-bold text-base text-[#091426] group-hover:text-[#0051d5] transition-colors">
              {cat.name}
            </h3>
            <p className="text-xs text-[#64748b] mt-1 font-geist">
              {cat.proCount} Verified Pros
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
            <span className="text-[#64748b]">
              Starts at <strong className="text-[#091426] font-geist font-semibold">₹{cat.startingPrice}</strong>
            </span>
            <ArrowRight className="w-4 h-4 text-[#0051d5] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
        </Link>
      ))}
    </div>
  );
}
