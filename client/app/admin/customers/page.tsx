'use client';

import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';

interface CustomerItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  companyName: string | null;
  status: string;
  stats: {
    postedJobs: number;
    assignments: number;
    directHireRequests: number;
  };
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    const res = await api.get(`/api/admin/customers?${params.toString()}`)
    return res.data;
  };

  useEffect(() => {
    fetchCustomers().then(res => {
      if (res.success) {
        setCustomers(res.customers);
      }
      setLoading(false);
    }).catch(err => {
      console.log(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Customers & Hiring Clients Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Inspect all registered homeowners and business clients, posted job requests, and launch customer experience mode.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchCustomers().then(res => {
              if (res.success) {
                setCustomers(res.customers);
              }
              setLoading(false);
            }).catch(err => {
              console.log(err);
              setLoading(false);
            }); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-bold text-slate-900">{customers.length}</span>
          <span>Clients Loaded</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Customer / Client</th>
                <th className="px-6 py-4">Company / Property</th>
                <th className="px-6 py-4">Contact Phone</th>
                <th className="px-6 py-4 text-center">Jobs Posted</th>
                <th className="px-6 py-4 text-center">Bookings</th>
                <th className="px-6 py-4 text-center">Direct Hires</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading clients directory...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-700">No customers found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with different terms</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer Name & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-extrabold text-xs shrink-0">
                          {customer.name[0]?.toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                            {customer.name}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Company / Property */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{customer.companyName || 'Residential Client'}</span>
                      </div>
                    </td>

                    {/* Contact Phone */}
                    <td className="px-6 py-4">
                      {customer.phone ? (
                        <span className="text-xs text-slate-700 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          {customer.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not provided</span>
                      )}
                    </td>

                    {/* Jobs Posted */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {customer.stats.postedJobs}
                      </span>
                    </td>

                    {/* Bookings */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                        {customer.stats.assignments}
                      </span>
                    </td>

                    {/* Direct Hires */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {customer.stats.directHireRequests}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          customer.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {customer.status === 'ACTIVE' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{customer.status}</span>
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {new Date(customer.createdAt).toLocaleDateString()}
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
