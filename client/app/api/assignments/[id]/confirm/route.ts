import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { AssignmentStateService } from "@/services/assignment/assignmentState.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/assignments/{id}/confirm:
 *   post:
 *     tags: [Assignments]
 *     summary: Worker confirms assignment
 *     description: Worker confirms their assignment to a job, transitioning state to CONFIRMED.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Assignment confirmed
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
    const assignment = await AssignmentStateService.confirm(actor, BigInt(id));

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
      "Assignment confirmed"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm assignment";
    return apiResponse.badRequest(message);
  }
}
