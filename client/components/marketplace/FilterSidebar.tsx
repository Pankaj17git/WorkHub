'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Navigation,
} from 'lucide-react';
import { MOCK_CATEGORIES } from '@/data/mockData';
import api from '@/lib/api';
import {
  BudgetRange,
  JobFilterStatus,
  ReverseGeocodeResponse,
  SearchAvailability,
  SkillItem,
} from '@/types';
import SearchInput, { GeoLocation, GeoSearchProvider } from '../map/searchInput';

export interface FilterSidebarProps {
  searchMode?: 'workers' | 'jobs';
  // Location
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  // Category
  selectedCategories: string[];
  onToggleCategory: (cat: string) => void;
  // Availability
  availability: SearchAvailability;
  onSelectAvailability: (avail: SearchAvailability) => void;
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
  jobStatus?: JobFilterStatus;
  onSelectJobStatus?: (status: JobFilterStatus) => void;
  budgetRange?: BudgetRange;
  onSelectBudgetRange?: (b: BudgetRange) => void;
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
  electrician: <Zap className="w-3.5 h-3.5 text-[#0051d5]" />,
  electricians: <Zap className="w-3.5 h-3.5 text-[#0051d5]" />,
  electrical_helper: <Zap className="w-3.5 h-3.5 text-[#0051d5]" />,
  plumber: <Wrench className="w-3.5 h-3.5 text-[#0284c7]" />,
  plumbers: <Wrench className="w-3.5 h-3.5 text-[#0284c7]" />,
  pipe_fitter: <Wrench className="w-3.5 h-3.5 text-[#0284c7]" />,
  sanitary_worker: <Wrench className="w-3.5 h-3.5 text-[#0284c7]" />,
  ac_technician: <Wind className="w-3.5 h-3.5 text-[#06b6d4]" />,
  'appliance-repair': <Wind className="w-3.5 h-3.5 text-[#06b6d4]" />,
  'ac & appliance repair': <Wind className="w-3.5 h-3.5 text-[#06b6d4]" />,
  carpenter: <Hammer className="w-3.5 h-3.5 text-[#d97706]" />,
  carpenters: <Hammer className="w-3.5 h-3.5 text-[#d97706]" />,
  furniture_carpenter: <Hammer className="w-3.5 h-3.5 text-[#d97706]" />,
  mason: <Hammer className="w-3.5 h-3.5 text-[#d97706]" />,
  bricklayer: <Hammer className="w-3.5 h-3.5 text-[#d97706]" />,
  tile_worker: <Hammer className="w-3.5 h-3.5 text-[#d97706]" />,
  painter: <Paintbrush className="w-3.5 h-3.5 text-[#8b5cf6]" />,
  painters: <Paintbrush className="w-3.5 h-3.5 text-[#8b5cf6]" />,
  wall_painter: <Paintbrush className="w-3.5 h-3.5 text-[#8b5cf6]" />,
  interior_painter: <Paintbrush className="w-3.5 h-3.5 text-[#8b5cf6]" />,
  cleaning: <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />,
  'deep cleaning': <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />,
  'pest-control': <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />,
  'pest control': <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />,
  'home-automation': <Cpu className="w-3.5 h-3.5 text-[#6366f1]" />,
  'home automation': <Cpu className="w-3.5 h-3.5 text-[#6366f1]" />,
  solar_panel_installer: <Cpu className="w-3.5 h-3.5 text-[#6366f1]" />,
  inverter_technician: <Cpu className="w-3.5 h-3.5 text-[#6366f1]" />,
};

function getCategoryIcon(key?: string, name?: string) {
  const normalizedKey = key ? key.toLowerCase().trim() : '';
  const normalizedName = name ? name.toLowerCase().trim() : '';

  if (normalizedKey && CATEGORY_ICON_MAP[normalizedKey]) {
    return CATEGORY_ICON_MAP[normalizedKey];
  }
  if (normalizedName && CATEGORY_ICON_MAP[normalizedName]) {
    return CATEGORY_ICON_MAP[normalizedName];
  }
  if (name && CATEGORY_ICON_MAP[name]) {
    return CATEGORY_ICON_MAP[name];
  }
  return <Layers className="w-3.5 h-3.5 text-[#64748b]" />;
}

const INITIAL_CATEGORY_COUNT = 7;

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
  const [skills, setSkills] = useState<SkillItem[]>(() =>
    MOCK_CATEGORIES.map((cat) => ({
      id: cat.id,
      key: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: cat.name,
    }))
  );
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [locationSearchResults, setLocationSearchResults] = useState<GeoLocation[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayedCategories = showAllCategories
    ? skills
    : skills.slice(0, INITIAL_CATEGORY_COUNT);

  const searchProvider = useMemo<GeoSearchProvider>(
    () => ({
      async search({ query }: { query: string }) {
        if (!query || query.trim().length === 0) return [];
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
              query
            )}&addressdetails=1&limit=6`
          );
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data)
            ? data.map((item: { lon: string; lat: string; display_name: string }) => ({
                x: parseFloat(item.lon),
                y: parseFloat(item.lat),
                label: item.display_name,
              }))
            : [];
        } catch {
          return [];
        }
      },
    }),
    []
  );
  const handleSelectLocation = (loc: GeoLocation) => {
    if (!loc.label) {
      onSelectLocation(`${loc.lat},${loc.lng}`);
    } else {
      onSelectLocation(loc.label);
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    const fallback = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );
      if (!res.ok) return fallback;
      const data = (await res.json()) as ReverseGeocodeResponse;
      return data.display_name ?? fallback;
    } catch {
      return fallback;
    }
  };

  const getGeolocationErrorMessage = (err: GeolocationPositionError): string => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        return 'Location permission denied. Allow location access in your browser settings, or search for a place manually.';
      case err.POSITION_UNAVAILABLE:
        return 'Your location is currently unavailable. Please try again or search manually.';
      case err.TIMEOUT:
        return 'Locating timed out. Please try again.';
      default:
        return 'Could not get your location.';
    }
  };

  const startLocate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setErrorMessage(null);
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const label = await reverseGeocode(latitude, longitude);
        handleSelectLocation({ lat: latitude, lng: longitude, label });
        setIsLocating(false);
      },
      (err) => {
        setErrorMessage(getGeolocationErrorMessage(err));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchSkills() {
      try {
        const res = await api.get('/api/skills');
        const payload = res.data;
        let list: SkillItem[] = [];
        if (Array.isArray(payload)) {
          list = payload;
        } else if (Array.isArray(payload?.data?.data)) {
          list = payload.data.data;
        } else if (Array.isArray(payload?.data)) {
          list = payload.data;
        } else if (Array.isArray(payload?.skills)) {
          list = payload.skills;
        }

        if (isMounted && list && list.length > 0) {
          setSkills(list);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    }

    void fetchSkills();
    return () => {
      isMounted = false;
    };
  }, []);

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
          <SearchInput
            searchProvider={searchProvider}
            onSelectLocation={handleSelectLocation}
            onClear={() => onSelectLocation('')}
            onTypingResult={(result) => {
              setLocationDropdownOpen(result.length > 0);
              setLocationSearchResults(result);
            }}
            showPopularLocations={false}
          />
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
                {locationSearchResults.map((loc) => (
                  <button
                    key={loc.label}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc.label);
                      setLocationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedLocation.toLowerCase() === loc.label.toLowerCase()
                        ? 'bg-[#eff6ff] text-[#0051d5] font-semibold'
                        : 'text-[#334155] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <span>{loc.label}</span>
                    {selectedLocation.toLowerCase() === loc.label.toLowerCase() && (
                      <Check className="w-3 h-3 text-[#0051d5]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            id="btn-locate-me"
            type="button"
            onClick={startLocate}
            disabled={isLocating}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
          >
            {isLocating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5" />
                <span>My Location</span>
              </>
            )}
          </button>
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
          value={
            selectedCategories.length === 1
              ? (skills.find(
                  (s) => s.key === selectedCategories[0] || s.name === selectedCategories[0]
                )?.key || selectedCategories[0])
              : 'all'
          }
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'all') {
              // clear categories
              skills.forEach((c) => {
                if (selectedCategories.includes(c.key) || selectedCategories.includes(c.name)) {
                  onToggleCategory(c.key);
                }
              });
            } else {
              // Set only this category
              skills.forEach((c) => {
                const isSelected = selectedCategories.includes(c.key) || selectedCategories.includes(c.name);
                if (c.key === val && !isSelected) onToggleCategory(c.key);
                if (c.key !== val && isSelected) onToggleCategory(c.key);
              });
            }
          }}
          className="w-full text-xs font-medium text-[#334155] bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl px-3 py-2 outline-none focus:border-[#0051d5] cursor-pointer"
        >
          <option value="all">All Categories</option>
          {skills.map((cat) => (
            <option key={String(cat.id ?? cat.key)} value={cat.key}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Checkbox Category List */}
        <div
          className={`space-y-2 pt-1 transition-all ${
            showAllCategories
              ? 'max-h-60 overflow-y-auto pr-1 overscroll-contain'
              : ''
          }`}
        >
          {displayedCategories.map((cat) => {
            const isChecked =
              selectedCategories.includes(cat.key) ||
              selectedCategories.includes(cat.name);
            return (
              <label
                key={String(cat.id ?? cat.key)}
                className="flex items-center gap-2.5 text-xs text-[#334155] hover:text-[#091426] cursor-pointer select-none group py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleCategory(cat.key)}
                  className="w-4 h-4 rounded border-[#cbd5e1] text-[#0051d5] focus:ring-[#0051d5] cursor-pointer accent-[#0051d5]"
                />
                <span className="shrink-0">
                  {getCategoryIcon(cat.key, cat.name)}
                </span>
                <span className={`flex-1 truncate ${isChecked ? 'font-semibold text-[#091426]' : 'font-normal'}`}>
                  {cat.name}
                </span>
              </label>
            );
          })}
        </div>

        {skills.length > INITIAL_CATEGORY_COUNT && (
          <button
            type="button"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-xs text-[#0051d5] font-semibold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>
              {showAllCategories
                ? 'Show less'
                : `Show more (${skills.length - INITIAL_CATEGORY_COUNT} more)`}
            </span>
            {showAllCategories ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
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
              {(
                [
                  { label: 'Any Budget', value: 'ALL' },
                  { label: 'Under ₹500', value: 'LOW' },
                  { label: '₹500 – ₹2k', value: 'MID' },
                  { label: '₹2,000+', value: 'HIGH' },
                ] as const
              ).map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => onSelectBudgetRange && onSelectBudgetRange(b.value)}
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
