'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  HardHat,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Briefcase,
  Mail,
  Phone
} from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  profileImage: string | null;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  worker?: {
    id: string;
    isVerified: boolean;
    headline: string | null;
    hourlyRate: number | null;
  } | null;
  customer?: {
    id: string;
    companyName: string | null;
    phone: string | null;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'WORKER' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_VERIFICATION'>('ALL');

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (roleFilter !== 'ALL') params.set('role', roleFilter);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);

    const res = await api.get(`/api/admin/users?${params.toString()}`);
    return res.data;
  };

  useEffect(() => {
    fetchUsers().then(res => {
      if (res.success) {
        setUsers(res.users);
      }
      setLoading(false);
    }).catch(err => {
      console.log(err);
      setLoading(false);
    });
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers().then(res => {
      if (res.success) {
        setUsers(res.users);
      }
      setLoading(false);
    }).catch(err => {
      console.log(err);
      setLoading(false);
    });
  };

  const handleToggleStatus = async (user: PlatformUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setTogglingId(user.id);
    try {
      const res = await api.patch('/api/admin/users', {
        userId: user.id,
        status: nextStatus,
      });

      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to update user status'));
    } finally {
      setTogglingId(null);
    }
  };

  const totalWorkers = users.filter((u) => u.role === 'WORKER').length;
  const totalCustomers = users.filter((u) => u.role === 'CUSTOMER').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Users & Clients Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            View, filter, inspect, and manage all registered clients, workers, and administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Role Filter Tabs & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'ALL'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">
            All Users
          </span>
          <span className="text-2xl font-extrabold mt-1 block">
            {roleFilter === 'ALL' ? users.length : 'All'}
          </span>
        </button>

        <button
          onClick={() => setRoleFilter('CUSTOMER')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'CUSTOMER'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">
              Customers
            </span>
            <ShoppingBag className="w-4 h-4 opacity-80" />
          </div>
          <span className="text-2xl font-extrabold mt-1 block">
            {roleFilter === 'CUSTOMER' ? users.length : totalCustomers}
          </span>
        </button>

        <button
          onClick={() => setRoleFilter('WORKER')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'WORKER'
              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">
              Workers
            </span>
            <Briefcase className="w-4 h-4 opacity-80" />
          </div>
          <span className="text-2xl font-extrabold mt-1 block">
            {roleFilter === 'WORKER' ? users.length : totalWorkers}
          </span>
        </button>

        <button
          onClick={() => setRoleFilter('ADMIN')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            roleFilter === 'ADMIN'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">
              Admins
            </span>
            <ShieldCheck className="w-4 h-4 opacity-80" />
          </div>
          <span className="text-2xl font-extrabold mt-1 block">
            {roleFilter === 'ADMIN' ? users.length : totalAdmins}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'PENDING_VERIFICATION')
            }
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">User / Account</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Profile Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading platform users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">No users found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                            {user.name}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[220px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role column */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'WORKER'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : user.role === 'ADMIN'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {user.role === 'WORKER' && <HardHat className="w-3 h-3 text-teal-600" />}
                        {user.role === 'CUSTOMER' && <ShoppingBag className="w-3 h-3 text-blue-600" />}
                        {user.role === 'ADMIN' && <ShieldCheck className="w-3 h-3 text-indigo-600" />}
                        <span>{user.role}</span>
                      </span>
                    </td>

                    {/* Profile Details column */}
                    <td className="px-6 py-4">
                      {user.role === 'WORKER' && user.worker ? (
                        <div className="text-xs">
                          <span className="text-slate-800 font-medium block truncate max-w-[200px]">
                            {user.worker.headline || 'Independent Technician'}
                          </span>
                          <span className="text-[11px] text-teal-600 font-semibold">
                            {user.worker.hourlyRate ? `$${user.worker.hourlyRate}/hr` : 'Rate: Custom'}
                            {user.worker.isVerified ? ' • Verified' : ''}
                          </span>
                        </div>
                      ) : user.role === 'CUSTOMER' && user.customer ? (
                        <div className="text-xs">
                          <span className="text-slate-800 font-medium block">
                            {user.customer.companyName || 'Residential Client'}
                          </span>
                          <span className="text-[11px] text-slate-400">Home Services Buyer</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">System Operator</span>
                      )}
                    </td>

                    {/* Status column */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{user.status}</span>
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== 'ADMIN' ? (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={togglingId === user.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              user.status === 'ACTIVE'
                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {togglingId === user.id
                              ? 'Saving...'
                              : user.status === 'ACTIVE'
                              ? 'Suspend'
                              : 'Activate'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Protected</span>
                        )}
                      </div>
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
