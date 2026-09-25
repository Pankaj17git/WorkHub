import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/apiResponse";
import { status as Status } from "@/constants/statusCodes";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerId = BigInt(id);

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
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
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    name: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!worker || worker.deletedAt !== null) {
      return apiResponse.notFound("Worker not found");
    }

    const ratingCount = worker.reviews.length;
    const avgRating =
      ratingCount > 0
        ? worker.reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount
        : 4.9;

    const serializedWorker = {
      id: worker.id.toString(),
      userId: worker.userId.toString(),
      name: worker.user.name || "Specialist",
      email: worker.user.email,
      phone: worker.user.phone,
      profileImage:
        worker.user.profileImage ||
        "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
      headline: worker.headline || "Verified Service Professional",
      bio: worker.bio || "Experienced specialist offering top-rated home and maintenance services.",
      portfolio: worker.portfolio,
      isVerified: worker.isVerified,
      hourlyRate: worker.hourlyRate ? Number(worker.hourlyRate.toString()) : 299,
      skills: worker.skills.map((s) => s.name),
      services: worker.services.map((srv) => ({
        id: srv.id.toString(),
        name: srv.serviceName,
        price: srv.price ? Number(srv.price.toString()) : 299,
      })),
      address: worker.address
        ? {
            city: worker.address.city,
            state: worker.address.state,
            country: worker.address.country,
            address: worker.address.address,
          }
        : null,
      rating: Number(avgRating.toFixed(1)),
      reviewCount: ratingCount,
      reviews: worker.reviews.map((r) => ({
        id: r.id.toString(),
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        customerName: r.customer?.user?.name || "Customer",
        customerAvatar: r.customer?.user?.profileImage || null,
      })),
    };

    return apiResponse.success({ worker: serializedWorker }, Status.OK);
  } catch (error) {
    console.error("Failed to fetch worker details:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch worker details";
    return apiResponse.internalError(message);
  }
}
