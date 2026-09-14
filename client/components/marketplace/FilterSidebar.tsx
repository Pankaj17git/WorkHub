'use client';

import React, { useState } from 'react';
import {
  Filter,
  Star,
  MapPin,
  Layers,
  Calendar,
  Award,
  Compass,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  Wrench,
  Wind,
  Hammer,
  Paintbrush,
  Sparkles,
  ShieldAlert,
  Cpu,
  Check,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { MOCK_CATEGORIES } from '@/data/mockData';

export interface FilterSidebarProps {
  searchMode?: 'workers' | 'jobs';
  // Location
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  // Category
  selectedCategories: string[];
  onToggleCategory: (cat: string) => void;
  // Availability
  availability: 'any' | 'today' | 'this_week' | 'custom';
  onSelectAvailability: (avail: 'any' | 'today' | 'this_week' | 'custom') => void;
  // Experience
  selectedExperience: string[];
  onToggleExperience: (exp: string) => void;
  // Rating
  minRating: number;
  onSelectRating: (rating: number) => void;
  // Distance
  maxDistance: number;
  onDistanceChange: (km: number) => void;
  // Job Specific
  jobStatus?: 'ALL' | 'OPEN' | 'URGENT';
  onSelectJobStatus?: (status: 'ALL' | 'OPEN' | 'URGENT') => void;
  budgetRange?: 'ALL' | 'LOW' | 'MID' | 'HIGH';
  onSelectBudgetRange?: (b: 'ALL' | 'LOW' | 'MID' | 'HIGH') => void;
  // Reset
  onReset: () => void;
}

const POPULAR_LOCATIONS = [
  'Chandigarh',
  'Sector 17, Chandigarh',
  'Sector 22, Chandigarh',
  'Sector 35, Chandigarh',
  'Mohali',
  'Panchkula',
  'Zirakpur',
  'Delhi NCR',
  'Mumbai',
  'Bengaluru',
];

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Electricians: <Zap className="w-3.5 h-3.5 text-[#0051d5]" />,
  Plumbers: <Wrench className="w-3.5 h-3.5 text-[#0284c7]" />,
  'AC & Appliance Repair': <Wind className="w-3.5 h-3.5 text-[#06b6d4]" />,
  Carpenters: <Hammer className="w-3.5 h-3.5 text-[#d97706]" />,
  Painters: <Paintbrush className="w-3.5 h-3.5 text-[#8b5cf6]" />,
  'Deep Cleaning': <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />,
  'Pest Control': <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />,
  'Home Automation': <Cpu className="w-3.5 h-3.5 text-[#6366f1]" />,
};

export default function FilterSidebar({
  searchMode = 'workers',
  selectedLocation,
  onSelectLocation,
  selectedCategories,
  onToggleCategory,
  availability,
  onSelectAvailability,
  selectedExperience,
  onToggleExperience,
  minRating,
  onSelectRating,
  maxDistance,
  onDistanceChange,
  jobStatus = 'ALL',
  onSelectJobStatus,
  budgetRange = 'ALL',
  onSelectBudgetRange,
  onReset,
}: FilterSidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const displayedCategories = showAllCategories
    ? MOCK_CATEGORIES
    : MOCK_CATEGORIES.slice(0, 6);

  return (
    <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 md:p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0051d5]" />
          <h3 className="font-bold text-sm text-[#091426] tracking-tight font-geist">
            Filters
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#0051d5] hover:text-[#003db3] hover:underline font-semibold transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* 1. Location Selection (Only in Sidebar) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#091426]">
          <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
          <span>Location</span>
        </div>
        <div className="relative">
          <div className="flex items-center bg-[#ffffff] border border-[#cbd5e1] rounded-xl px-3 py-2 text-xs text-[#091426] focus-within:border-[#0051d5] focus-within:ring-2 focus-within:ring-[#0051d5]/10 transition-all">
            <input
              type="text"
              value={selectedLocation}
              onChange={(e) => onSelectLocation(e.target.value)}
              onFocus={() => setLocationDropdownOpen(true)}
              placeholder="Enter city or area..."
              className="w-full bg-transparent outline-none text-xs font-medium placeholder-[#94a3b8]"
            />
            {selectedLocation ? (
              <button
                type="button"
                onClick={() => onSelectLocation('')}
                className="text-[#94a3b8] hover:text-[#091426] p-0.5 rounded-full"
                title="Clear location"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
            )}
          </div>

          {locationDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setLocationDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-20 py-1.5 max-h-48 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider font-geist">
                  Popular Locations
                </div>
                {POPULAR_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc);
                      setLocationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedLocation.toLowerCase() === loc.toLowerCase()
                        ? 'bg-[#eff6ff] text-[#0051d5] font-semibold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocation.toLowerCase() === loc.toLowerCase() && (
                      <Check className="w-3 h-3 text-[#0051d5]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Service Category */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#091426]">
            <Layers className="w-3.5 h-3.5 text-[#0051d5]" />
            <span>Service Category</span>
          </div>
        </div>

        {/* Category Dropdown quick-select */}
        <select
          value={selectedCategories.length === 1 ? selectedCategories[0] : 'all'}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'all') {
              // clear categories
              MOCK_CATEGORIES.forEach((c) => {
                if (selectedCategories.includes(c.name)) onToggleCategory(c.name);
              });
            } else {
              // Set only this category
              MOCK_CATEGORIES.forEach((c) => {
                const isSelected = selectedCategories.includes(c.name);
                if (c.name === val && !isSelected) onToggleCategory(c.name);
                if (c.name !== val && isSelected) onToggleCategory(c.name);
              });
            }
          }}
          className="w-full text-xs font-medium text-[#334155] bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl px-3 py-2 outline-none focus:border-[#0051d5] cursor-pointer"
        >
          <option value="all">All Categories</option>
          {MOCK_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Checkbox Category List */}
        <div className="space-y-2 pt-1">
          {displayedCategories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.name);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 text-xs text-[#334155] hover:text-[#091426] cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleCategory(cat.name)}
                  className="w-4 h-4 rounded border-[#cbd5e1] text-[#0051d5] focus:ring-[#0051d5] cursor-pointer accent-[#0051d5]"
                />
                <span className="shrink-0">
                  {CATEGORY_ICON_MAP[cat.name] || <Layers className="w-3.5 h-3.5 text-[#64748b]" />}
                </span>
                <span className={`flex-1 truncate ${isChecked ? 'font-semibold text-[#091426]' : 'font-normal'}`}>
                  {cat.name}
                </span>
              </label>
            );
          })}

          <button
            type="button"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-xs text-[#0051d5] font-semibold hover:underline flex items-center gap-1 pt-1"
          >
            <span>{showAllCategories ? 'Show less' : 'Show more'}</span>
            {showAllCategories ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Availability (Customer mode) */}
      {searchMode === 'workers' && (
        <div className="space-y-2.5 pt-4 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#091426]">
            <Calendar className="w-3.5 h-3.5 text-[#0051d5]" />
            <span>Availability</span>
          </div>
          <div className="grid grid-cols-4 gap-1 bg-[#f8f9ff] p-1 rounded-xl border border-[#e2e8f0]">
            {(
              [
                { label: 'Any', value: 'any' },
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'this_week' },
                { label: 'Custom', value: 'custom' },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onSelectAvailability(item.value)}
                className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all text-center ${
                  availability === item.value
                    ? 'bg-[#0051d5] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#091426]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Experience Level (Customer mode) */}
      {searchMode === 'workers' && (
        <div className="space-y-2.5 pt-4 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#091426]">
            <Award className="w-3.5 h-3.5 text-[#0051d5]" />
            <span>Experience Level</span>
          </div>
          <div className="space-y-2">
            {[
              { id: 'exp-0-2', label: '0 – 2 years' },
              { id: 'exp-2-5', label: '2 – 5 years' },
              { id: 'exp-5-plus', label: '5+ years' },
            ].map((exp) => {
              const isChecked = selectedExperience.includes(exp.id);
              return (
                <label
                  key={exp.id}
                  className="flex items-center gap-2.5 text-xs text-[#334155] hover:text-[#091426] cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleExperience(exp.id)}
                    className="w-4 h-4 rounded border-[#cbd5e1] text-[#0051d5] focus:ring-[#0051d5] cursor-pointer accent-[#0051d5]"
                  />
                  <span className={isChecked ? 'font-semibold text-[#091426]' : 'font-normal'}>
                    {exp.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Minimum Rating (Customer mode) */}
      {searchMode === 'workers' && (
        <div className="space-y-2.5 pt-4 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#091426]">
            <Star className="w-3.5 h-3.5 text-[#0051d5]" />
            <span>Minimum Rating</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'Any', value: 0 },
              { label: '3+', value: 3.0 },
              { label: '4+', value: 4.0 },
              { label: '4.5+', value: 4.5 },
            ].map((rate) => (
              <button
                key={rate.label}
                type="button"
                onClick={() => onSelectRating(rate.value)}
                className={`py-1.5 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  minRating === rate.value
                    ? 'bg-[#0051d5] text-white border-[#0051d5] shadow-xs'
                    : 'bg-[#ffffff] text-[#475569] border-[#e2e8f0] hover:bg-[#f8f9ff]'
                }`}
              >
                {rate.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Worker Mode: Job Status & Budget */}
      {searchMode === 'jobs' && (
        <>
          {/* Job Status */}
          <div className="space-y-2.5 pt-4 border-t border-[#f1f5f9]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#091426]">
              <Briefcase className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Job Status</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-[#f8f9ff] p-1 rounded-xl border border-[#e2e8f0]">
              {(
                [
                  { label: 'All', value: 'ALL' },
                  { label: 'Open', value: 'OPEN' },
                  { label: 'Urgent', value: 'URGENT' },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onSelectJobStatus && onSelectJobStatus(item.value)}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all text-center ${
                    jobStatus === item.value
                      ? 'bg-[#0051d5] text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#091426]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-2.5 pt-4 border-t border-[#f1f5f9]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#091426]">
              <DollarSign className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Budget Range</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Any Budget', value: 'ALL' },
                { label: 'Under ₹500', value: 'LOW' },
                { label: '₹500 – ₹2k', value: 'MID' },
                { label: '₹2,000+', value: 'HIGH' },
              ].map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => onSelectBudgetRange && onSelectBudgetRange(b.value as any)}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-xl border text-center transition-all ${
                    budgetRange === b.value
                      ? 'bg-[#0051d5] text-white border-[#0051d5] shadow-xs'
                      : 'bg-[#ffffff] text-[#475569] border-[#e2e8f0] hover:bg-[#f8f9ff]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 6. Distance Radius */}
      <div className="space-y-2.5 pt-4 border-t border-[#f1f5f9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#091426]">
            <Compass className="w-3.5 h-3.5 text-[#0051d5]" />
            <span>Distance Radius</span>
          </div>
          <span className="text-xs font-bold text-[#0051d5] font-geist">
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
        <div className="flex justify-between text-[11px] font-medium text-[#94a3b8] font-geist">
          <span>2 km</span>
          <span>10 km</span>
          <span>25 km</span>
        </div>
      </div>
    </div>
  );
}
