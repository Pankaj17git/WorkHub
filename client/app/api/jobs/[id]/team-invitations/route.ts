import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { TeamInvitationService } from "@/services/worker/teamInvitation.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/jobs/{id}/team-invitations:
 *   post:
 *     tags: [Team Invitations]
 *     summary: Send team invitation for job
 *     description: Worker assigned to a job invites another worker to join the job team.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeamInvitationRequest'
 *     responses:
 *       201:
 *         description: Team invitation sent successfully
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
      return apiResponse.forbidden("Only workers can send team invitations");
    }

    const { id: jobIdStr } = await params;
    const body = await request.json();

    if (!body.invitedWorkerId) {
      return apiResponse.badRequest("invitedWorkerId is required");
    }

    const invite = await TeamInvitationService.createInvitation(
      actor,
      BigInt(jobIdStr),
      BigInt(body.invitedWorkerId)
    );

    return apiResponse.success(
      {
        invitation: {
          ...invite,
          id: invite.id.toString(),
          jobId: invite.jobId.toString(),
          inviterWorkerId: invite.inviterWorkerId.toString(),
          invitedWorkerId: invite.invitedWorkerId.toString(),
        },
      },
      Status.CREATED,
      "Team invitation sent"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create team invitation";
    return apiResponse.badRequest(message);
  }
}
