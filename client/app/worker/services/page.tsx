'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Check,
  Edit3,
  Clock,
  DollarSign,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { MOCK_WORKER_SERVICES } from '@/data/mockWorkerData';
import { ServiceItem } from '@/types';
import PriceTag from '@/components/ui/PriceTag';

export default function WorkerServicesManagementPage() {
  const [services, setServices] = useState<ServiceItem[]>(MOCK_WORKER_SERVICES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const toggleEnable = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleStartEdit = (srv: ServiceItem) => {
    setEditingId(srv.id);
    setTempPrice(srv.price);
  };

  const handleSavePrice = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: tempPrice } : s))
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold text-[#2a2a2a] tracking-tight"
            style={{ fontFamily: 'var(--gesso-font-display)' }}
          >
            My Services & Custom Pricing
          </h1>
          <p className="text-xs sm:text-sm text-[#606060] mt-1">
            Customize the service catalogue and fixed visit rates shown to customers on your public profile.
          </p>
        </div>

        <button
          onClick={() => alert('New custom service modal')}
          className="px-4 py-2.5 bg-[#f5a623] hover:brightness-95 text-black text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Service</span>
        </button>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#606060]">
            Active Catalog ({services.filter((s) => s.enabled).length} Enabled)
          </span>
          <span className="text-xs text-[#149343] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Fixed Upfront Price Protection Active
          </span>
        </div>

        <div className="space-y-3">
          {services.map((srv) => {
            const isEditing = editingId === srv.id;

            return (
              <div
                key={srv.id}
                className={`p-5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  srv.enabled
                    ? 'border-black/5 bg-white hover:border-[#f5a623]'
                    : 'border-transparent bg-[#f4eee4]/60 opacity-60'
                }`}
              >
                {/* Left details */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-base font-bold text-[#2a2a2a]"
                      style={{ fontFamily: 'var(--gesso-font-display)' }}
                    >
                      {srv.name}
                    </h3>
                    {srv.popular && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[rgba(245,166,35,0.12)] text-[#875b13]">
                        High Demand
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#606060]">{srv.description}</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#606060] pt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#C9713A]" />
                    <span>Est. {srv.durationMinutes} mins service duration</span>
                  </div>
                </div>

                {/* Right price and controls */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#2a2a2a]">₹</span>
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(Number(e.target.value))}
                        className="whl-input w-24 px-2 py-1 text-sm font-bold"
                      />
                      <button
                        onClick={() => handleSavePrice(srv.id)}
                        className="p-2 bg-[#f5a623] hover:brightness-95 text-black rounded-lg text-xs font-bold transition-all"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <PriceTag amount={srv.price} size="lg" />
                      <button
                        onClick={() => handleStartEdit(srv)}
                        className="p-1.5 rounded-lg text-[#606060] hover:text-[#875b13] hover:bg-[rgba(245,166,35,0.12)] transition-colors"
                        title="Edit Price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Enable / Disable Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={srv.enabled}
                      onChange={() => toggleEnable(srv.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#dddddd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#dddddd] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f5a623]"></div>
                  </label>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
