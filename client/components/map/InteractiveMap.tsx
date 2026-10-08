"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import {
  MapPin,
  Navigation,
  Crosshair,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";
import SearchInput from "./searchInput";
import {
  GeoLocation,
  InteractiveMapLocation,
  InteractiveMapProps,
  SelectedPin,
  UserLocation,
  ClickMode,
  NominatimAddress,
  NominatimResponse,
} from "@/types/address/address.types";

export type { InteractiveMapLocation, InteractiveMapProps };

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_LAT = 30.6996;
const DEFAULT_LNG = 76.693;
const DEFAULT_LABEL = "Mohali, Punjab, India";
const DEFAULT_ZOOM = 13;

const QUICK_SEARCH_CHIPS: readonly string[] = [
  "GR Tower Mohali",
  "Sector 75 Mohali",
  "Phase 8 Mohali",
  "Connaught Place Delhi",
  "Tower Bridge London",
];

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const GEOCODE_CACHE_LIMIT = 200;

/* -------------------------------------------------------------------------- */
/* Marker icons (built once at module scope)                                  */
/* -------------------------------------------------------------------------- */

const createWorkHubIcon = (color: string): L.DivIcon =>
  L.divIcon({
    className: "workhub-map-marker",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div
          class="transition-transform duration-200 hover:scale-110"
          style="
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
            cursor: pointer;
          "
        >
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
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -48],
  });

const defaultPinIcon = createWorkHubIcon("#2563eb");
const userLocationIcon = createWorkHubIcon("#10b981");


/* -------------------------------------------------------------------------- */
/* Reverse geocoding (cached, abortable)                                      */
/* -------------------------------------------------------------------------- */

const geocodeCache = new Map<string, InteractiveMapLocation>();

const fallbackLocation = (
  lat: number,
  lng: number,
): InteractiveMapLocation => ({
  address: `Pin at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
  city: "",
  state: "",
  country: "India",
  latitude: lat,
  longitude: lng,
});

/**
 * Returns null only when the request was aborted (a newer request replaced it).
 */
const reverseGeocode = async (
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<InteractiveMapLocation | null> => {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  const cached = geocodeCache.get(key);
  if (cached) return { ...cached, latitude: lat, longitude: lng };

  try {
    // accept-language as a query param avoids a CORS preflight caused by a custom header
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
      { signal },
    );
    if (!res.ok) return fallbackLocation(lat, lng);

    const data: NominatimResponse = await res.json();
    const addr: NominatimAddress = data.address ?? {};

    const street =
      addr.road || addr.suburb || addr.neighbourhood || addr.amenity || "";
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state_district ||
      "";
    const fullAddress = data.display_name || `${street}, ${city}`;

    const result: InteractiveMapLocation = {
      address: street
        ? `${street}${city ? `, ${city}` : ""}`
        : fullAddress.split(",").slice(0, 3).join(",").trim(),
      city: city || "Unknown City",
      state: addr.state || "",
      country: addr.country || "India",
      latitude: lat,
      longitude: lng,
    };

    if (geocodeCache.size >= GEOCODE_CACHE_LIMIT) {
      const oldestKey = geocodeCache.keys().next().value;
      if (oldestKey !== undefined) geocodeCache.delete(oldestKey);
    }
    geocodeCache.set(key, result);

    return result;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return null;
    console.error("Reverse geocoding error:", err);
    return fallbackLocation(lat, lng);
  }
};

/* -------------------------------------------------------------------------- */
/* Map event controller                                                       */
/* -------------------------------------------------------------------------- */

interface MapControllerProps {
  clickMode: ClickMode;
  onLocationFound: (latlng: L.LatLng, accuracy: number) => void;
  onLocationError: (message: string) => void;
  onMapClick: (latlng: L.LatLng) => void;
  onLocateRequest: () => void;
}

function MapController({
  clickMode,
  onLocationFound,
  onLocationError,
  onMapClick,
  onLocateRequest,
}: MapControllerProps) {
  const map = useMapEvents({
    click(e) {
      if (clickMode === "locate") {
        onLocateRequest();
      } else {
        onMapClick(e.latlng);
      }
    },
    locationfound(e) {
      onLocationFound(e.latlng, e.accuracy);
      map.flyTo(e.latlng, Math.max(map.getZoom(), 15), { duration: 1.5 });
    },
    locationerror(e) {
      onLocationError(`Location access error: ${e.message}`);
    },
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function InteractiveMap({
  initialLat,
  initialLng,
  initialAddress,
  onLocationSelect,
  onError,
  height,
}: InteractiveMapProps = {}) {
  const initialPin = useMemo<SelectedPin>(() => {
    if (initialLat !== undefined && initialLng !== undefined) {
      return {
        lat: initialLat,
        lng: initialLng,
        label:
          initialAddress ||
          `${initialLat.toFixed(4)}, ${initialLng.toFixed(4)}`,
      };
    }
    return {
      lat: DEFAULT_LAT,
      lng: DEFAULT_LNG,
      label: initialAddress || DEFAULT_LABEL,
    };
  }, [initialLat, initialLng, initialAddress]);

  const initialCenter = useMemo<[number, number]>(
    () => [initialPin.lat, initialPin.lng],
    [initialPin],
  );

  const [map, setMap] = useState<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(
    initialPin,
  );
  const [isLocating, setIsLocating] = useState(false);
  const [clickMode, setClickMode] = useState<ClickMode>("pin");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const geoAbortRef = useRef<AbortController | null>(null);

  const searchProvider = useMemo(() => new OpenStreetMapProvider(), []);

  /* ---------------------------- helpers ---------------------------- */

  const reportError = useCallback(
    (message: string) => {
      setErrorMessage(message);
      onError?.(message);
    },
    [onError],
  );

  /** Reverse geocode, aborting any previous in-flight request. */
  const resolveLocation = useCallback(
    (lat: number, lng: number): Promise<InteractiveMapLocation | null> => {
      geoAbortRef.current?.abort();
      const controller = new AbortController();
      geoAbortRef.current = controller;
      return reverseGeocode(lat, lng, controller.signal);
    },
    [],
  );

  useEffect(() => () => geoAbortRef.current?.abort(), []);

  useEffect(() => {
    console.log(map)
    if (map) {

      const corrd1 = {
        lat: 30.748636,
        lng: 76.643286
      }
      const corrd2 = {
        lat: 30.699234,
        lng: 76.693776
      }
      const distance = map.distance(corrd1, corrd2)
      console.log("the dist between the two points is ", (distance / 1000).toFixed(2))
    }
  }, [map])

  /* ---------------------------- map handlers ---------------------------- */

  const startLocate = useCallback(() => {
    if (!map) return;
    setErrorMessage(null);
    setIsLocating(true);
    map.locate({ enableHighAccuracy: true });
  }, [map]);

  const handleLocationFound = useCallback(
    async (latlng: L.LatLng, accuracy: number) => {
      setIsLocating(false);
      setUserLocation({ lat: latlng.lat, lng: latlng.lng, accuracy });
      setSelectedPin({
        lat: latlng.lat,
        lng: latlng.lng,
        label: "Current GPS Location",
      });

      if (onLocationSelect) {
        const details = await resolveLocation(latlng.lat, latlng.lng);
        if (details) onLocationSelect(details);
      }
    },
    [onLocationSelect, resolveLocation],
  );

  const handleLocationError = useCallback(
    (message: string) => {
      setIsLocating(false);
      reportError(message);
    },
    [reportError],
  );

  const handleMapClick = useCallback(
    async (latlng: L.LatLng) => {
      setErrorMessage(null);
      setSelectedPin({ lat: latlng.lat, lng: latlng.lng }); // instant feedback

      if (onLocationSelect) {
        const details = await resolveLocation(latlng.lat, latlng.lng);
        if (!details) return; // superseded by a newer click
        setSelectedPin({
          lat: latlng.lat,
          lng: latlng.lng,
          label: details.address,
        });
        onLocationSelect(details);
      }
    },
    [onLocationSelect, resolveLocation],
  );

  const handleSelectLocation = useCallback(
    async (lat: number, lng: number, label: string) => {
      setErrorMessage(null);
      setSelectedPin({ lat, lng, label });
      map?.flyTo([lat, lng], 16, { duration: 1.2 });

      if (onLocationSelect) {
        const details = await resolveLocation(lat, lng);
        if (!details) return;

        const merged: InteractiveMapLocation = { ...details };
        const parts = label.split(",").map((s) => s.trim());
        if (!merged.city && parts.length >= 2) {
          merged.city = parts[parts.length - 2] || "";
        }
        merged.address =
          merged.address || label.split(",").slice(0, 2).join(", ").trim();
        onLocationSelect(merged);
      }
    },
    [map, onLocationSelect, resolveLocation],
  );

  const handleReset = useCallback(() => {
    map?.flyTo(initialCenter, DEFAULT_ZOOM, { duration: 1.2 });
    setSelectedPin(initialPin);
    setErrorMessage(null);
  }, [map, initialCenter, initialPin]);

  const handleChipClick = useCallback(
    async (chip: string) => {
      try {
        const results = await searchProvider.search({ query: chip });
        const top = results[0];
        if (top) {
          await handleSelectLocation(top.y, top.x, top.label);
        } else {
          reportError(
            `No location found for "${chip}". Try another landmark or address.`,
          );
        }
      } catch (err) {
        console.error("GeoSearch chip error:", err);
        reportError("Search failed. Please try again.");
      }
    },
    [searchProvider, handleSelectLocation, reportError],
  );

  /* ---------------------------- render ---------------------------- */

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Search & Controls Panel */}
      <div className="flex flex-col gap-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search bar */}
        <SearchInput
          searchProvider={searchProvider}
          onSelectLocation={(loc: GeoLocation) =>
            void handleSelectLocation(loc.lat, loc.lng, loc.label)
          }
          placeholder="Search address, landmark, or city (e.g. GR Tower Mohali, London, New York)..."
          showPopularLocations={true}
        />

        {/* Quick search chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick:
          </span>
          {QUICK_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-indigo-700 bg-slate-100/90 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 rounded-lg transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-0.5 rounded-md hover:bg-red-100 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Secondary controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-locate-me"
              type="button"
              onClick={startLocate}
              disabled={isLocating || !map}
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
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Mode switch */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-medium text-slate-600">
              <button
                type="button"
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
                type="button"
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
        </div>
      </div>

      {/* Map canvas */}
      <div
        className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-900/5 bg-slate-100"
        style={{ height: height || "620px" }}
      >
        <MapContainer
          ref={setMap}
          center={initialCenter}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />

          <MapController
            clickMode={clickMode}
            onLocationFound={handleLocationFound}
            onLocationError={handleLocationError}
            onMapClick={handleMapClick}
            onLocateRequest={startLocate}
          />

          {/* User GPS pin */}
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
                      Latitude: {userLocation.lat.toFixed(5)}
                      <br />
                      Longitude: {userLocation.lng.toFixed(5)}
                    </p>
                    {userLocation.accuracy !== undefined && (
                      <span className="inline-block text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium rounded-md">
                        Accuracy: ~{Math.round(userLocation.accuracy)}m
                      </span>
                    )}
                  </div>
                </Popup>
              </Marker>
              {userLocation.accuracy !== undefined && (
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

          {/* Selected pin */}
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

        {/* Floating coordinates & address badge */}
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

        {/* Floating tip */}
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
