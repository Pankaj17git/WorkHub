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
    <div className="bg-[#ffffff] rounded-xl p-6 space-y-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#2f68c5]" />
          <h3 className="whl-display font-bold text-sm text-[#2a2a2a] uppercase tracking-wider">
            Filters
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#2f68c5] hover:underline font-semibold"
        >
          Reset All
        </button>
      </div>

      {/* Verified Only Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#eae4db] border border-transparent">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#149343]" />
          <span className="text-xs font-bold text-[#2a2a2a]">
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
          <div className="w-9 h-5 bg-[#bcbcbc] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[rgba(0,0,0,0.06)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#149343]"></div>
        </label>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold text-[#606060] uppercase tracking-wider">
          Service Category
        </h4>
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg font-semibold transition-colors flex items-center justify-between ${
              selectedCategory === 'all'
                ? 'bg-[#eae4db] text-[#2a2a2a] font-bold'
                : 'text-[#606060] hover:bg-[#f4eee4]'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-[#2a2a2a]" />}
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`w-full text-left px-3 py-2 text-xs rounded-lg font-semibold transition-colors flex items-center justify-between ${
                selectedCategory === cat.name
                  ? 'bg-[#eae4db] text-[#2a2a2a] font-bold'
                  : 'text-[#606060] hover:bg-[#f4eee4]'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategory === cat.name && <Check className="w-3.5 h-3.5 text-[#2a2a2a]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div className="space-y-3 pt-4 border-t border-[rgba(0,0,0,0.04)]">
        <h4 className="text-[11px] font-bold text-[#606060] uppercase tracking-wider">
          Minimum Rating
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[0, 4.0, 4.5, 4.8].map((rate) => (
            <button
              key={rate}
              onClick={() => onSelectRating(rate)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                minRating === rate
                  ? 'bg-[#2a2a2a] text-white border-[#2a2a2a] shadow-sm'
                  : 'bg-[#ffffff] text-[#606060] border-[rgba(0,0,0,0.08)] hover:bg-[#f4eee4]'
              }`}
            >
              <Star className={`w-3 h-3 ${minRating === rate ? 'fill-[#f5a623] text-[#f5a623]' : 'fill-[#875b13] text-[#875b13]'}`} />
              <span>{rate === 0 ? 'Any' : `${rate}+`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Distance Radius */}
      <div className="space-y-3 pt-4 border-t border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-[#606060] uppercase tracking-wider">
            Distance Radius
          </h4>
          <span className="text-xs font-bold text-[#2f68c5]">
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
          className="w-full h-1.5 bg-[#eae4db] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
        />
        <div className="flex justify-between text-[10px] text-[#9c9c9c]">
          <span>2 km</span>
          <span>10 km</span>
          <span>25 km</span>
        </div>
      </div>

    </div>
  );
}
