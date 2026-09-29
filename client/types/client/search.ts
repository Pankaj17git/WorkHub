export interface Worker {
  id: number | string;
  name: string;
  title: string;
  avatar: string;
  coverImage: string;
  category: string;
  location: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  experienceYears: number;
  hourlyRate: number;
  verified: boolean;
  online: boolean;
  responseTimeMinutes: number;
  about: string;
  skills: string[];
  services: Service[];
  reviews: string[];
  badges: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export type SearchMode = 'workers' | 'jobs';
export type SearchAvailability = 'any' | 'today' | 'this_week' | 'custom';
export type SearchSortOption =
  | 'recommended'
  | 'rating'
  | 'distance'
  | 'price_low'
  | 'price_high'
  | 'recent';
export type ViewMode = 'list' | 'grid';
export type BudgetRange = 'ALL' | 'LOW' | 'MID' | 'HIGH';
export type JobFilterStatus = 'ALL' | 'OPEN' | 'URGENT';

export interface SkillItem {
  id?: string | number | bigint;
  key: string;
  name: string;
}

export interface RawWorkerService {
  id: string;
  name?: string;
  serviceName?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
}

export interface RawWorkerAddress {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  address?: string | null;
}

export interface RawWorkerItem {
  id: string | number;
  userId?: string | number;
  name: string;
  headline?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  hourlyRate?: number;
  skills?: string[];
  services?: RawWorkerService[];
  address?: RawWorkerAddress | null;
}

export interface RawWorkersApiResponse {
  data?: {
    workers?: RawWorkerItem[];
  } | RawWorkerItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}