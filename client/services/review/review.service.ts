import { prisma } from "@/lib/prisma";
import { AuthActor } from "@/lib/authActor";

export const ReviewService = {
  /**
   * Customer submits review for a completed worker assignment
   */
  async createReview(
    actor: AuthActor,
    input: {
      assignmentId: bigint;
      rating: number;
      comment?: string;
    }
  ) {
    if (!actor.customer) {
      throw new Error("Only customers can submit reviews");
    }

    if (input.rating < 1 || input.rating > 5) {
      throw new Error("Rating must be between 1 and 5 stars");
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: input.assignmentId },
      include: { review: true },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (assignment.customerId !== actor.customer.id && actor.role !== "ADMIN") {
      throw new Error("You can only review assignments for jobs you requested");
    }

    if (assignment.status !== "COMPLETED") {
      throw new Error(`Cannot review an assignment that has not been completed (current status: ${assignment.status})`);
    }

    if (assignment.review) {
      throw new Error("A review has already been submitted for this assignment");
    }

    return prisma.review.create({
      data: {
        assignmentId: assignment.id,
        customerId: actor.customer.id,
        workerId: assignment.workerId,
        rating: input.rating,
        comment: input.comment,
      },
      include: {
        worker: {
          include: {
            user: { select: { name: true, profileImage: true } },
          },
        },
      },
    });
  },

  /**
   * Get reviews for a worker
   */
  async getWorkerReviews(workerId: bigint) {
    return prisma.review.findMany({
      where: { workerId },
      include: {
        customer: {
          include: {
            user: { select: { name: true, profileImage: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
