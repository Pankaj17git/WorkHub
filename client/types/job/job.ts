export interface Address {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface FormValues {
  title: string;
  description: string;
  serviceName: string;
  skills: string[];

  minAmount: number;
  maxAmount: number;
  currency: string;

  requiredWorkers: number;
  minimumWorkers: number;
  maximumWorkers: number;

  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  applicationDeadline?: string;

  workerRequirementType: "CUSTOMER_DEFINED" | "PLATFORM_RECOMMENDED";

  address: Address;
}

export enum JobStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface JobSkillObject {
  id?: string | number;
  name: string;
}

export type JobSkillItem = string | JobSkillObject;

export interface RawJobCustomer {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface RawJobPosting {
  id: string;
  title: string;
  description?: string;
  serviceName?: string;
  customer?: RawJobCustomer | null;
  customerName?: string;
  customerAvatar?: string;
  address?: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
    address?: string | null;
  } | null;
  location?: string;
  distanceKm?: number;
  status: 'OPEN' | 'URGENT' | 'IN_PROGRESS' | string;
  minAmount?: number;
  maxAmount?: number;
  minBudget?: number;
  maxBudget?: number;
  requiredWorkers?: number;
  skills?: JobSkillItem[];
  createdAt?: string;
  postedAt?: string;
}

export interface RawJobsApiResponse {
  jobs?: RawJobPosting[];
  data?: {
    jobs?: RawJobPosting[];
  };
}

export type MarketplaceJobStatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS';

/* ─── Nearby Jobs API Response Types (Worker Job Discovery) ────────── */

/** Address shape returned by the nearby-jobs geo endpoint */
export interface RawJobAddress {
  id?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/** Customer info embedded in a nearby job result */
export interface RawNearbyJobCustomer {
  id: string;
  name?: string | null;
  email?: string | null;
}

/**
 * Single job item returned by the `GET /api/jobs` nearby-jobs endpoint.
 * Mirrors `NearbyJobResult` from `geo.service.ts` with serialised IDs.
 */
export interface RawNearbyJobItem {
  id: string;
  title: string;
  description: string;
  serviceName?: string | null;
  customerId: string;
  customer?: RawNearbyJobCustomer | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  currency?: string | null;
  preferredDate?: string | null;
  preferredStartTime?: string | null;
  preferredEndTime?: string | null;
  applicationDeadline?: string | null;
  requiredWorkers: number;
  assignedWorkerCount: number;
  staffingStatus: string;
  status: string;
  skills: string[];
  address: RawJobAddress | null;
  distance: number;
  unit: string;
  formattedDistance: string;
}

/**
 * Paginated API response returned by `GET /api/jobs` when the worker
 * fetches nearby job openings with filters (mirrors `RawWorkersApiResponse`).
 */
export interface RawNearbyJobsApiResponse {
  data: RawNearbyJobItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  radius?: number;
  unit?: string;
}