"use client";

import { Loader2, MapPinned, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GeoLocation,
  GeoSearchProvider,
  GeoSearchRawResult,
  SearchInputProps,
} from "@/types/address/address.types";

export type { GeoLocation, GeoSearchProvider, GeoSearchRawResult, SearchInputProps };

export default function SearchInput ({
  searchProvider,
  onSelectLocation,
  onClear,
  placeholder = "Search address, landmark, or city...",
  minChars = 3,
  debounceMs = 400,
  maxResults = 6,
  onTypingResult,
  showPopularLocations = true,
}: SearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const programmaticQueryRef = useRef("");
  const requestIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(
    async (query: string) => {
      const requestId = ++requestIdRef.current;
      setIsSearching(true);
      try {
        const results = await searchProvider.search({ query });
        if (requestId !== requestIdRef.current) return; // stale response
        const mapped: GeoLocation[] = results
          .slice(0, maxResults)
          .map((r) => ({ lat: r.y, lng: r.x, label: r.label }));
        setSearchResults(mapped);
        onTypingResult?.(mapped);
        setShowDropdown(mapped.length > 0);
      } catch (err) {
        if (requestId === requestIdRef.current) {
          console.error("GeoSearch error:", err);
        }
      } finally {
        if (requestId === requestIdRef.current) setIsSearching(false);
      }
    },
    [searchProvider, maxResults],
  );

  // Debounced autocomplete
  useEffect(() => {
    const query = searchQuery.trim();

    if (query === programmaticQueryRef.current) return; // set by a selection
    if (query.length < minChars) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => void runSearch(query), debounceMs);

    return () => {
      clearTimeout(timer);
      requestIdRef.current++; // invalidate any in-flight request
    };
  }, [searchQuery, minChars, debounceMs, runSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (location: GeoLocation) => {
    programmaticQueryRef.current = location.label.trim();
    setSearchQuery(location.label);
    setSearchResults([]);
    setShowDropdown(false);
    setIsSearching(false);
    onSelectLocation(location); // send data to parent
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query || query === programmaticQueryRef.current) return;
    void runSearch(query); // skip the debounce on explicit submit
  };

  const handleClear = () => {
    programmaticQueryRef.current = "";
    requestIdRef.current++;
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setIsSearching(false);
    onClear?.();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
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
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowDropdown(false);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-10 pr-28 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 font-medium rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
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

      {showPopularLocations && showDropdown && searchResults.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden z-[2000] max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Nominatim GeoSearch Results</span>
            <span className="text-[10px] text-slate-400">
              Powered by leaflet-geosearch
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {searchResults.map((res, index) => (
              <li key={`${res.lat}-${res.lng}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(res)}
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
  );
};

