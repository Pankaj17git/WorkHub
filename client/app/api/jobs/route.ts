/**
 * /api/jobs  —  Job CRUD Route
 *
 * POST  → Customer creates a new job posting (delegated to JobController.createJob)
 * GET   → Worker discovers nearby job openings with geo-based filtering & pagination.
 *          Mirrors the GET /api/workers pattern: authenticated user's address is
 *          resolved as origin, then findNearbyJobs returns paginated results
 *          filtered by skill, budget, status, distance radius, and sort.
 *          Falls back to basic marketplace listing when no auth/params present.
 */

import { JobController } from "@/controller/jobs/createJob.controller";
import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/apiResponse";
import { status as Status } from "@/constants/statusCodes";
import { createPaginatedResponse, getPagination } from "@/services/pagination.service";
import { findNearbyJobs, FindNearbyJobsParams } from "@/services/geo.service";
import { authMiddleware } from "@/middleware/auth.middleware";

/* ─── Allowed sort options for nearby-jobs (maps to FindNearbyJobsParams.sortBy) ─── */
const JOB_SORTS = ["distance", "budget_high", "budget_low", "recent"] as const;

/* ─── POST: Create Job (Customer only) ─────────────────────────────── */
export async function POST(request: NextRequest) {
  return JobController.createJob(request);
}

/* ─── GET: Discover Nearby Jobs (Worker Mode) ──────────────────────── */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  /* ── 1. If explicit lat/lng in query, delegate to geo controller ── */
  if (searchParams.has("lat") || searchParams.has("latitude")) {
    const { geoController } = await import("@/controller/geo.controller");
    return geoController.findNearbyJobs(request);
  }

  /* ── 2. Check for "mine" or simple listing without auth ────────── */
  const isMineQuery = searchParams.get("mine") === "true";
  const hasFilterParams =
    searchParams.has("skill") ||
    searchParams.has("distance") ||
    searchParams.has("status") ||
    searchParams.has("q") ||
    searchParams.has("sort") ||
    searchParams.has("page");

  /* ── 3. Authenticate the user (worker discovering nearby jobs) ─── */
  const userId = authMiddleware(request);

  /**
   * If neither authenticated nor providing filter params, fall back to
   * the basic marketplace listing (backward-compatible).
   */
  if ((!userId || typeof userId === "object") && !hasFilterParams) {
    return JobController.getjobs(request);
  }

  /**
   * If "mine" query is requested but we have no userId, fall back to
   * the basic controller which handles its own auth.
   */
  if (isMineQuery) {
    return JobController.getjobs(request);
  }

  /* ── 4. Parse filter query params ─────────────────────────────── */
  try {
    const skill       = searchParams.get("skill");
    const query       = searchParams.get("q");
    const statusParam = searchParams.get("status");
    const sortParam   = searchParams.get("sort");
    const pageParam   = searchParams.get("page");
    const limitParam  = searchParams.get("limit");
    const distParam   = searchParams.get("distance") || "25";
    const minAmount   = searchParams.get("minAmount");
    const maxAmount   = searchParams.get("maxAmount");
    const service     = searchParams.get("service");

    const { page, limit } = getPagination({
      page:  pageParam  ? Number(pageParam)  : undefined,
      limit: limitParam ? Number(limitParam) : 6,
    });

    /* Validate and resolve the sort option */
    const sortBy = (JOB_SORTS as readonly string[]).includes(sortParam ?? "")
      ? (sortParam as FindNearbyJobsParams["sortBy"])
      : "distance";

    /**
     * Resolve job status from filter param.
     * "ALL" means no status filter (pass undefined so all open/urgent jobs show).
     * Otherwise pass the exact status string (e.g. "OPEN", "URGENT").
     */
    let statusFilter: string | undefined;
    if (statusParam && statusParam !== "ALL") {
      statusFilter = statusParam;
    } else {
      statusFilter = "OPEN";
    }

    /* ── 5. Call the geo service to find nearby jobs ─────────────── */
    const result = await findNearbyJobs({
      origin:      { userId: userId! },
      page,
      limit,
      skill:       skill       || undefined,
      query:       query       || undefined,
      serviceName: service     || undefined,
      status:      statusFilter,
      minAmount:   minAmount   ? Number(minAmount) : undefined,
      maxAmount:   maxAmount   ? Number(maxAmount) : undefined,
      radius:      Number(distParam),
      unit:        "km",
      sortBy,
    });

    /* ── 6. Shape response to match the frontend expectations ───── */
    const jobs = result.data.map((j) => ({
      ...j, // includes distance, unit, formattedDistance, skills, address, customer
    }));

    const response = createPaginatedResponse(jobs, result.meta.total, page, limit);

    return apiResponse.success(
      {
        ...response,
        radius: result.radius,
        unit:   result.unit,
      },
      Status.OK,
    );
  } catch (error) {
    console.error("Failed to list jobs:", error);
    const message = error instanceof Error ? error.message : "Failed to list jobs";
    return apiResponse.internalError(message);
  }
}
