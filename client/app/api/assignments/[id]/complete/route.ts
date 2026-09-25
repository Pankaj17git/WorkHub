import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { AssignmentStateService } from "@/services/assignment/assignmentState.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/assignments/{id}/complete:
 *   post:
 *     tags: [Assignments]
 *     summary: Worker marks assignment as completed
 *     description: Worker finishes the assigned work, transitioning status to COMPLETED.
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
 *         description: Assignment marked as completed
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getAuthActor(request);
    if (!actor || !actor.worker) {
      return apiResponse.forbidden("Only the assigned worker can complete an assignment");
    }

    const { id } = await params;
    const assignment = await AssignmentStateService.complete(actor, BigInt(id));

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
      "Assignment marked as COMPLETED"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete assignment";
    return apiResponse.badRequest(message);
  }
}
