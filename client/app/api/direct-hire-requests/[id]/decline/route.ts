import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { DirectHireService } from "@/services/directHire/directHire.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/direct-hire-requests/{id}/decline:
 *   post:
 *     tags: [Direct Hire]
 *     summary: Worker declines direct hire request
 *     description: Worker declines a direct hire request.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Direct hire request ID
 *     responses:
 *       200:
 *         description: Direct hire request declined
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
      return apiResponse.forbidden("Only workers can decline direct hire requests");
    }

    const { id } = await params;
    const req = await DirectHireService.declineDirectHire(actor, BigInt(id));

    return apiResponse.success({ request: { id: req.id.toString(), status: req.status } }, Status.OK);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decline direct hire request";
    return apiResponse.badRequest(message);
  }
}
