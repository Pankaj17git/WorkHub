'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Users,
  HardHat,
  UserCheck,
  Wrench,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Clock,
} from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalWorkers: number;
  totalCustomers: number;
  totalAdmins: number;
  activeUsersCount: number;
  totalSkills: number;
  customSkillsCount: number;
  totalJobs: number;
  totalAssignments: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface RecentSkill {
  id: string;
  name: string;
  key: string;
  isCustom: boolean;
  workersCount: number;
  createdAt: string;
}

interface TopSkill {
  id: string;
  name: string;
  key: string;
  workersCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentSkills, setRecentSkills] = useState<RecentSkill[]>([]);
  const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Skill Add state
  const [quickSkillName, setQuickSkillName] = useState('');
  const [quickSkillLoading, setQuickSkillLoading] = useState(false);
  const [quickSkillSuccess, setQuickSkillSuccess] = useState<string | null>(null);
  const [quickSkillError, setQuickSkillError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentUsers(res.data.recentUsers || []);
        setRecentSkills(res.data.recentSkills || []);
        setTopSkills(res.data.topSkills || []);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch platform dashboard statistics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSkillName.trim()) return;

    setQuickSkillLoading(true);
    setQuickSkillError(null);
    setQuickSkillSuccess(null);

    try {
      const res = await api.post('/api/admin/skills', {
        name: quickSkillName.trim(),
      });

      if (res.data.success) {
        setQuickSkillSuccess(`Skill "${res.data.skill.name}" added directly to database!`);
        setQuickSkillName('');
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (err) {
      setQuickSkillError(getApiErrorMessage(err, 'Failed to create skill'));
    } finally {
      setQuickSkillLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>WorkHub Administration & Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Central Management Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monitor verified users, platform service workers, client accounts, and database skills in real-time. Seamlessly inspect customer and worker experiences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold border border-slate-700 text-white transition-all"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/worker/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white shadow-md shadow-teal-600/30 transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Visit Worker Portal</span>
            <ExternalLink className="w-3 h-3 text-teal-200" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Visit Customer Portal</span>
            <ExternalLink className="w-3 h-3 text-blue-200" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Users & Clients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Platform Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : stats?.totalUsers ?? 0}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Active in Database</span>
              <span className="font-semibold text-emerald-600">
                {stats?.activeUsersCount ?? 0} Active
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Link
              href="/admin/users"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>Manage all users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Service Workers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Service Professionals
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : stats?.totalWorkers ?? 0}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Skilled Workforce</span>
              <span className="font-semibold text-teal-600">Verified Pros</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Link
              href="/admin/workers"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              <span>View workers directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clients & Customers
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : stats?.totalCustomers ?? 0}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Hiring Clients</span>
              <span className="font-semibold text-blue-600">
                {stats?.totalJobs ?? 0} Jobs Posted
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Link
              href="/admin/customers"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View clients directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Database Skills Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Skills in Database
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? '...' : stats?.totalSkills ?? 0}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Platform Trades</span>
              <span className="font-semibold text-amber-600">
                {stats?.customSkillsCount ?? 0} Custom Added
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Link
              href="/admin/skills"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
            >
              <span>Manage skills database</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Cross Experience Cards: Visit Customer & Worker Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Worker Portal Inspector Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 to-slate-900 text-white p-6 sm:p-7 shadow-lg border border-teal-800/40 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                Worker Experience Portal
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Inspect Service Professional Portal
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experience the platform as a technician or service partner. Review assigned jobs, accept bookings, check pro earnings, and test the worker workflow with full access.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-teal-800/50">
            <span className="text-xs text-teal-300 font-medium">
              {stats?.totalWorkers ?? 0} active professionals
            </span>
            <Link
              href="/worker/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              <span>Launch Worker View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Customer Portal Inspector Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 sm:p-7 shadow-lg border border-blue-800/40 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Customer Experience Portal
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Inspect Customer Booking Portal
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experience the platform as a homeowner or hiring client. Explore the service marketplace, browse pro profiles, test booking creation, and verify job scheduling.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-blue-800/50">
            <span className="text-xs text-blue-300 font-medium">
              {stats?.totalCustomers ?? 0} registered clients
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              <span>Launch Customer View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Quick Add Skill Section + Skills Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add Skill Form */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Skill to Database</h3>
                <p className="text-[11px] text-slate-500">Instantly expand trade catalog</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Admins can introduce new skills (e.g. Solar Installation, EV Charger Setup, Smart Lock Fitting) for workers to add to their profiles.
            </p>

            {quickSkillSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{quickSkillSuccess}</span>
              </div>
            )}

            {quickSkillError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{quickSkillError}</span>
              </div>
            )}

            <form onSubmit={handleQuickAddSkill} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Skill / Trade Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Inverter Repair"
                  value={quickSkillName}
                  onChange={(e) => setQuickSkillName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={quickSkillLoading || !quickSkillName.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {quickSkillLoading ? (
                  <span>Saving to DB...</span>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill to Database</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">{stats?.totalSkills ?? 0} total skills in DB</span>
            <Link
              href="/admin/skills"
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              View Full Catalog →
            </Link>
          </div>
        </div>

        {/* Top In-Demand Skills & Distribution */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top In-Demand Trades</h3>
              <p className="text-[11px] text-slate-500">Skills adopted by registered service workers</p>
            </div>
            <Link
              href="/admin/skills"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Manage All Skills
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topSkills.slice(0, 8).map((skill, idx) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {skill.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      key: {skill.key}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-bold">
                    {skill.workersCount} Workers
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recent Platform Activity: Recent Registered Users & Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent User Registrations</h3>
              <p className="text-[11px] text-slate-500">Latest clients and workers joining WorkHub</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View All ({stats?.totalUsers ?? 0})
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {user.name[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'WORKER'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : user.role === 'ADMIN'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Added Skills */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recently Added Skills</h3>
              <p className="text-[11px] text-slate-500">Newly added trades in the catalog</p>
            </div>
            <Link
              href="/admin/skills"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Manage Catalog ({stats?.totalSkills ?? 0})
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentSkills.map((skill) => (
              <div key={skill.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {skill.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">
                      {skill.key}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      skill.isCustom
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {skill.isCustom ? 'Custom' : 'Standard'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {skill.workersCount} workers
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
