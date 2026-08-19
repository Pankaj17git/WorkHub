'use client';

import React from 'react';
import { Filter, Star, ShieldCheck, Check } from 'lucide-react';
import { MOCK_CATEGORIES } from '@/data/mockData';

interface FilterSidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  minRating: number;
  onSelectRating: (rating: number) => void;
  verifiedOnly: boolean;
  onToggleVerified: (val: boolean) => void;
  maxDistance: number;
  onDistanceChange: (km: number) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  selectedCategory,
  onSelectCategory,
  minRating,
  onSelectRating,
  verifiedOnly,
  onToggleVerified,
  maxDistance,
  onDistanceChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0051d5]" />
          <h3 className="font-bold text-sm text-[#091426] uppercase tracking-wider font-geist">
            Filters
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#0051d5] hover:underline font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Verified Only Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0fdfa] border border-[#ccfbf1]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
          <span className="text-xs font-semibold text-[#0f766e]">
            Verified Pros Only
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => onToggleVerified(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#cbd5e1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e2e8f0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0d9488]"></div>
        </label>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider font-geist">
          Service Category
        </h4>
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors flex items-center justify-between ${
              selectedCategory === 'all'
                ? 'bg-[#eff6ff] text-[#0051d5] font-bold'
                : 'text-[#475569] hover:bg-[#f8f9ff]'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-[#0051d5]" />}
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.name
                  ? 'bg-[#eff6ff] text-[#0051d5] font-bold'
                  : 'text-[#475569] hover:bg-[#f8f9ff]'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategory === cat.name && <Check className="w-3.5 h-3.5 text-[#0051d5]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div className="space-y-3 pt-4 border-t border-[#f1f5f9]">
        <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider font-geist">
          Minimum Rating
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[0, 4.0, 4.5, 4.8].map((rate) => (
            <button
              key={rate}
              onClick={() => onSelectRating(rate)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                minRating === rate
                  ? 'bg-[#091426] text-white border-[#091426] shadow-sm'
                  : 'bg-[#ffffff] text-[#475569] border-[#e2e8f0] hover:bg-[#f8f9ff]'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{rate === 0 ? 'Any' : `${rate}+`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Distance Radius */}
      <div className="space-y-3 pt-4 border-t border-[#f1f5f9]">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider font-geist">
            Distance Radius
          </h4>
          <span className="text-xs font-semibold text-[#0051d5] font-geist">
            Within {maxDistance} km
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="25"
          step="1"
          value={maxDistance}
          onChange={(e) => onDistanceChange(Number(e.target.value))}
          className="w-full h-1.5 bg-[#e2e8f0] rounded-lg appearance-none cursor-pointer accent-[#0051d5]"
        />
        <div className="flex justify-between text-[10px] text-[#94a3b8] font-geist">
          <span>2 km</span>
          <span>10 km</span>
          <span>25 km</span>
        </div>
      </div>

    </div>
  );
}
