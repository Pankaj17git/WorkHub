'use client';

import React, { useState, useMemo, useEffect, Suspense, useSyncExternalStore } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ShieldCheck,
  MessageSquare,
  Lock,
  Briefcase,
  Users,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import ProCard from '@/components/marketplace/ProCard';
import FilterSidebar from '@/components/marketplace/FilterSidebar';
import JobSearchCard from '@/components/marketplace/JobSearchCard';
import { MOCK_PROS, MOCK_JOB_POSTINGS, MockJobPosting } from '@/data/mockData';
import { Professional } from '@/types';
import { getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  // Initial params
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialMode = searchParams.get('mode') === 'jobs' ? 'jobs' : 'workers';

  // Search Mode: 'workers' for customers finding pros, 'jobs' for workers finding openings
  const [searchMode, setSearchMode] = useState<'workers' | 'jobs'>(initialMode);

  // Query & Location (Location selected ONLY via sidebar!)
  const [query, setQuery] = useState(initialQuery);
  const [selectedLocation, setSelectedLocation] = useState('Chandigarh');

  // Categories & Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory && initialCategory !== 'all' ? [initialCategory] : []
  );
  const [availability, setAvailability] = useState<'any' | 'today' | 'this_week' | 'custom'>('any');
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(25);

  // Job Specific Filters
  const [jobStatus, setJobStatus] = useState<'ALL' | 'OPEN' | 'URGENT'>('ALL');
  const [budgetRange, setBudgetRange] = useState<'ALL' | 'LOW' | 'MID' | 'HIGH'>('ALL');

  // Display & Sorting
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'distance' | 'price_low' | 'price_high' | 'recent'>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data lists
  const [prosList, setProsList] = useState<Professional[]>(MOCK_PROS);
  const [jobsList, setJobsList] = useState<MockJobPosting[]>(MOCK_JOB_POSTINGS);
  const [loading, setLoading] = useState(false);

  // Sync mode from session role on mount if no param provided
  useEffect(() => {
    if (!searchParams.get('mode') && session?.role === 'WORKER') {
      setSearchMode('jobs');
    }
  }, [session, searchParams]);

  // Fetch real workers if available, fallback to mock
  useEffect(() => {
    fetch('/api/workers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.workers && data.workers.length > 0) {
          const apiPros: Professional[] = data.workers.map((w: any) => ({
            id: `pro-${w.id}`,
            name: w.name,
            title: w.headline || 'Service Professional',
            avatar: w.profileImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
            coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
            category: w.skills[0] || 'Electricians',
            location: w.address?.city ? `${w.address.city}` : 'Chandigarh',
            distanceKm: 3.0,
            rating: w.rating || 4.9,
            reviewCount: w.reviewCount || 24,
            completedJobs: 120,
            experienceYears: 6,
            hourlyRate: w.hourlyRate || 350,
            verified: w.isVerified ?? true,
            online: true,
            responseTimeMinutes: 15,
            about: w.bio || 'Experienced verified service professional dedicated to high quality work.',
            skills: w.skills && w.skills.length > 0 ? w.skills : ['Installation', 'Repairs', 'Maintenance'],
            services: (w.services || []).map((srv: any) => ({
              id: srv.id,
              name: srv.name,
              description: srv.description || 'Professional service',
              price: srv.price || 350,
              durationMinutes: 45,
            })),
            reviews: [],
            badges: ['Verified Pro', 'Top Rated'],
          }));

          setProsList((prev) => {
            const existingIds = new Set(apiPros.map((p) => p.id));
            const filteredMock = prev.filter((p) => !existingIds.has(p.id));
            return [...apiPros, ...filteredMock];
          });
        }
      })
      .catch((err) => console.error('Failed to load workers:', err));

    // Fetch real jobs if available, fallback to mock
    fetch('/api/jobs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const rawJobs = data?.jobs || data?.data?.jobs;
        if (rawJobs && rawJobs.length > 0) {
          const apiJobs: MockJobPosting[] = rawJobs.map((j: any) => ({
            id: j.id,
            title: j.title,
            category: j.serviceName || 'General Trade',
            customerName: j.customer?.name || 'Customer Request',
            customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            location: j.address?.city || 'Chandigarh',
            distanceKm: 3.5,
            postedAt: 'Just now',
            status: j.status === 'OPEN' ? 'OPEN' : 'IN_PROGRESS',
            minBudget: j.minAmount || 500,
            maxBudget: j.maxAmount || 1500,
            requiredWorkers: j.requiredWorkers || 1,
            description: j.description || 'No description provided.',
            skills: Array.isArray(j.skills)
              ? j.skills.map((s: any) => (typeof s === 'string' ? s : s.name))
              : ['Repairs', 'Maintenance'],
          }));

          setJobsList((prev) => {
            const existingIds = new Set(apiJobs.map((j) => j.id));
            const filteredMock = prev.filter((j) => !existingIds.has(j.id));
            return [...apiJobs, ...filteredMock];
          });
        }
      })
      .catch((err) => console.error('Failed to load jobs:', err));
  }, []);

  // Category toggle handler
  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Experience toggle handler
  const handleToggleExperience = (exp: string) => {
    setSelectedExperience((prev) =>
      prev.includes(exp) ? prev.filter((e) => e !== exp) : [...prev, exp]
    );
  };

  // Reset filters
  const handleReset = () => {
    setQuery('');
    setSelectedCategories([]);
    setAvailability('any');
    setSelectedExperience([]);
    setMinRating(0);
    setMaxDistance(25);
    setJobStatus('ALL');
    setBudgetRange('ALL');
    setSortBy('recommended');
  };

  // Filtered Professionals (Customer Mode)
  const filteredPros = useMemo(() => {
    return prosList
      .filter((pro) => {
        // Query search
        if (query.trim()) {
          const q = query.toLowerCase();
          const matchName = pro.name.toLowerCase().includes(q);
          const matchTitle = pro.title.toLowerCase().includes(q);
          const matchCategory = pro.category.toLowerCase().includes(q);
          const matchSkill = pro.skills.some((s) => s.toLowerCase().includes(q));
          const matchBio = pro.about.toLowerCase().includes(q);
          if (!matchName && !matchTitle && !matchCategory && !matchSkill && !matchBio) {
            return false;
          }
        }

        // Location filter (from sidebar)
        if (selectedLocation.trim()) {
          const loc = selectedLocation.toLowerCase();
          const proLoc = pro.location.toLowerCase();
          if (!proLoc.includes(loc) && !loc.includes(proLoc.split(',')[0].trim())) {
            // If location is specific like 'Sector 22, Chandigarh', check both parts
            const parts = loc.split(',').map((p) => p.trim());
            const matchesAnyPart = parts.some((p) => proLoc.includes(p));
            if (!matchesAnyPart) return false;
          }
        }

        // Category filter
        if (selectedCategories.length > 0) {
          const matchesCategory = selectedCategories.some((cat) =>
            pro.category.toLowerCase().includes(cat.toLowerCase())
          );
          if (!matchesCategory) return false;
        }

        // Rating filter
        if (minRating > 0 && pro.rating < minRating) {
          return false;
        }

        // Experience filter
        if (selectedExperience.length > 0) {
          const matchesExp = selectedExperience.some((exp) => {
            if (exp === 'exp-0-2') return pro.experienceYears <= 2;
            if (exp === 'exp-2-5') return pro.experienceYears > 2 && pro.experienceYears <= 5;
            if (exp === 'exp-5-plus') return pro.experienceYears > 5;
            return false;
          });
          if (!matchesExp) return false;
        }

        // Distance filter
        if (pro.distanceKm > maxDistance) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        if (sortBy === 'price_low') return a.hourlyRate - b.hourlyRate;
        if (sortBy === 'price_high') return b.hourlyRate - a.hourlyRate;
        return b.completedJobs - a.completedJobs; // default recommended
      });
  }, [
    prosList,
    query,
    selectedLocation,
    selectedCategories,
    minRating,
    selectedExperience,
    maxDistance,
    sortBy,
  ]);

  // Filtered Job Openings (Worker Mode)
  const filteredJobs = useMemo(() => {
    return jobsList
      .filter((job) => {
        // Query search
        if (query.trim()) {
          const q = query.toLowerCase();
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchDesc = job.description.toLowerCase().includes(q);
          const matchCategory = job.category.toLowerCase().includes(q);
          const matchSkill = job.skills.some((s) => s.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCategory && !matchSkill) return false;
        }

        // Location filter (from sidebar)
        if (selectedLocation.trim()) {
          const loc = selectedLocation.toLowerCase();
          const jobLoc = job.location.toLowerCase();
          if (!jobLoc.includes(loc)) {
            const parts = loc.split(',').map((p) => p.trim());
            const matchesAnyPart = parts.some((p) => jobLoc.includes(p));
            if (!matchesAnyPart) return false;
          }
        }

        // Category filter
        if (selectedCategories.length > 0) {
          const matchesCategory = selectedCategories.some((cat) =>
            job.category.toLowerCase().includes(cat.toLowerCase())
          );
          if (!matchesCategory) return false;
        }

        // Status filter
        if (jobStatus !== 'ALL') {
          if (jobStatus === 'URGENT' && job.status !== 'URGENT') return false;
          if (jobStatus === 'OPEN' && job.status !== 'OPEN') return false;
        }

        // Budget Range filter
        if (budgetRange !== 'ALL') {
          if (budgetRange === 'LOW' && job.maxBudget > 500) return false;
          if (budgetRange === 'MID' && (job.maxBudget < 500 || job.minBudget > 2000)) return false;
          if (budgetRange === 'HIGH' && job.maxBudget < 2000) return false;
        }

        // Distance filter
        if ((job.distanceKm || 2) > maxDistance) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_high') return b.maxBudget - a.maxBudget;
        if (sortBy === 'price_low') return a.minBudget - b.minBudget;
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        return 0; // default order
      });
  }, [
    jobsList,
    query,
    selectedLocation,
    selectedCategories,
    jobStatus,
    budgetRange,
    maxDistance,
    sortBy,
  ]);

  const hasActiveFilters =
    query !== '' ||
    selectedCategories.length > 0 ||
    minRating > 0 ||
    selectedExperience.length > 0 ||
    availability !== 'any' ||
    jobStatus !== 'ALL' ||
    budgetRange !== 'ALL' ||
    maxDistance < 25;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP HERO BANNER (Matches Reference Image) */}
      <div className="bg-gradient-to-r from-[#eef5fe] via-[#f3f8ff] to-[#f8faff] border border-[#dbeafe] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#0051d5] text-xs font-bold border border-[#bfdbfe] shadow-2xs">
              {searchMode === 'workers' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Find Skilled Professionals</span>
                </>
              ) : (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Explore Job Openings</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#091426] tracking-tight leading-tight">
              {searchMode === 'workers' ? (
                <>
                  Find the Right Worker for{' '}
                  <span className="text-[#0051d5]">Your Job</span>
                </>
              ) : (
                <>
                  Find the Right Project for{' '}
                  <span className="text-[#0051d5]">Your Skills</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-lg">
              {searchMode === 'workers'
                ? 'Browse verified and trusted professionals in your area. Compare skills, reviews and ratings to get the best service, fast.'
                : 'Browse verified customer requests and job contracts in your area. Submit proposals, get hired, and earn fast on your schedule.'}
            </p>

            {/* Mode Switcher Buttons */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 border border-[#dbeafe] shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setSearchMode('workers');
                    handleReset();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    searchMode === 'workers'
                      ? 'bg-[#0051d5] text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#091426]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Find Workers</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchMode('jobs');
                    handleReset();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    searchMode === 'jobs'
                      ? 'bg-[#0051d5] text-white shadow-xs'
                      : 'text-[#64748b] hover:text-[#091426]'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Find Job Openings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Center Technician Graphic (Matches Reference Image) */}
          <div className="hidden lg:flex lg:col-span-3 items-center justify-center">
            <div className="relative w-36 h-36 xl:w-44 xl:h-44 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#bfdbfe]/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  searchMode === 'workers'
                    ? 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80'
                }
                alt="Skilled Professional"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Right Trust Feature Cards (Matches Reference Image) */}
          <div className="lg:col-span-3 space-y-2.5">
            {searchMode === 'workers' ? (
              <>
                <div className="bg-white/90 backdrop-blur-xs border border-[#e2e8f0] rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#091426]">Verified Professionals</h4>
                    <p className="text-[11px] text-[#64748b] truncate">Background-checked & trusted</p>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xs border border-[#e2e8f0] rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#091426]">Real Reviews</h4>
                    <p className="text-[11px] text-[#64748b] truncate">See what other customers say</p>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xs border border-[#e2e8f0] rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#091426]">Secure & Easy Booking</h4>
                    <p className="text-[11px] text-[#64748b] truncate">Book with confidence</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/90 backdrop-blur-xs border border-[#e2e8f0] rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#091426]">Verified Clients</h4>
                    <p className="text-[11px] text-[#64748b] truncate">Real customer requirements</p>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xs border border-[#e2e8f0] rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#091426]">Guaranteed Payments</h4>
                    <p className="text-[11px] text-[#64748b] truncate">Milestone & escrow secure</p>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-xs border border-[#e2e8f0] rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#091426]">Instant Bidding</h4>
                    <p className="text-[11px] text-[#64748b] truncate">Submit quotes & get hired</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. TOP SEARCH BAR (Location removed; strictly in sidebar as requested!) */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 m-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                searchMode === 'workers'
                  ? 'Search by skill, service or specialist name...'
                  : 'Search by job title, trade skill or description...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#ffffff] border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/10 text-[#091426] placeholder-[#94a3b8] transition-all"
            />
            <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Search Action Button */}
          <button
            type="button"
            className="px-5 py-2.5 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64748b] shrink-0 font-geist hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold text-[#091426] bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] cursor-pointer"
            >
              <option value="recommended">Most Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="distance">Nearest Distance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>

            {/* Mobile Filter Drawer Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-[#091426] text-white flex items-center gap-1.5 text-xs font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

      </div>

      {/* Results Counter & View Switcher Row */}
      <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9] text-xs">
        <div className="text-[#64748b]">
          {searchMode === 'workers' ? (
            <p>
              Showing{' '}
              <strong className="text-[#091426] font-geist font-bold">
                {filteredPros.length}
              </strong>{' '}
              verified professionals in{' '}
              <span className="font-semibold text-[#091426]">
                {selectedLocation || 'all locations'}
              </span>
            </p>
          ) : (
            <p>
              Showing{' '}
              <strong className="text-[#091426] font-geist font-bold">
                {filteredJobs.length}
              </strong>{' '}
              active job openings in{' '}
              <span className="font-semibold text-[#091426]">
                {selectedLocation || 'all locations'}
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-[#0051d5] font-semibold hover:underline"
            >
              Clear all filters
            </button>
          )}

          {/* View Mode Switcher (Grid vs List) */}
          <div className="flex items-center gap-1 bg-[#f8f9ff] p-1 rounded-xl border border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#0051d5] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#091426]'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-[#0051d5] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#091426]'
              }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: SIDEBAR + RESULTS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterSidebar
            searchMode={searchMode}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            availability={availability}
            onSelectAvailability={setAvailability}
            selectedExperience={selectedExperience}
            onToggleExperience={handleToggleExperience}
            minRating={minRating}
            onSelectRating={setMinRating}
            maxDistance={maxDistance}
            onDistanceChange={setMaxDistance}
            jobStatus={jobStatus}
            onSelectJobStatus={setJobStatus}
            budgetRange={budgetRange}
            onSelectBudgetRange={setBudgetRange}
            onReset={handleReset}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1 mb-4">
            <FilterSidebar
              searchMode={searchMode}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              availability={availability}
              onSelectAvailability={setAvailability}
              selectedExperience={selectedExperience}
              onToggleExperience={handleToggleExperience}
              minRating={minRating}
              onSelectRating={setMinRating}
              maxDistance={maxDistance}
              onDistanceChange={setMaxDistance}
              jobStatus={jobStatus}
              onSelectJobStatus={setJobStatus}
              budgetRange={budgetRange}
              onSelectBudgetRange={setBudgetRange}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Right Results Area */}
        <div className="lg:col-span-3">
          {searchMode === 'workers' ? (
            /* --- CUSTOMER MODE: WORKERS LIST / GRID --- */
            filteredPros.length === 0 ? (
              <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded-2xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#091426]">
                  No matching professionals found
                </h3>
                <p className="text-xs text-[#64748b] max-w-sm mx-auto leading-relaxed">
                  Try widening your distance radius, changing your location, or clearing some
                  filters to view more verified specialists.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-[#0051d5] text-white text-xs font-semibold rounded-xl hover:bg-[#0042b0] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredPros.map((pro) => (
                  <ProCard key={pro.id} pro={pro} viewMode="list" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPros.map((pro) => (
                  <ProCard key={pro.id} pro={pro} viewMode="grid" />
                ))}
              </div>
            )
          ) : (
            /* --- WORKER MODE: JOB OPENINGS LIST / GRID --- */
            filteredJobs.length === 0 ? (
              <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded-2xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#091426]">
                  No job postings found
                </h3>
                <p className="text-xs text-[#64748b] max-w-sm mx-auto leading-relaxed">
                  There are currently no active job postings matching your selected filters. Try
                  expanding your location or checking back soon.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 bg-[#0051d5] text-white text-xs font-semibold rounded-xl hover:bg-[#0042b0] transition-colors"
                  >
                    Reset Filters
                  </button>
                  <Link
                    href="/jobs/new"
                    className="px-4 py-2.5 bg-[#f8f9ff] text-[#091426] border border-[#e2e8f0] text-xs font-semibold rounded-xl hover:bg-[#e2e8f0] transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post a Job</span>
                  </Link>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobSearchCard key={job.id} job={job} viewMode="list" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredJobs.map((job) => (
                  <JobSearchCard key={job.id} job={job} viewMode="grid" />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-sm text-[#64748b] flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0051d5]" />
          <span>Loading marketplace...</span>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
