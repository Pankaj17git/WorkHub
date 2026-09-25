'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

interface JobItem {
  id: string;
  title: string;
  serviceName?: string | null;
  description: string;
  minAmount?: string | number | null;
  maxAmount?: string | number | null;
  currency: string;
  requiredWorkers?: number;
  status: string;
  createdAt: string;
  address?: {
    city?: string;
    state?: string;
    address?: string;
  } | null;
  skills?: Array<{ id?: string; name: string }> | string[];
}

export default function JobsMarketplacePage() {
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS'>('ALL');

  const skillsFilters = [
    'ALL',
    'Electrician',
    'Plumbing',
    'Carpentry',
    'Painting',
    'AC Repair',
    'Masonry',
    'Deep Cleaning',
  ];

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const url = new URL('/api/jobs', window.location.origin);
        if (selectedSkill !== 'ALL') {
          url.searchParams.set('skill', selectedSkill);
        }
        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || data.data?.jobs || []);
        }
      } catch (err) {
        console.error('Failed to load marketplace jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [selectedSkill]);

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== 'ALL' && job.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchDesc = job.description?.toLowerCase().includes(q);
      const matchService = job.serviceName?.toLowerCase().includes(q);
      const matchCity = job.address?.city?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchService && !matchCity) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Hero */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#0051d5] text-xs font-bold font-geist border border-[#bfdbfe]">
              Live Job Marketplace
            </span>
            <span className="text-xs text-[#64748b]">• Verified Customer Requests</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
            Browse Opportunities & Postings
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] max-w-xl">
            Service professionals can discover nearby contracts and submit competitive bids. Customers can create custom postings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/jobs/new"
            className="px-5 py-3 rounded-2xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Job Request</span>
          </Link>
          {session?.role === 'CUSTOMER' && (
            <Link
              href="/jobs/my-jobs"
              className="px-4 py-3 rounded-2xl bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#091426] text-xs font-bold border border-[#e2e8f0] transition-colors"
            >
              My Posted Jobs
            </Link>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by job title, description, trade skill or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
            />
            <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64748b] font-geist shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl font-geist font-semibold text-[#091426] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open for Applications</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>
        </div>

        {/* Skill category pill filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {skillsFilters.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                selectedSkill === skill
                  ? 'bg-[#091426] text-white shadow-xs'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-3xl bg-white border border-[#e2e8f0] p-6 animate-pulse space-y-4"
            >
              <div className="h-5 bg-slate-100 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              <div className="h-12 bg-slate-100 rounded-lg w-full" />
              <div className="h-6 bg-slate-100 rounded-md w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-16 text-center bg-white border border-[#e2e8f0] rounded-3xl space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto shadow-sm">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#091426]">No job postings found</h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              {searchQuery || selectedSkill !== 'ALL'
                ? 'Try broadening your search criteria or resetting skill filters.'
                : 'Be the first to create a job posting in your area!'}
            </p>
          </div>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0051d5] text-white text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Job</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const isAssigned = job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS';
            const isCompleted = job.status === 'COMPLETED';

            return (
              <div
                key={job.id}
                className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-geist border ${
                        job.status === 'OPEN'
                          ? 'bg-[#ecfdf5] text-[#0d9488] border-[#a7f3d0]'
                          : isAssigned
                          ? 'bg-[#eff6ff] text-[#0051d5] border-[#bfdbfe]'
                          : 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]'
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="text-[11px] text-[#94a3b8] font-geist">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#091426] group-hover:text-[#0051d5] transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    {job.serviceName && (
                      <p className="text-xs font-semibold text-[#0d9488] mt-0.5">
                        {job.serviceName}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[#64748b] line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.slice(0, 3).map((s, idx) => {
                        const name = typeof s === 'string' ? s : s.name;
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#f8f9ff] border border-[#e2e8f0] text-[10px] font-medium text-[#475569]"
                          >
                            {name}
                          </span>
                        );
                      })}
                      {job.skills.length > 3 && (
                        <span className="text-[10px] text-[#94a3b8] self-center">
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
                  {/* Meta items: Location, Workers, Budget */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#64748b]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                      <span className="truncate">{job.address?.city || 'Local Site'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#0d9488]" />
                      <span>{job.requiredWorkers || 1} Worker{(job.requiredWorkers || 1) > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-[#94a3b8] block">Budget Range</span>
                      <span className="font-geist font-extrabold text-sm text-[#091426]">
                        ₹{job.minAmount || 299} - ₹{job.maxAmount || 999}
                      </span>
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="px-4 py-2 rounded-xl bg-[#091426] group-hover:bg-[#0051d5] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>View Job</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
