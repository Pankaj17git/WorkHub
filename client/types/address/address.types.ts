export interface GeoLocation {
  lat: number;
  lng: number;
  label: string;
}

export interface GeoSearchRawResult {
  x: number;
  y: number;
  label: string;
}

export interface GeoSearchProvider {
  search: (options: { query: string }) => Promise<GeoSearchRawResult[]>;
}

export interface SearchInputProps {
  searchProvider: GeoSearchProvider;
  onSelectLocation: (location: GeoLocation) => void;
  onClear?: () => void;
  placeholder?: string;
  minChars?: number;
  debounceMs?: number;
  maxResults?: number;
  onTypingResult?: (result: GeoLocation[]) => void;
  showPopularLocations?: boolean;
}

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
  onError?: (message: string) => void;
  height?: string;
}

export interface SelectedPin {
  lat: number;
  lng: number;
  label?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type ClickMode = 'pin' | 'locate';

export interface NominatimAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  amenity?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state_district?: string;
  state?: string;
  country?: string;
}

export interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

export interface ReverseGeocodeResponse {
  display_name?: string;
}