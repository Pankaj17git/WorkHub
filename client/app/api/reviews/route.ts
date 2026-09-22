import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { ReviewService } from "@/services/review/review.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Submit customer review
 *     description: Customer submits a rating and feedback review for a completed assignment.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewRequest'
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor || !actor.customer) {
      return apiResponse.forbidden("Only customers can submit reviews");
    }

    const body = await request.json();
    if (!body.assignmentId || !body.rating) {
      return apiResponse.badRequest("assignmentId and rating are required");
    }

    const review = await ReviewService.createReview(actor, {
      assignmentId: BigInt(body.assignmentId),
      rating: Number(body.rating),
      comment: body.comment,
    });

    return apiResponse.success(
      {
        review: {
          ...review,
          id: review.id.toString(),
          assignmentId: review.assignmentId.toString(),
          customerId: review.customerId.toString(),
          workerId: review.workerId.toString(),
        },
      },
      Status.CREATED,
      "Review submitted successfully"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    return apiResponse.badRequest(message);
  }
}

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a worker
 *     description: Retrieves all customer reviews and ratings for a given worker ID.
 *     parameters:
 *       - in: query
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: List of reviews
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId");

    if (!workerId) {
      return apiResponse.badRequest("workerId query parameter is required");
    }

    const reviews = await ReviewService.getWorkerReviews(BigInt(workerId));

    return apiResponse.success(
      {
        reviews: reviews.map((r) => ({
          ...r,
          id: r.id.toString(),
          assignmentId: r.assignmentId.toString(),
          customerId: r.customerId.toString(),
          workerId: r.workerId.toString(),
        })),
      },
      Status.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reviews";
    return apiResponse.internalError(message);
  }
}
