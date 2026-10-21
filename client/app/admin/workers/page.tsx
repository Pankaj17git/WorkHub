'use client';

import React, { useEffect, useState } from 'react';
import {
  HardHat,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';

interface WorkerItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  status: string;
  headline: string;
  bio: string | null;
  isVerified: boolean;
  hourlyRate: number | null;
  skills: Array<{ id: string; name: string; key: string }>;
  stats: {
    applications: number;
    assignments: number;
    reviews: number;
  };
  createdAt: string;
}

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await api.get(`/api/admin/workers?${params.toString()}`);
      if (res.data.success) {
        setWorkers(res.data.workers);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch platform workers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Service Workers Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Inspect all registered trade professionals, skills, verified status, and launch worker experience mode.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchWorkers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by worker name, email, or headline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-bold text-slate-900">{workers.length}</span>
          <span>Workers Loaded</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Workers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Service Professional</th>
                <th className="px-6 py-4">Headline / Specialization</th>
                <th className="px-6 py-4">Hourly Rate</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Skills & Trades</th>
                <th className="px-6 py-4 text-center">Jobs Done</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                    <span>Loading workers directory...</span>
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <HardHat className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-700">No workers found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Worker Name & Contact */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-extrabold text-xs shrink-0">
                          {worker.name[0]?.toUpperCase() || 'W'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                            {worker.name}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {worker.email}
                          </span>
                          {worker.phone && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              {worker.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Headline */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 line-clamp-2 max-w-[220px]">
                        {worker.headline || 'Independent Technician'}
                      </span>
                    </td>

                    {/* Hourly Rate */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-teal-700 font-mono">
                        {worker.hourlyRate ? `$${worker.hourlyRate}/hr` : 'Negotiable'}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="px-6 py-4">
                      {worker.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          <span>Verified Pro</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Skills Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {worker.skills.length > 0 ? (
                          worker.skills.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 text-[10px] font-medium"
                            >
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No skills listed</span>
                        )}
                        {worker.skills.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                            +{worker.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Jobs Done */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {worker.stats.assignments}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          worker.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {worker.status === 'ACTIVE' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{worker.status}</span>
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {new Date(worker.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
