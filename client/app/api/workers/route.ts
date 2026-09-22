import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/apiResponse";
import { status as Status } from "@/constants/statusCodes";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const service = searchParams.get("service");
    const query = searchParams.get("q");

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (skill) {
      where.skills = {
        some: {
          name: { contains: skill },
        },
      };
    }

    if (service) {
      where.services = {
        some: {
          serviceName: { contains: service },
        },
      };
    }

    const workers = await prisma.worker.findMany({
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
        skills: true,
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
      orderBy: { createdAt: "desc" },
    });

    const serializedWorkers = workers
      .map((w) => {
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
          skills: w.skills.map((s) => s.name),
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
      })
      .filter((w) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          w.name.toLowerCase().includes(q) ||
          w.headline.toLowerCase().includes(q) ||
          w.bio.toLowerCase().includes(q) ||
          w.skills.some((s) => s.toLowerCase().includes(q))
        );
      });

    return apiResponse.success({ workers: serializedWorkers }, Status.OK);
  } catch (error) {
    console.error("Failed to list workers:", error);
    const message = error instanceof Error ? error.message : "Failed to list workers";
    return apiResponse.internalError(message);
  }
}
