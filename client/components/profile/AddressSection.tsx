"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getToken } from "@/lib/auth-client";
import type { InteractiveMapLocation } from "@/components/map/InteractiveMap";

// Dynamic import with SSR disabled to prevent Leaflet window errors
const InteractiveMap = dynamic(
  () => import("@/components/map/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-[420px] w-full bg-slate-50 border border-slate-200/80 rounded-2xl animate-pulse">
        <div className="w-10 h-10 border-4 border-[#0051d5] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading Interactive Map...</p>
        <p className="text-xs text-slate-400 mt-1">Initializing Leaflet & GeoSearch</p>
      </div>
    ),
  }
);

export interface AddressData {
  id?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

interface AddressSectionProps {
  initialAddress?: AddressData | null;
  onAddressSaved?: (newAddress: AddressData) => void;
  title?: string;
  description?: string;
  badgeLabel?: string;
}

export default function AddressSection({
  initialAddress,
  onAddressSaved,
  title = "Address Details & Coordinates",
  description = "Review and fine-tune your primary service address, city, and GPS coordinates.",
  badgeLabel = "Default",
}: AddressSectionProps) {
  const [addressLine, setAddressLine] = useState(initialAddress?.address || "");
  const [city, setCity] = useState(initialAddress?.city || "");
  const [stateName, setStateName] = useState(initialAddress?.state || "");
  const [country, setCountry] = useState(initialAddress?.country || "India");
  const [latitude, setLatitude] = useState<number | null>(
    initialAddress?.latitude !== undefined && initialAddress?.latitude !== null
      ? Number(initialAddress.latitude)
      : 30.6996
  );
  const [longitude, setLongitude] = useState<number | null>(
    initialAddress?.longitude !== undefined && initialAddress?.longitude !== null
      ? Number(initialAddress.longitude)
      : 76.693
  );

  const [addressHighlight, setAddressHighlight] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync state if initialAddress changes externally
  useEffect(() => {
    if (initialAddress) {
      setAddressLine(initialAddress.address || "");
      setCity(initialAddress.city || "");
      setStateName(initialAddress.state || "");
      setCountry(initialAddress.country || "India");
      if (initialAddress.latitude !== null && initialAddress.latitude !== undefined) {
        setLatitude(Number(initialAddress.latitude));
      }
      if (initialAddress.longitude !== null && initialAddress.longitude !== undefined) {
        setLongitude(Number(initialAddress.longitude));
      }
    }
  }, [initialAddress]);

  // Map coordinate/address selection callback
  const handleMapLocationSelect = (loc: InteractiveMapLocation) => {
    setAddressLine(loc.address);
    if (loc.city) setCity(loc.city);
    if (loc.state) setStateName(loc.state);
    if (loc.country) setCountry(loc.country);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);

    // Visual pulse feedback
    setAddressHighlight(true);
    setTimeout(() => setAddressHighlight(false), 1500);
  };

  // Save address handler
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressMsg(null);

    const token = getToken();
    if (!token) {
      setAddressMsg({ type: "error", text: "Session expired. Please log in again." });
      setSavingAddress(false);
      return;
    }

    if (!addressLine.trim() || !city.trim() || !stateName.trim() || !country.trim()) {
      setAddressMsg({ type: "error", text: "Please fill in all required address fields." });
      setSavingAddress(false);
      return;
    }

    try {
      const res = await fetch("/api/user/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: addressLine.trim(),
          city: city.trim(),
          state: stateName.trim(),
          country: country.trim(),
          latitude: latitude !== null ? Number(latitude) : 0,
          longitude: longitude !== null ? Number(longitude) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to save address");
      }

      const saved: AddressData = {
        id: data.data?.address?.id || initialAddress?.id || "1",
        address: addressLine.trim(),
        city: city.trim(),
        state: stateName.trim(),
        country: country.trim(),
        latitude,
        longitude,
      };

      if (onAddressSaved) {
        onAddressSaved(saved);
      }

      setAddressMsg({ type: "success", text: "Address saved and linked to your profile successfully!" });
      setTimeout(() => setAddressMsg(null), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error saving address.";
      setAddressMsg({ type: "error", text: errorMsg });
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Address Summary Box */}
      {initialAddress?.address ? (
        <div className="bg-white border border-[#a7f3d0] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-[#f0fdfa]">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-[#ecfdf5] text-[#0d9488] shrink-0 border border-[#a7f3d0]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#091426]">
                  Current Primary Address
                </h3>
                <span className="text-[10px] font-extrabold text-[#0d9488] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                  {badgeLabel}
                </span>
              </div>
              <p className="text-xs text-[#334155] font-medium mt-1 leading-relaxed">
                {initialAddress.address}, {initialAddress.city}, {initialAddress.state} — {initialAddress.country}
              </p>
              {initialAddress.latitude && initialAddress.longitude && (
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  GPS: {Number(initialAddress.latitude).toFixed(4)}°, {Number(initialAddress.longitude).toFixed(4)}°
                </p>
              )}
            </div>
          </div>

          <span className="text-xs font-bold text-[#0d9488] bg-white px-3 py-1.5 rounded-xl border border-[#a7f3d0] self-start sm:self-auto shadow-2xs">
            Active & Verified
          </span>
        </div>
      ) : (
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-3xl p-5 text-xs text-[#92400e] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#d97706] shrink-0" />
          <span>
            No default address linked to your account yet. Use the interactive map below or enter your details manually to set your address.
          </span>
        </div>
      )}

      {/* Live Interactive Map Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#091426]">
                Pinpoint Address on Map
              </h3>
              <span className="text-[11px] font-bold text-[#0051d5] bg-[#eff6ff] px-2 py-0.5 rounded-full border border-[#bfdbfe] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Auto-Fill Enabled
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Click anywhere on the map, use the search bar, or click &apos;Find GPS&apos; to automatically fill the address form.
            </p>
          </div>
        </div>

        {/* Interactive Map Component */}
        <div className="w-full">
          <InteractiveMap
            initialLat={latitude ?? 30.6996}
            initialLng={longitude ?? 76.693}
            initialAddress={addressLine || "Mohali, Punjab, India"}
            onLocationSelect={handleMapLocationSelect}
            height="460px"
          />
        </div>
      </div>

      {/* Address Input Form */}
      <div
        className={`bg-white border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-all duration-500 ${
          addressHighlight
            ? "border-[#0051d5] ring-4 ring-[#0051d5]/15"
            : "border-[#e2e8f0]"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
          <div>
            <h3 className="text-base font-bold text-[#091426]">
              {title}
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {addressMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              addressMsg.type === "success"
                ? "bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {addressMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{addressMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveAddress} className="space-y-4">
          {/* Street / House Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Street Address / House / Flat No.</span>
            </label>
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Flat 402, GR Tower, Sector 75"
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] focus:bg-white text-[#091426] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155]">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mohali / Chandigarh"
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155]">State / Province</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="e.g. Punjab"
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155]">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
              />
            </div>
          </div>

          {/* GPS Coordinates Display & Edit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1 font-geist">
                <Compass className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Latitude</span>
              </label>
              <input
                type="number"
                step="any"
                value={latitude !== null ? latitude : ""}
                onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="30.6996"
                className="w-full px-3.5 py-2 text-xs bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl font-mono text-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1 font-geist">
                <Compass className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Longitude</span>
              </label>
              <input
                type="number"
                step="any"
                value={longitude !== null ? longitude : ""}
                onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="76.6930"
                className="w-full px-3.5 py-2 text-xs bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl font-mono text-slate-700"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-3">
            <button
              type="submit"
              disabled={savingAddress}
              className="px-6 py-2.5 bg-[#0051d5] hover:bg-[#0042b0] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {savingAddress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Address...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Link Address</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
