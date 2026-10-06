import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type DistanceUnit = "km" | "miles" | "m";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export type CoordinateOrigin =
  | Coordinates
  | { latitude?: number | null; longitude?: number | null }
  | { addressId: string | bigint | number }
  | { userId: string | bigint | number }
  | { customerId: string | bigint | number }
  | { workerId: string | bigint | number }
  | { address: Coordinates | { latitude?: number | null; longitude?: number | null } };

export interface BaseGeoSearchOptions {
  radius?: number; // Default: 25
  unit?: DistanceUnit; // Default: "km"
  page?: number;
  limit?: number;
  dbClient?: typeof prisma;
}

export interface FindNearbyWorkersParams extends BaseGeoSearchOptions {
  origin: CoordinateOrigin;
  query?: string | null;
  skill?: string | null;
  service?: string | null;
  minRating?: number;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  isVerified?: boolean;
  city?: string | null;
  sortBy?: "distance" | "price_low" | "price_high" | "rating" | "recent";
  sortOrder?: "asc" | "desc";
}

export interface FindNearbyJobsParams extends BaseGeoSearchOptions {
  origin: CoordinateOrigin;
  query?: string;
  serviceName?: string;
  skill?: string;
  status?: string; // Default: "OPEN"
  minAmount?: number;
  maxAmount?: number;
  preferredDate?: string | Date;
  sortBy?: "distance" | "budget_high" | "budget_low" | "recent";
  sortOrder?: "asc" | "desc";
}

export interface FormattedAddress {
  id?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  address?: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface NearbyWorkerResult {
  id: string;
  userId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  profileImage?: string | null;
  headline?: string | null;
  bio?: string | null;
  isVerified: boolean;
  hourlyRate: number | null;
  skills: string[];
  services: Array<{
    id: string;
    name: string;
    price: number | null;
  }>;
  address: FormattedAddress | null;
  rating: number;
  reviewCount: number;
  distance: number;
  unit: DistanceUnit;
  formattedDistance: string;
}

export interface NearbyJobResult {
  id: string;
  title: string;
  description: string;
  serviceName?: string | null;
  customerId: string;
  customer?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  currency?: string | null;
  preferredDate?: Date | string | null;
  preferredStartTime?: string | null;
  preferredEndTime?: string | null;
  applicationDeadline?: Date | string | null;
  requiredWorkers: number;
  assignedWorkerCount: number;
  staffingStatus: string;
  status: string;
  skills: string[];
  address: FormattedAddress | null;
  distance: number;
  unit: DistanceUnit;
  formattedDistance: string;
}

export interface PaginatedNearbyResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  origin: Coordinates;
  radius: number;
  unit: DistanceUnit;
}

const EARTH_RADIUS: Record<DistanceUnit, number> = {
  km: 6371,
  miles: 3958.756,
  m: 6371000,
};

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validates whether the given value contains valid geographic latitude and longitude.
 */
export function isValidCoordinates(coord: unknown): coord is Coordinates {
  if (!coord || typeof coord !== "object") return false;
  const c = coord as Record<string, unknown>;
  const lat = typeof c.latitude === "number" ? c.latitude : Number(c.latitude);
  const lng = typeof c.longitude === "number" ? c.longitude : Number(c.longitude);

  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

/**
 * Format distance value with its unit.
 * E.g., 2.34 -> "2.34 km", 0.5 -> "500 m"
 */
export function formatDistance(distance: number, unit: DistanceUnit = "km"): string {
  if (isNaN(distance)) return "Unknown";
  if (unit === "km") {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  }
  if (unit === "miles") {
    return `${distance.toFixed(1)} mi`;
  }
  return `${Math.round(distance)} m`;
}

/**
 * Calculate distance between two coordinates using the Haversine formula.
 *
 * @param coord1 First coordinate { latitude, longitude }
 * @param coord2 Second coordinate { latitude, longitude }
 * @param unit Distance unit: "km" (default), "miles", or "m"
 * @returns Calculated distance rounded to 2 decimal places (or integer for meters), or NaN if invalid
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates,
  unit: DistanceUnit = "km"
): number {
  if (
    !coord1 ||
    !coord2 ||
    typeof coord1.latitude !== "number" ||
    typeof coord1.longitude !== "number" ||
    typeof coord2.latitude !== "number" ||
    typeof coord2.longitude !== "number" ||
    isNaN(coord1.latitude) ||
    isNaN(coord1.longitude) ||
    isNaN(coord2.latitude) ||
    isNaN(coord2.longitude)
  ) {
    return NaN;
  }

  const R = EARTH_RADIUS[unit] || EARTH_RADIUS.km;
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return unit === "m" ? Math.round(distance) : Number(distance.toFixed(2));
}

/**
 * Check if a coordinate is within a specified radius from another coordinate.
 */
export function isWithinRadius(
  point1: Coordinates,
  point2: Coordinates,
  radius: number,
  unit: DistanceUnit = "km"
): boolean {
  const distance = calculateDistance(point1, point2, unit);
  if (isNaN(distance)) return false;
  return distance <= radius;
}

/**
 * Calculate the latitude/longitude bounding box around a center coordinate.
 * Useful for fast database index-filtering prior to Haversine distance computation.
 */
export function getBoundingBox(
  center: Coordinates,
  radius: number,
  unit: DistanceUnit = "km"
): BoundingBox {
  let radiusKm = radius;
  if (unit === "miles") {
    radiusKm = radius * 1.60934;
  } else if (unit === "m") {
    radiusKm = radius / 1000;
  }

  // 1 degree latitude ~ 111.0 km
  const deltaLat = radiusKm / 111.0;
  const minLat = Math.max(-90, center.latitude - deltaLat);
  const maxLat = Math.min(90, center.latitude + deltaLat);

  // 1 degree longitude ~ 111.0 * cos(latitude) km
  const radLat = toRadians(center.latitude);
  const cosLat = Math.cos(radLat);
  const deltaLng = cosLat > 0.0001 ? radiusKm / (111.0 * cosLat) : 180;

  let minLng = center.longitude - deltaLng;
  let maxLng = center.longitude + deltaLng;

  if (minLng < -180) minLng = -180;
  if (maxLng > 180) maxLng = 180;

  return {
    minLat: Number(minLat.toFixed(6)),
    maxLat: Number(maxLat.toFixed(6)),
    minLng: Number(minLng.toFixed(6)),
    maxLng: Number(maxLng.toFixed(6)),
  };
}

/**
 * Resolves a coordinate origin from multiple potential inputs:
 * - Direct coordinates { latitude, longitude }
 * - Object with nested address { address: { latitude, longitude } }
 * - Address ID
 * - User ID (checks user's customer or worker address)
 * - Customer ID
 * - Worker ID
 */
export async function resolveCoordinates(
  origin: CoordinateOrigin,
  db = prisma
): Promise<Coordinates | null> {
  if (!origin) return null;

  // 1. Direct coordinates
  if ("latitude" in origin && "longitude" in origin) {
    const lat = origin.latitude != null ? Number(origin.latitude) : NaN;
    const lng = origin.longitude != null ? Number(origin.longitude) : NaN;
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 2. Nested address coordinates
  if ("address" in origin && origin.address) {
    const addr = origin.address as Record<string, unknown>;
    const lat = addr.latitude != null ? Number(addr.latitude) : NaN;
    const lng = addr.longitude != null ? Number(addr.longitude) : NaN;
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 3. Resolve by addressId
  if ("addressId" in origin && origin.addressId != null) {
    const address = await db.address.findUnique({
      where: { id: BigInt(origin.addressId) },
      select: { latitude: true, longitude: true },
    });
    if (address && address.latitude != null && address.longitude != null) {
      return {
        latitude: Number(address.latitude.toString()),
        longitude: Number(address.longitude.toString()),
      };
    }
    return null;
  }

  // 4. Resolve by userId (checks customer address first, then worker address)
  if ("userId" in origin && origin.userId != null) {
    const user = await db.user.findUnique({
      where: { id: BigInt(origin.userId) },
      include: {
        customer: { include: { address: true } },
        worker: { include: { address: true } },
      },
    });

    const addr = user?.customer?.address || user?.worker?.address;
    if (addr && addr.latitude != null && addr.longitude != null) {
      return {
        latitude: Number(addr.latitude.toString()),
        longitude: Number(addr.longitude.toString()),
      };
    }
    return null;
  }

  // 5. Resolve by customerId
  if ("customerId" in origin && origin.customerId != null) {
    const customer = await db.customer.findUnique({
      where: { id: BigInt(origin.customerId) },
      include: { address: true },
    });
    if (customer?.address?.latitude != null && customer?.address?.longitude != null) {
      return {
        latitude: Number(customer.address.latitude.toString()),
        longitude: Number(customer.address.longitude.toString()),
      };
    }
    return null;
  }

  // 6. Resolve by workerId
  if ("workerId" in origin && origin.workerId != null) {
    const worker = await db.worker.findUnique({
      where: { id: BigInt(origin.workerId) },
      include: { address: true },
    });
    if (worker?.address?.latitude != null && worker?.address?.longitude != null) {
      return {
        latitude: Number(worker.address.latitude.toString()),
        longitude: Number(worker.address.longitude.toString()),
      };
    }
    return null;
  }

  return null;
}

/**
 * Modular in-memory filter and sorter for any array of items with coordinates.
 * Allows proximity filtering on any arbitrary dataset anywhere in the codebase.
 */
export function filterAndSortByDistance<T>(
  items: T[],
  origin: Coordinates,
  getCoords: (item: T) => Coordinates | null | undefined,
  options?: {
    radius?: number;
    unit?: DistanceUnit;
    sortByDistance?: "asc" | "desc" | false;
    limit?: number;
    offset?: number;
  }
): Array<T & { distance: number; unit: DistanceUnit; formattedDistance: string }> {
  const unit = options?.unit || "km";
  const radius = options?.radius;
  const sortDirection = options?.sortByDistance ?? "asc";

  const decorated: Array<T & { distance: number; unit: DistanceUnit; formattedDistance: string }> = [];

  for (const item of items) {
    const coords = getCoords(item);
    if (!coords || typeof coords.latitude !== "number" || typeof coords.longitude !== "number") {
      continue;
    }

    const distance = calculateDistance(origin, coords, unit);
    if (isNaN(distance)) continue;

    if (radius !== undefined && distance > radius) {
      continue;
    }

    decorated.push({
      ...item,
      distance,
      unit,
      formattedDistance: formatDistance(distance, unit),
    });
  }

  if (sortDirection === "asc") {
    decorated.sort((a, b) => a.distance - b.distance);
  } else if (sortDirection === "desc") {
    decorated.sort((a, b) => b.distance - a.distance);
  }

  const offset = options?.offset || 0;
  const limit = options?.limit;

  if (limit !== undefined) {
    return decorated.slice(offset, offset + limit);
  }

  return decorated.slice(offset);
}

/**
 * Searches and returns workers within a specified radius from an origin point.
 * Leverages MySQL index bounding box for high performance and precise Haversine distance filtering.
 */
export async function findNearbyWorkers(
  params: FindNearbyWorkersParams
): Promise<PaginatedNearbyResult<NearbyWorkerResult>> {
  const db = params.dbClient || prisma;
  const unit = params.unit || "km";
  const radius = Math.max(Number(params.radius) || 25, 0.1);
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 100);
  const sortBy = params.sortBy || "distance";
  const sortOrder = params.sortOrder || "asc";

  const originCoords = await resolveCoordinates(params.origin, db);
  if (!originCoords) {
    throw new Error(
      "Could not resolve origin coordinates. Please provide valid latitude/longitude, a valid addressId, or a user with a saved address."
    );
  }

  // 1. Calculate bounding box for fast database index pruning
  const bbox = getBoundingBox(originCoords, radius, unit);

  // 2. Build Prisma where conditions
  const andConditions: Prisma.WorkerWhereInput[] = [
    { deletedAt: null },
    {
      address: {
        latitude: {
          gte: bbox.minLat,
          lte: bbox.maxLat,
        },
        longitude: {
          gte: bbox.minLng,
          lte: bbox.maxLng,
        },
      },
    },
  ];

  if (params.isVerified !== undefined) {
    andConditions.push({ isVerified: params.isVerified });
  }

  if (params.minHourlyRate !== undefined) {
    andConditions.push({ hourlyRate: { gte: params.minHourlyRate } });
  }

  if (params.maxHourlyRate !== undefined) {
    andConditions.push({ hourlyRate: { lte: params.maxHourlyRate } });
  }

  if (params.city && params.city.trim() && !params.city.toLowerCase().includes("all")) {
    andConditions.push({
      address: {
        city: { contains: params.city.trim() },
      },
    });
  }

  if (params.query && params.query.trim()) {
    const q = params.query.trim();
    andConditions.push({
      OR: [
        { user: { name: { contains: q } } },
        { headline: { contains: q } },
        { bio: { contains: q } },
        {
          skills: {
            some: {
              skill: {
                OR: [{ name: { contains: q } }, { key: { contains: q } }],
              },
            },
          },
        },
        {
          services: {
            some: {
              serviceName: { contains: q },
            },
          },
        },
      ],
    });
  }

  if (params.skill && params.skill.trim() && params.skill.toLowerCase() !== "all") {
    const skillTokens = params.skill
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    andConditions.push({
      skills: {
        some: {
          skill: {
            OR: skillTokens.flatMap((s) => [
              { key: s },
              { key: { contains: s } },
              { name: { contains: s } },
              { name: { contains: s.replace(/_/g, " ") } },
            ]),
          },
        },
      },
    });
  }

  if (params.service && params.service.trim()) {
    andConditions.push({
      services: {
        some: {
          serviceName: { contains: params.service.trim() },
        },
      },
    });
  }
  // 3. Query candidate workers within the bounding box
  const candidateWorkers = await db.worker.findMany({
    where: { AND: andConditions },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          status: true,
        },
      },
      skills: {
        include: {
          skill: true,
        },
      },
      services: true,
      address: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });


  // 4. Calculate exact Haversine distance and filter within radius
  const matchingWorkers: NearbyWorkerResult[] = [];

  for (const w of candidateWorkers) {

    if (!w.address || w.address.latitude == null || w.address.longitude == null) {
  
      continue;
    }

    const workerCoords: Coordinates = {
      latitude: Number(w.address.latitude.toString()),
      longitude: Number(w.address.longitude.toString()),
    };



    const dist = calculateDistance(originCoords, workerCoords, unit);
    if (isNaN(dist) || dist > radius) {
  
      continue;
    }

    const reviewCount = w.reviews.length;
    const avgRating =
      reviewCount > 0
        ? w.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
        : 4.8;

    if (params.minRating !== undefined && avgRating < params.minRating) {
  
      continue;
    }
    matchingWorkers.push({
      id: w.id.toString(),
      userId: w.userId.toString(),
      name: w.user?.name || "Service Professional",
      email: w.user?.email,
      phone: w.user?.phone,
      profileImage: w.user?.profileImage || null,
      headline: w.headline || "Verified Service Professional",
      bio: w.bio || null,
      isVerified: w.isVerified,
      hourlyRate: w.hourlyRate ? Number(w.hourlyRate.toString()) : null,
      skills: w.skills.map((s) => s.skill.name),
      services: w.services.map((srv) => ({
        id: srv.id.toString(),
        name: srv.serviceName,
        price: srv.price ? Number(srv.price.toString()) : null,
      })),
      address: {
        id: w.address.id.toString(),
        city: w.address.city,
        state: w.address.state,
        country: w.address.country,
        address: w.address.address,
        latitude: workerCoords.latitude,
        longitude: workerCoords.longitude,
      },
      rating: Number(avgRating.toFixed(1)),
      reviewCount,
      distance: dist,
      unit,
      formattedDistance: formatDistance(dist, unit),
    });
  }

  // 5. Sort matching workers
  matchingWorkers.sort((a, b) => {
    if (sortBy === "distance") {
      return sortOrder === "desc" ? b.distance - a.distance : a.distance - b.distance;
    }
    if (sortBy === "price_low") {
      return (a.hourlyRate || 0) - (b.hourlyRate || 0);
    }
    if (sortBy === "price_high") {
      return (b.hourlyRate || 0) - (a.hourlyRate || 0);
    }
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return a.distance - b.distance;
  });
 
  // 6. Paginate results
  const total = matchingWorkers.length;
  const offset = (page - 1) * limit;
  const paginatedData = matchingWorkers.slice(offset, offset + limit);

  return {
    data: paginatedData,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    origin: originCoords,
    radius,
    unit,
  };
}

/**
 * Searches and returns jobs within a specified radius from an origin point.
 * Leverages MySQL index bounding box for high performance and precise Haversine distance filtering.
 */
export async function findNearbyJobs(
  params: FindNearbyJobsParams
): Promise<PaginatedNearbyResult<NearbyJobResult>> {
  const db = params.dbClient || prisma;
  const unit = params.unit || "km";
  const radius = Math.max(Number(params.radius) || 25, 0.1);
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 100);
  const sortBy = params.sortBy || "distance";
  const sortOrder = params.sortOrder || "asc";

  const originCoords = await resolveCoordinates(params.origin, db);
  if (!originCoords) {
    throw new Error(
      "Could not resolve origin coordinates. Please provide valid latitude/longitude, a valid addressId, or a user with a saved address."
    );
  }

  // 1. Calculate bounding box for fast database index pruning
  const bbox = getBoundingBox(originCoords, radius, unit);

  // 2. Build Prisma where conditions
  const andConditions: Prisma.JobWhereInput[] = [
    { deletedAt: null },
    {
      address: {
        latitude: {
          gte: bbox.minLat,
          lte: bbox.maxLat,
        },
        longitude: {
          gte: bbox.minLng,
          lte: bbox.maxLng,
        },
      },
    },
  ];

  if (params.status) {
    andConditions.push({ status: params.status });
  } else {
    andConditions.push({ status: "OPEN" });
  }

  if (params.serviceName && params.serviceName.trim()) {
    andConditions.push({
      serviceName: { contains: params.serviceName.trim() },
    });
  }

  if (params.minAmount !== undefined) {
    andConditions.push({
      OR: [
        { minAmount: { gte: params.minAmount } },
        { maxAmount: { gte: params.minAmount } },
      ],
    });
  }

  if (params.maxAmount !== undefined) {
    andConditions.push({
      minAmount: { lte: params.maxAmount },
    });
  }

  if (params.preferredDate) {
    const targetDate = new Date(params.preferredDate);
    andConditions.push({
      preferredDate: targetDate,
    });
  }

  if (params.query && params.query.trim()) {
    const q = params.query.trim();
    andConditions.push({
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { serviceName: { contains: q } },
      ],
    });
  }

  // 3. Query candidate jobs within the bounding box
  const candidateJobs = await db.job.findMany({
    where: { AND: andConditions },
    include: {
      address: true,
      customer: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // 4. Calculate exact Haversine distance and filter within radius
  const matchingJobs: NearbyJobResult[] = [];

  for (const j of candidateJobs) {
    if (!j.address || j.address.latitude == null || j.address.longitude == null) {
      continue;
    }

    const jobCoords: Coordinates = {
      latitude: Number(j.address.latitude.toString()),
      longitude: Number(j.address.longitude.toString()),
    };

    const dist = calculateDistance(originCoords, jobCoords, unit);
    if (isNaN(dist) || dist > radius) {
      continue;
    }

    let parsedSkills: string[] = [];
    if (Array.isArray(j.skills)) {
      parsedSkills = j.skills as string[];
    } else if (typeof j.skills === "string") {
      try {
        parsedSkills = JSON.parse(j.skills);
      } catch {
        parsedSkills = [j.skills];
      }
    }

    // Filter skill if specified
    if (params.skill && params.skill.trim()) {
      const targetSkill = params.skill.toLowerCase().trim();
      const hasSkill = parsedSkills.some((s) => s.toLowerCase().includes(targetSkill));
      if (!hasSkill) continue;
    }

    matchingJobs.push({
      id: j.id.toString(),
      title: j.title,
      description: j.description,
      serviceName: j.serviceName,
      customerId: j.customerId.toString(),
      customer: j.customer
        ? {
            id: j.customer.id.toString(),
            name: j.customer.user?.name || null,
            email: j.customer.user?.email || null,
          }
        : null,
      minAmount: j.minAmount != null ? Number(j.minAmount.toString()) : null,
      maxAmount: j.maxAmount != null ? Number(j.maxAmount.toString()) : null,
      currency: j.currency,
      preferredDate: j.preferredDate,
      preferredStartTime: j.preferredStartTime,
      preferredEndTime: j.preferredEndTime,
      applicationDeadline: j.applicationDeadline,
      requiredWorkers: j.requiredWorkers,
      assignedWorkerCount: j.assignedWorkerCount,
      staffingStatus: j.staffingStatus,
      status: j.status,
      skills: parsedSkills,
      address: {
        id: j.address.id.toString(),
        city: j.address.city,
        state: j.address.state,
        country: j.address.country,
        address: j.address.address,
        latitude: jobCoords.latitude,
        longitude: jobCoords.longitude,
      },
      distance: dist,
      unit,
      formattedDistance: formatDistance(dist, unit),
    });
  }

  // 5. Sort matching jobs
  matchingJobs.sort((a, b) => {
    if (sortBy === "distance") {
      return sortOrder === "desc" ? b.distance - a.distance : a.distance - b.distance;
    }
    if (sortBy === "budget_high") {
      return (b.maxAmount || 0) - (a.maxAmount || 0);
    }
    if (sortBy === "budget_low") {
      return (a.minAmount || 0) - (b.minAmount || 0);
    }
    return a.distance - b.distance;
  });

  // 6. Paginate results
  const total = matchingJobs.length;
  const offset = (page - 1) * limit;
  const paginatedData = matchingJobs.slice(offset, offset + limit);

  return {
    data: paginatedData,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    origin: originCoords,
    radius,
    unit,
  };
}

/**
 * Get direct distance between an origin and a specific worker's address.
 */
export async function getDistanceToWorker(
  origin: CoordinateOrigin,
  workerId: string | bigint | number,
  unit: DistanceUnit = "km",
  db = prisma
): Promise<{ distance: number; unit: DistanceUnit; formattedDistance: string } | null> {
  const originCoords = await resolveCoordinates(origin, db);
  if (!originCoords) return null;

  const targetCoords = await resolveCoordinates({ workerId }, db);
  if (!targetCoords) return null;

  const distance = calculateDistance(originCoords, targetCoords, unit);
  if (isNaN(distance)) return null;

  return {
    distance,
    unit,
    formattedDistance: formatDistance(distance, unit),
  };
}

/**
 * Get direct distance between an origin and a specific job's address.
 */
export async function getDistanceToJob(
  origin: CoordinateOrigin,
  jobId: string | bigint | number,
  unit: DistanceUnit = "km",
  db = prisma
): Promise<{ distance: number; unit: DistanceUnit; formattedDistance: string } | null> {
  const originCoords = await resolveCoordinates(origin, db);
  if (!originCoords) return null;

  const job = await db.job.findUnique({
    where: { id: BigInt(jobId) },
    include: { address: true },
  });

  if (!job?.address?.latitude || !job?.address?.longitude) {
    return null;
  }

  const jobCoords: Coordinates = {
    latitude: Number(job.address.latitude.toString()),
    longitude: Number(job.address.longitude.toString()),
  };

  const distance = calculateDistance(originCoords, jobCoords, unit);
  if (isNaN(distance)) return null;

  return {
    distance,
    unit,
    formattedDistance: formatDistance(distance, unit),
  };
}

/**
 * Unified modular GeoService object for easy import and dependency injection across the backend.
 */
export const geoService = {
  calculateDistance,
  isWithinRadius,
  getBoundingBox,
  formatDistance,
  isValidCoordinates,
  resolveCoordinates,
  filterAndSortByDistance,
  findNearbyWorkers,
  findNearbyJobs,
  getDistanceToWorker,
  getDistanceToJob,
};
