import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/apiResponse";
import { status as Status } from "@/constants/statusCodes";
import { createPaginatedResponse, getPagination } from "@/services/pagination.service";
import { findNearbyWorkers, FindNearbyWorkersParams } from "@/services/geo.service";
import { authMiddleware } from "@/middleware/auth.middleware";
import { Prisma } from "@/generated/prisma/client";

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
    const isAuthenticated = userId && typeof userId !== "object";

    const { page, limit } = getPagination({
      page: pageParam ? Number(pageParam) : undefined,
      limit: limitParam ? Number(limitParam) : 6,
    });

    // ── Unauthenticated: use city-based listing (no geo distance needed) ──
    if (!isAuthenticated) {
      const { prisma } = await import("@/lib/prisma");

      // Build where conditions
      const andConditions: Prisma.WorkerWhereInput[] = [{ deletedAt: null }];

      if (city && city.trim() && !city.toLowerCase().includes("all")) {
        andConditions.push({ address: { city: { contains: city.trim() } } });
      }

      if (skill) {
        const skills = skill
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (skills.length > 0) {
          andConditions.push({
            skills: {
              some: {
                skill: {
                  OR: skills.map((s) => ({
                    OR: [{ name: { contains: s } }, { key: { contains: s } }],
                  })),
                },
              },
            },
          });
        }
      }

      if (query && query.trim()) {
        const q = query.trim();
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
          ],
        });
      }

      const [total, rawWorkers] = await Promise.all([
        prisma.worker.count({ where: { AND: andConditions } }),
        prisma.worker.findMany({
          where: { AND: andConditions },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                profileImage: true,
              },
            },
            address: true,
            skills: { include: { skill: true } },
            services: true,
            reviews: { select: { rating: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const workers = rawWorkers.map((w) => ({
        id: String(w.id),
        userId: String(w.userId),
        name: w.user.name,
        email: w.user.email,
        phone: w.user.phone,
        profileImage:
          w.user.profileImage ||
          "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
        headline: w.headline,
        bio:
          w.bio ||
          "Experienced specialist offering top-rated home and maintenance services.",
        isVerified: w.isVerified,
        hourlyRate: w.hourlyRate ? Number(w.hourlyRate) : 299,
        skills: w.skills.map((sk) => sk.skill.name),
        services: w.services.map((s) => ({
          id: String(s.id),
          name: s.serviceName,
          price: s.price ? Number(s.price) : 299,
        })),
        address: w.address
          ? {
              city: w.address.city,
              state: w.address.state,
              country: w.address.country,
              address: w.address.address,
            }
          : null,
        rating:
          w.reviews.length > 0
            ? w.reviews.reduce((sum, r) => sum + r.rating, 0) / w.reviews.length
            : 4.8,
        reviewCount: w.reviews.length,
        distance: 0,
        unit: "km",
        formattedDistance: city ? `in ${city}` : "Across all areas",
      }));

      const response = createPaginatedResponse(workers, total, page, limit);
      return apiResponse.success({ ...response }, Status.OK);
    }

    // ── Authenticated: full geo distance search ──
    const sortBy = (SORTS as readonly string[]).includes(sort ?? "")
      ? (sort as FindNearbyWorkersParams["sortBy"])
      : "distance";

    const result = await findNearbyWorkers({
      origin: { userId: String(userId) },
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
      ...w,
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