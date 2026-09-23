// components/jobs/LocationSection.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FormikProps } from 'formik';
import {
  MapPin,
  Compass,
  ChevronDown,
  ChevronUp,
  MapPinned,
  CheckCircle2,
} from 'lucide-react';
import type { InteractiveMapLocation } from '@/components/map/InteractiveMap';
import { FormField } from '@/components/ui/form/FormField';
import { FormValues } from '@/types/job/job';

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[420px] w-full bg-slate-50 border border-slate-200 rounded-2xl animate-pulse">
      <div className="w-10 h-10 border-4 border-[#0051d5] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm font-semibold text-slate-700">Loading Interactive Map...</p>
      <p className="text-xs text-slate-400 mt-1">Initializing GPS and GeoSearch providers</p>
    </div>
  ),
});

type Props = { formik: FormikProps<FormValues> };

export function LocationSection({ formik }: Props) {
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleMapLocationSelect = (loc: InteractiveMapLocation) => {
    if (loc.address) formik.setFieldValue('address.address', loc.address);
    if (loc.city) formik.setFieldValue('address.city', loc.city);
    if (loc.state) formik.setFieldValue('address.state', loc.state);
    if (loc.country) formik.setFieldValue('address.country', loc.country);
    formik.setFieldValue('address.latitude', Number(loc.latitude.toFixed(6)));
    formik.setFieldValue('address.longitude', Number(loc.longitude.toFixed(6)));
  };

  return (
    <section className="space-y-4 pt-4 border-t border-[#f1f5f9]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
            4. Job Site Location & Map Selection
          </h3>
          <p className="text-[11px] text-[#64748b] mt-0.5">
            Type your address manually or pick your exact location on the interactive map.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMapPicker(!showMapPicker)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            showMapPicker
              ? 'bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe]'
              : 'bg-[#091426] text-white hover:bg-[#1e293b]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          {showMapPicker ? 'Close Map View' : 'Pick Address from Map'}
          {showMapPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Map Panel */}
      {showMapPicker && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MapPinned className="w-4 h-4 text-[#0051d5]" />
              Click anywhere on the map or search to auto-fill address details
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Updates latitude, longitude, and site address automatically
            </span>
          </div>

          <InteractiveMap
            initialLat={formik.values.address.latitude}
            initialLng={formik.values.address.longitude}
            initialAddress={formik.values.address.address}
            onLocationSelect={handleMapLocationSelect}
            height="450px"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Pinned:{' '}
                <span className="font-semibold text-slate-900">
                  {formik.values.address.latitude.toFixed(4)},{' '}
                  {formik.values.address.longitude.toFixed(4)}
                </span>{' '}
                ({formik.values.address.city || 'Custom Pin'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowMapPicker(false)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Done with Map
            </button>
          </div>
        </div>
      )}

      {/* Address Fields */}
      <div className="space-y-4">
        <FormField
          label="Site Street Address"
          required
          error={formik.touched.address?.address && formik.errors.address?.address}
        >
          <div className="relative">
            <input
              id="addressLine"
              name="address.address"
              type="text"
              placeholder="House / Flat No., Street, Sector, Landmark"
              value={formik.values.address.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border rounded-xl focus:outline-none ${
                formik.touched.address?.address && formik.errors.address?.address
                  ? 'border-red-400'
                  : 'border-[#e2e8f0] focus:border-[#0051d5]'
              }`}
            />
            {formik.values.address.latitude && (
              <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] text-[#0d9488] bg-[#f0fdfa] px-2 py-0.5 rounded-md border border-[#ccfbf1]">
                <MapPin className="w-3 h-3" />
                GPS Attached
              </div>
            )}
          </div>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField
            label="City"
            required
            error={formik.touched.address?.city && formik.errors.address?.city}
          >
            <input
              id="city"
              name="address.city"
              type="text"
              value={formik.values.address.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 text-xs bg-[#f8f9ff] border rounded-xl focus:outline-none text-[#091426] ${
                formik.touched.address?.city && formik.errors.address?.city
                  ? 'border-red-400'
                  : 'border-[#e2e8f0] focus:border-[#0051d5]'
              }`}
            />
          </FormField>

          <FormField
            label="State"
            required
            error={formik.touched.address?.state && formik.errors.address?.state}
          >
            <input
              id="state"
              name="address.state"
              type="text"
              value={formik.values.address.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 text-xs bg-[#f8f9ff] border rounded-xl focus:outline-none text-[#091426] ${
                formik.touched.address?.state && formik.errors.address?.state
                  ? 'border-red-400'
                  : 'border-[#e2e8f0] focus:border-[#0051d5]'
              }`}
            />
          </FormField>

          <FormField
            label="Country"
            required
            error={formik.touched.address?.country && formik.errors.address?.country}
          >
            <input
              id="country"
              name="address.country"
              type="text"
              value={formik.values.address.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 text-xs bg-[#f8f9ff] border rounded-xl focus:outline-none text-[#091426] ${
                formik.touched.address?.country && formik.errors.address?.country
                  ? 'border-red-400'
                  : 'border-[#e2e8f0] focus:border-[#0051d5]'
              }`}
            />
          </FormField>
        </div>

        {/* Coordinates Preview */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#64748b]">Latitude</span>
            <span className="text-xs font-mono font-semibold text-[#091426]">
              {formik.values.address.latitude}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-[#64748b]">Longitude</span>
            <span className="text-xs font-mono font-semibold text-[#091426]">
              {formik.values.address.longitude}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}