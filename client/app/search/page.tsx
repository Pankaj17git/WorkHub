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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Search & Results Header */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Active Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by skill, service or specialist name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#0d1c2e]"
            />
            <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748b] shrink-0 font-geist">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Sort By:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold text-[#091426] bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] cursor-pointer"
            >
              <option value="recommended">Most Recommended</option>
              <option value="rating">Highest Rated (★ 5.0)</option>
              <option value="distance">Nearest Distance (km)</option>
              <option value="price_low">Price: Low to High</option>
            </select>

            {/* Mobile Filter trigger button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-[#091426] text-white flex items-center gap-1.5 text-xs font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

        </div>

        {/* Results count & active tags */}
        <div className="flex items-center justify-between text-xs text-[#64748b] pt-2 border-t border-[#f1f5f9]">
          <p>
            Showing <strong className="text-[#091426] font-geist font-bold">{filteredPros.length}</strong> verified professionals available in Chandigarh
          </p>
          {(selectedCategory !== 'all' || minRating > 0 || verifiedOnly || query) && (
            <button
              onClick={handleReset}
              className="text-[#0051d5] font-semibold hover:underline"
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
            <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded-2xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#091426]">No matching professionals found</h3>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                Try widening your distance radius or clearing some of the filters to see more results.
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-[#0051d5] text-white text-xs font-semibold rounded-xl hover:bg-[#0042b0] transition-colors"
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
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#64748b]">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
