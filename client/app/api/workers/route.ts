import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/apiResponse";
import { status as Status } from "@/constants/statusCodes";
import { createPaginatedResponse, getPagination } from "@/services/pagination.service";
import { findNearbyWorkers, FindNearbyWorkersParams } from "@/services/geo.service";
import { authMiddleware } from "@/middleware/auth.middleware";

const SORTS = ["distance", "price_low", "price_high", "rating", "recent"] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const service = searchParams.get("service");
    const query = searchParams.get("q");
    const city = searchParams.get("city");
    const sort = searchParams.get("sort");
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const distanceParam = searchParams.get("distance") || 50;

    const userId = authMiddleware(request);
    if (!userId || typeof userId === "object") {
      return apiResponse.unauthorized();
    }

    const { page, limit } = getPagination({
      page: pageParam ? Number(pageParam) : undefined,
      limit: limitParam ? Number(limitParam) : 6,
    });

    const sortBy = (SORTS as readonly string[]).includes(sort ?? "")
      ? (sort as FindNearbyWorkersParams["sortBy"])
      : "distance";

    const result = await findNearbyWorkers({
      origin: { userId },
      page,
      limit,
      skill,
      service,
      query,
      city,
      radius: Number(distanceParam),
      unit: "km",
      sortBy,
    });

    const workers = result.data.map((w) => ({
      ...w, // includes distance, unit, formattedDistance, rating, reviewCount
      profileImage:
        w.profileImage ||
        "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
      bio:
        w.bio ||
        "Experienced specialist offering top-rated home and maintenance services.",
      hourlyRate: w.hourlyRate ?? 299,
      services: w.services.map((s) => ({ ...s, price: s.price ?? 299 })),
      address: w.address && {
        city: w.address.city,
        state: w.address.state,
        country: w.address.country,
        address: w.address.address,
      },
    }));

    const response = createPaginatedResponse(workers, result.meta.total, page, limit);

    return apiResponse.success(
      {
        ...response,
        radius: result.radius,
        unit: result.unit,
      },
      Status.OK
    );
  } catch (error) {
    console.error("Failed to list workers:", error);
    const message = error instanceof Error ? error.message : "Failed to list workers";
    return apiResponse.internalError(message);
  }
}