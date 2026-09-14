"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { type LeafletEventHandlerFn } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import {
  MapPin,
  Navigation,
  Crosshair,
  Layers,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Search,
  Loader2,
  X,
  MapPinned,
} from "lucide-react";

// Custom modern SVG Marker Icons
const createWorkHubIcon = (color: string = "#4f46e5") => {
  return L.divIcon({
    className: "workhub-map-marker",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: ${color};
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2);
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin-top: -2px;
        "></div>
        <div style="
          position: absolute;
          bottom: -4px;
          width: 14px;
          height: 5px;
          background: rgba(0,0,0,0.25);
          border-radius: 50%;
          filter: blur(1px);
        "></div>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [0, 0],
    popupAnchor: [0, -46],
  });
};

const defaultPinIcon = createWorkHubIcon("#2563eb");
const userLocationIcon = createWorkHubIcon("#10b981");

interface MapControllerProps {
  onLocationFound: (latlng: L.LatLng, accuracy: number) => void;
  onMapClick: (latlng: L.LatLng) => void;
  isLocating: boolean;
  setIsLocating: (val: boolean) => void;
  clickMode: "pin" | "locate";
}

function MapController({
  onLocationFound,
  onMapClick,
  setIsLocating,
  clickMode,
}: MapControllerProps) {
  const map = useMapEvents({
    click(e) {
      if (clickMode === "locate") {
        setIsLocating(true);
        map.locate({ enableHighAccuracy: true });
      } else {
        onMapClick(e.latlng);
      }
    },
    locationfound(e) {
      setIsLocating(false);
      onLocationFound(e.latlng, e.accuracy);
      map.flyTo(e.latlng, Math.max(map.getZoom(), 15), {
        duration: 1.5,
      });
    },
    locationerror(e) {
      setIsLocating(false);
      alert(`Location access error: ${e.message}`);
    },
  });

  return null;
}

// Leaflet GeoSearch on-map control
function GeoSearchMapControl({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number, label: string) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    // @ts-expect-error leaflet-geosearch control signature
    const searchControl = new GeoSearchControl({
      provider,
      style: "button",
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: "Search address, city, landmark...",
    });

    map.addControl(searchControl);

    const handleShowLocation: LeafletEventHandlerFn = (event) => {
      const e = event as unknown as { location?: { x: number; y: number; label: string } };
      if (e && e.location) {
        onLocationSelect(e.location.y, e.location.x, e.location.label);
      }
    };

    map.on("geosearch/showlocation", handleShowLocation);

    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", handleShowLocation);
    };
  }, [map, onLocationSelect]);

  return null;
}

// Map Action Helper
function MapActions({ targetCenter, targetZoom }: { targetCenter: [number, number] | null; targetZoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, targetZoom, { duration: 1.2 });
    }
  }, [targetCenter, targetZoom, map]);

  return null;
}

const PRESET_LOCATIONS = [
  { name: "Mohali", lat: 30.6996, lng: 76.6930, zoom: 14 },
  { name: "Chandigarh", lat: 30.7333, lng: 76.7794, zoom: 13 },
  { name: "New Delhi", lat: 28.6139, lng: 77.209, zoom: 13 },
  { name: "London", lat: 51.5074, lng: -0.1278, zoom: 13 },
  { name: "New York", lat: 40.7128, lng: -74.006, zoom: 13 },
];

const QUICK_SEARCH_CHIPS = [
  "GR Tower Mohali",
  "Sector 75 Mohali",
  "Phase 8 Mohali",
  "Connaught Place Delhi",
  "Tower Bridge London",
];

const TILE_PROVIDERS = {
  voyager: {
    name: "Carto Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  light: {
    name: "Carto Positron (Clean)",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  standard: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

export interface InteractiveMapLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface InteractiveMapProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationSelect?: (location: InteractiveMapLocation) => void;
  height?: string;
}

const reverseGeocode = async (lat: number, lng: number): Promise<InteractiveMapLocation> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const street = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || "";
      const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
      const state = addr.state || "";
      const country = addr.country || "India";
      const fullAddress = data.display_name || `${street}, ${city}`;

      return {
        address: street ? `${street}${city ? `, ${city}` : ""}` : fullAddress.split(",").slice(0, 3).join(",").trim(),
        city: city || "Unknown City",
        state: state || "",
        country: country || "India",
        latitude: lat,
        longitude: lng,
      };
    }
  } catch (err) {
    console.error("Reverse geocoding error:", err);
  }

  return {
    address: `Pin at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    city: "",
    state: "",
    country: "India",
    latitude: lat,
    longitude: lng,
  };
};

export default function InteractiveMap({
  initialLat,
  initialLng,
  initialAddress,
  onLocationSelect,
  height,
}: InteractiveMapProps = {}) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number; label?: string } | null>(() => {
    if (initialLat !== undefined && initialLng !== undefined) {
      return {
        lat: initialLat,
        lng: initialLng,
        label: initialAddress || `${initialLat.toFixed(4)}, ${initialLng.toFixed(4)}`,
      };
    }
    return {
      lat: 30.6996,
      lng: 76.6930,
      label: initialAddress || "Mohali, Punjab, India",
    };
  });
  const [isLocating, setIsLocating] = useState(false);
  const [clickMode, setClickMode] = useState<"pin" | "locate">("pin");
  const [tileKey, setTileKey] = useState<keyof typeof TILE_PROVIDERS>("voyager");
  const [targetView, setTargetView] = useState<{ center: [number, number]; zoom: number } | null>(null);

  // GeoSearch state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; label: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchProvider = useMemo(() => new OpenStreetMapProvider(), []);

  const initialCenter: [number, number] = [
    initialLat ?? 30.6996,
    initialLng ?? 76.6930,
  ];

  const handleLocationFound = async (latlng: L.LatLng, accuracy: number) => {
    setUserLocation({ lat: latlng.lat, lng: latlng.lng, accuracy });
    setSelectedPin({ lat: latlng.lat, lng: latlng.lng, label: "Current GPS Location" });
    if (onLocationSelect) {
      const details = await reverseGeocode(latlng.lat, latlng.lng);
      onLocationSelect(details);
    }
  };

  const handleMapClick = async (latlng: L.LatLng) => {
    console.log("location coordsar", latlng);
    setSelectedPin({ lat: latlng.lat, lng: latlng.lng });
    if (onLocationSelect) {
      const details = await reverseGeocode(latlng.lat, latlng.lng);
      setSelectedPin({ lat: latlng.lat, lng: latlng.lng, label: details.address });
      onLocationSelect(details);
    }
  };

  const handleSelectLocation = async (lat: number, lng: number, label: string) => {
    console.log("the location coords are", lat, lng);
    setSelectedPin({ lat, lng, label });
    setTargetView({ center: [lat, lng], zoom: 16 });
    setSearchQuery(label.split(",").slice(0, 2).join(",").trim());
    setShowDropdown(false);

    if (onLocationSelect) {
      const details = await reverseGeocode(lat, lng);
      // If reverse geocode didn't catch city/state, use parsed label
      const parts = label.split(",").map((s) => s.trim());
      if (!details.city && parts.length >= 2) {
        details.city = parts[parts.length - 2] || "";
      }
      onLocationSelect({
        ...details,
        address: details.address || label.split(",").slice(0, 2).join(", ").trim(),
      });
    }
  };

  // Debounced autocomplete search using leaflet-geosearch provider
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      const timer = setTimeout(() => {
        setSearchResults([]);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchProvider.search({ query: trimmed });
        if (results && results.length > 0) {
          setSearchResults(
            results.slice(0, 6).map((r: { x: number; y: number; label: string }) => ({
              lat: r.y,
              lng: r.x,
              label: r.label,
            }))
          );
          setShowDropdown(true);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("GeoSearch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, searchProvider]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery ?? searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const results = await searchProvider.search({ query: q });
      if (results && results.length > 0) {
        const top = results[0];
        handleSelectLocation(top.y, top.x, top.label);
      } else {
        alert(`No location found for "${q}". Try another landmark or address.`);
      }
    } catch (err) {
      console.error("GeoSearch submit error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const triggerLocate = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          setUserLocation({ lat, lng, accuracy });
          setSelectedPin({ lat, lng, label: "Verified GPS Location" });
          setTargetView({ center: [lat, lng], zoom: 15 });
          setIsLocating(false);
        },
        (err) => {
          setIsLocating(false);
          alert(`Geolocation failed: ${err.message}`);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Search & Controls Panel */}
      <div className="flex flex-col gap-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Row 1: Instant Search Bar powered by leaflet-geosearch */}
        <div className="relative w-full" ref={dropdownRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center w-full"
          >
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-indigo-600" />
              )}
            </div>

            <input
              id="map-geosearch-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              placeholder="Search address, landmark, or city (e.g. GR Tower Mohali, London, New York)..."
              className="w-full pl-10 pr-28 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 font-medium rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown List */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden z-[2000] max-h-72 overflow-y-auto">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>Nominatim GeoSearch Results</span>
                <span className="text-[10px] text-slate-400">Powered by leaflet-geosearch</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {searchResults.map((res, index) => (
                  <li key={`${res.lat}-${res.lng}-${index}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectLocation(res.lat, res.lng, res.label)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-indigo-50/60 flex items-start gap-2.5 transition-colors cursor-pointer group"
                    >
                      <MapPinned className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-700">
                          {res.label.split(",")[0]}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {res.label}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {res.lat.toFixed(5)}, {res.lng.toFixed(5)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick:
          </span>
          {QUICK_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setSearchQuery(chip);
                handleSearchSubmit(undefined, chip);
              }}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-indigo-700 bg-slate-100/90 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 rounded-lg transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Row 2: Secondary Controls (Locate, Mode, Tile Style, Presets) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-locate-me"
              onClick={triggerLocate}
              disabled={isLocating}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
            >
              {isLocating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Locating GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>My Location</span>
                </>
              )}
            </button>

            <button
              id="btn-reset-view"
              onClick={() => {
                setTargetView({ center: initialCenter, zoom: 13 });
                setSelectedPin({ lat: initialCenter[0], lng: initialCenter[1], label: "Mohali, Punjab, India" });
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Mode Switch */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-medium text-slate-600">
              <button
                onClick={() => setClickMode("pin")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  clickMode === "pin"
                    ? "bg-white text-indigo-700 font-semibold shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                Click: Drop Pin
              </button>
              <button
                onClick={() => setClickMode("locate")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  clickMode === "locate"
                    ? "bg-white text-indigo-700 font-semibold shadow-xs"
                    : "hover:text-slate-900"
                }`}
              >
                Click: Find GPS
              </button>
            </div>
          </div>

          {/* Style selector & City quick jump */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Style:</span>
              <select
                value={tileKey}
                onChange={(e) => setTileKey(e.target.value as keyof typeof TILE_PROVIDERS)}
                className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="voyager">Carto Voyager (Sleek)</option>
                <option value="light">Carto Positron (Clean)</option>
                <option value="standard">OpenStreetMap Standard</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              {PRESET_LOCATIONS.slice(0, 3).map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    setTargetView({ center: [loc.lat, loc.lng], zoom: loc.zoom });
                    setSelectedPin({ lat: loc.lat, lng: loc.lng, label: `${loc.name}` });
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Canvas Wrapper */}
      <div
        className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-900/5 bg-slate-100"
        style={{ height: height || "620px" }}
      >
        <MapContainer
          center={initialCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            key={tileKey}
            attribution={TILE_PROVIDERS[tileKey].attribution}
            url={TILE_PROVIDERS[tileKey].url}
          />

          {/* Leaflet GeoSearch On-Map Control Button */}
          <GeoSearchMapControl onLocationSelect={handleSelectLocation} />

          <MapController
            onLocationFound={handleLocationFound}
            onMapClick={handleMapClick}
            isLocating={isLocating}
            setIsLocating={setIsLocating}
            clickMode={clickMode}
          />

          {targetView && (
            <MapActions targetCenter={targetView.center} targetZoom={targetView.zoom} />
          )}

          {/* User GPS Pin */}
          {userLocation && (
            <>
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={userLocationIcon}
              >
                <Popup>
                  <div className="p-1 max-w-[220px]">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>GPS Position Verified</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">
                      Latitude: {userLocation.lat.toFixed(5)}<br />
                      Longitude: {userLocation.lng.toFixed(5)}
                    </p>
                    {userLocation.accuracy && (
                      <span className="inline-block text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium rounded-md">
                        Accuracy: ~{Math.round(userLocation.accuracy)}m
                      </span>
                    )}
                  </div>
                </Popup>
              </Marker>
              {userLocation.accuracy && (
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={userLocation.accuracy}
                  pathOptions={{
                    color: "#10b981",
                    fillColor: "#10b981",
                    fillOpacity: 0.15,
                    weight: 1.5,
                  }}
                />
              )}
            </>
          )}

          {/* Selected Dropped Pin */}
          {selectedPin && (
            <Marker
              position={[selectedPin.lat, selectedPin.lng]}
              icon={defaultPinIcon}
            >
              <Popup>
                <div className="p-1.5 min-w-[220px] max-w-[280px]">
                  <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>WorkHub Selected Location</span>
                  </div>
                  {selectedPin.label && (
                    <p className="text-xs font-semibold text-slate-900 mb-1 leading-snug">
                      {selectedPin.label}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mb-1">
                    Coordinates:
                  </p>
                  <div className="p-2 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-600 border border-slate-200/80 mb-2">
                    {selectedPin.lat.toFixed(6)}, {selectedPin.lng.toFixed(6)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Service coverage verified</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Floating Coordinates & Address Badge */}
        <div className="absolute bottom-5 left-5 z-[1000] pointer-events-auto max-w-xs sm:max-w-md">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg text-xs">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <Crosshair className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {selectedPin?.label ? "Selected Place" : "Current Pin"}
              </div>
              {selectedPin?.label && (
                <div className="text-xs font-bold text-slate-800 truncate">
                  {selectedPin.label.split(",")[0]}
                </div>
              )}
              <div className="font-mono text-[11px] font-medium text-slate-600 truncate">
                {selectedPin
                  ? `${selectedPin.lat.toFixed(4)}°, ${selectedPin.lng.toFixed(4)}°`
                  : "No pin selected"}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Floating Tip */}
        <div className="absolute top-5 right-5 z-[1000] pointer-events-auto hidden md:block">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md text-white rounded-xl shadow-lg text-xs font-medium">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Search place • Click map to drop pin • Scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
}
