import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { status as Status } from "@/constants/statusCodes";
import { createPaginatedResponse, getPagination } from "@/services/pagination.service";

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
    const { page, limit, offset } = getPagination({
      page: pageParam ? Number(pageParam) : undefined,
      limit: limitParam ? Number(limitParam) : 6,
    });

    const andConditions: Prisma.WorkerWhereInput[] = [{ deletedAt: null }];

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
                  OR: [
                    { name: { contains: q } },
                    { key: { contains: q } },
                  ],
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

    if (skill && skill.trim() && skill.toLowerCase() !== "all") {
      const skillTokens = skill
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

    if (service && service.trim()) {
      andConditions.push({
        services: {
          some: {
            serviceName: { contains: service.trim() },
          },
        },
      });
    }

    if (city && city.trim() && !city.toLowerCase().includes("all")) {
      andConditions.push({
        address: {
          city: { contains: city.trim() },
        },
      });
    }

    const where = { AND: andConditions };

    let orderBy: Prisma.WorkerOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_low") {
      orderBy = { hourlyRate: "asc" };
    } else if (sort === "price_high") {
      orderBy = { hourlyRate: "desc" };
    } else if (sort === "recent") {
      orderBy = { createdAt: "desc" };
    }

    const [workers, total] = await Promise.all([
      prisma.worker.findMany({
        where,
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
              comment: true,
              createdAt: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),

      prisma.worker.count({
        where,
      }),
    ]);

    const serializedWorkers = workers.map((w) => {
      const ratingCount = w.reviews.length;
      const avgRating =
        ratingCount > 0
          ? w.reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount
          : 4.8; // default benchmark rating

      return {
        id: w.id.toString(),
        userId: w.userId.toString(),
        name: w.user.name || "Specialist",
        email: w.user.email,
        phone: w.user.phone,
        profileImage:
          w.user.profileImage ||
          "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
        headline: w.headline || "Verified Service Professional",
        bio: w.bio || "Experienced specialist offering top-rated home and maintenance services.",
        isVerified: w.isVerified,
        hourlyRate: w.hourlyRate ? Number(w.hourlyRate.toString()) : 299,
        skills: w.skills.map((s) => s.skill.name),
        services: w.services.map((srv) => ({
          id: srv.id.toString(),
          name: srv.serviceName,
          price: srv.price ? Number(srv.price.toString()) : 299,
        })),
        address: w.address
          ? {
              city: w.address.city,
              state: w.address.state,
              country: w.address.country,
              address: w.address.address,
            }
          : null,
        rating: Number(avgRating.toFixed(1)),
        reviewCount: ratingCount || 12,
      };
    });

    const response = createPaginatedResponse(serializedWorkers, total, page, limit);

    return apiResponse.success(
      {
        ...response
      },
      Status.OK
    );
  } catch (error) {
    console.error("Failed to list workers:", error);
    const message = error instanceof Error ? error.message : "Failed to list workers";
    return apiResponse.internalError(message);
  }
}
