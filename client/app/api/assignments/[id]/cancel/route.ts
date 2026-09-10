import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { AssignmentStateService } from "@/services/assignment/assignmentState.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/assignments/{id}/cancel:
 *   post:
 *     tags: [Assignments]
 *     summary: Cancel assignment
 *     description: Customer or worker cancels an assignment, transitioning status to CANCELLED.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelAssignmentRequest'
 *     responses:
 *       200:
 *         description: Assignment cancelled
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const assignment = await AssignmentStateService.cancel(actor, BigInt(id), body.reason);

    return apiResponse.success(
      {
        assignment: {
          ...assignment,
          id: assignment.id.toString(),
          jobId: assignment.jobId?.toString(),
          customerId: assignment.customerId.toString(),
          workerId: assignment.workerId.toString(),
        },
      },
      Status.OK,
      "Assignment cancelled"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel assignment";
    return apiResponse.badRequest(message);
  }
}
