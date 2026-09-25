import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { TeamInvitationService } from "@/services/worker/teamInvitation.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/team-invitations/{id}/decline:
 *   post:
 *     tags: [Team Invitations]
 *     summary: Worker declines team invitation
 *     description: Invited worker declines a team invitation.
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
 *         description: Team invitation declined
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
      return apiResponse.forbidden("Only workers can decline team invitations");
    }

    const { id } = await params;
    const inv = await TeamInvitationService.declineInvitation(actor, BigInt(id));

    return apiResponse.success({ invitation: { id: inv.id.toString(), status: inv.status } }, Status.OK);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decline team invitation";
    return apiResponse.badRequest(message);
  }
}
