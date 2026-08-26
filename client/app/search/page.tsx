'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProCard from '@/components/marketplace/ProCard';
import FilterSidebar from '@/components/marketplace/FilterSidebar';
import { MOCK_PROS } from '@/data/mockData';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(15);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'distance' | 'price_low'>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredPros = useMemo(() => {
    return MOCK_PROS.filter((pro) => {
      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchName = pro.name.toLowerCase().includes(q);
        const matchTitle = pro.title.toLowerCase().includes(q);
        const matchCategory = pro.category.toLowerCase().includes(q);
        const matchSkill = pro.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchCategory && !matchSkill) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (!pro.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Rating filter
      if (minRating > 0 && pro.rating < minRating) {
        return false;
      }

      // Verified only
      if (verifiedOnly && !pro.verified) {
        return false;
      }

      // Distance filter
      if (pro.distanceKm > maxDistance) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'price_low') return a.hourlyRate - b.hourlyRate;
      return b.completedJobs - a.completedJobs; // default recommended
    });
  }, [query, selectedCategory, minRating, verifiedOnly, maxDistance, sortBy]);

  const handleReset = () => {
    setQuery('');
    setSelectedCategory('all');
    setMinRating(0);
    setVerifiedOnly(false);
    setMaxDistance(15);
    setSortBy('recommended');
  };

  return (
    <div className="bg-[#f4eee4] min-h-screen" style={{ fontFamily: 'var(--gesso-font-body)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
        {/* Top Search & Results Header */}
        <div className="bg-[#ffffff] rounded-xl p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Active Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by skill, service or specialist name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#eae4db] border border-transparent rounded-lg focus:outline-none focus:border-[#f5a623] focus:ring-3 focus:ring-[rgba(245,166,35,0.14)] text-[#2a2a2a] placeholder:text-[#606060]"
              />
              <Search className="w-4 h-4 text-[#606060] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#606060] shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#2f68c5]" />
                <span>Sort By:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recommended' | 'rating' | 'distance' | 'price_low')}
                className="px-3 py-2 text-xs font-bold text-[#2a2a2a] bg-[#eae4db] border border-transparent rounded-lg focus:outline-none focus:border-[#f5a623] cursor-pointer"
              >
                <option value="recommended">Most Recommended</option>
                <option value="rating">Highest Rated (★ 5.0)</option>
                <option value="distance">Nearest Distance (km)</option>
                <option value="price_low">Price: Low to High</option>
              </select>

              {/* Mobile Filter trigger button */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden p-2.5 rounded-lg bg-[#2a2a2a] text-white flex items-center gap-1.5 text-xs font-bold"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

          </div>

          {/* Results count & active tags */}
          <div className="flex items-center justify-between text-xs text-[#606060] pt-2 border-t border-[rgba(0,0,0,0.04)]">
            <p>
              Showing <strong className="whl-display text-[#2a2a2a] font-extrabold">{filteredPros.length}</strong> verified professionals available in Chandigarh
            </p>
            {(selectedCategory !== 'all' || minRating > 0 || verifiedOnly || query) && (
              <button
                onClick={handleReset}
                className="text-[#2f68c5] font-semibold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Main Grid (Sidebar + Results) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <FilterSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              minRating={minRating}
              onSelectRating={setMinRating}
              verifiedOnly={verifiedOnly}
              onToggleVerified={setVerifiedOnly}
              maxDistance={maxDistance}
              onDistanceChange={setMaxDistance}
              onReset={handleReset}
            />
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden col-span-1 mb-4">
              <FilterSidebar
                selectedCategory={selectedCategory}
                onSelectCategory={(c) => { setSelectedCategory(c); setMobileFilterOpen(false); }}
                minRating={minRating}
                onSelectRating={(r) => { setMinRating(r); setMobileFilterOpen(false); }}
                verifiedOnly={verifiedOnly}
                onToggleVerified={setVerifiedOnly}
                maxDistance={maxDistance}
                onDistanceChange={setMaxDistance}
                onReset={handleReset}
              />
            </div>
          )}

          {/* Right Search Results List */}
          <div className="lg:col-span-3 space-y-4">
            {filteredPros.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#eae4db] text-[#606060] flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="whl-h3">No matching professionals found</h3>
                <p className="text-xs text-[#606060] max-w-sm mx-auto">
                  Try widening your distance radius or clearing some of the filters to see more results.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-[#3b82f6] hover:brightness-95 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredPros.map((pro) => (
                <ProCard key={pro.id} pro={pro} />
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#606060]" style={{ fontFamily: 'var(--gesso-font-body)' }}>Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
