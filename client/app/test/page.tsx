"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Compass,
  ShieldCheck,
  Zap,
  Layers,
  ArrowLeft,
  Search,
} from "lucide-react";

// Dynamic import with SSR disabled to prevent Leaflet "window is not defined" error
const InteractiveMap = dynamic(
  () => import("@/components/map/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-[620px] w-full bg-slate-50 border border-slate-200/80 rounded-3xl animate-pulse">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-base font-semibold text-slate-700">
          Loading Interactive Map...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Initializing Leaflet tiles, GeoSearch & GPS controllers
        </p>
      </div>
    ),
  }
);

export default function TestPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-b from-[#f8f9ff] to-[#eef2ff] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Compass className="w-3 h-3" />
                Hyperlocal Map Component
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d1c2e] tracking-tight">
              Interactive Location & Coverage Map
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Search any address or landmark using leaflet-geosearch, preview verified service areas,
              test high-accuracy GPS positioning, and select coordinates for hyperlocal service bookings.
            </p>
          </div>

          {/* Quick Feature Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200/80 shadow-xs text-xs font-medium text-slate-700">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>GeoSearch Enabled</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200/80 shadow-xs text-xs font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Accuracy</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200/80 shadow-xs text-xs font-medium text-slate-700">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Real-Time Coordinates</span>
            </div>
          </div>
        </div>

        {/* The Interactive Map Component */}
        <div className="w-full">
          <InteractiveMap />
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/70 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Hyperlocal GeoSearch
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant address, city, & landmark search with live suggestions powered by leaflet-geosearch.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/70 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                One-Click Geolocation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quickly lock onto user coordinates with animated fly-to camera and accuracy radius circles.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/70 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Custom WorkHub Pins
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Modern SVG pins with shadow depth, hover scaling, address labels, and styled popup cards.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/70 shadow-xs flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Multi-Style Map Tiles
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch between Carto Voyager, Positron Light, and OpenStreetMap standard map styles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
