import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { TeamInvitationService } from "@/services/worker/teamInvitation.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/team-invitations/{id}/accept:
 *   post:
 *     tags: [Team Invitations]
 *     summary: Worker accepts team invitation
 *     description: Invited worker accepts team invitation, creating a confirmed assignment for the job.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation ID
 *     responses:
 *       200:
 *         description: Team invitation accepted and assignment created
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
      return apiResponse.forbidden("Only workers can accept team invitations");
    }

    const { id } = await params;
    const result = await TeamInvitationService.acceptInvitation(actor, BigInt(id));

    return apiResponse.success(
      {
        assignment: {
          ...result.assignment,
          id: result.assignment.id.toString(),
          jobId: result.assignment.jobId?.toString(),
          customerId: result.assignment.customerId.toString(),
          workerId: result.assignment.workerId.toString(),
        },
        staffingStatus: result.staffingStatus,
      },
      Status.OK,
      "Team invitation accepted and assignment created"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept team invitation";
    return apiResponse.badRequest(message);
  }
}
