import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { DirectHireService } from "@/services/directHire/directHire.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/direct-hire-requests/{id}/accept:
 *   post:
 *     tags: [Direct Hire]
 *     summary: Worker accepts direct hire request
 *     description: Worker accepts direct hire, automatically creating a confirmed assignment.
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
 *         description: Direct hire accepted and assignment confirmed
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
      return apiResponse.forbidden("Only workers can accept direct hire requests");
    }

    const { id } = await params;
    const result = await DirectHireService.acceptDirectHire(actor, BigInt(id));

    return apiResponse.success(
      {
        assignment: {
          ...result.assignment,
          id: result.assignment.id.toString(),
          customerId: result.assignment.customerId.toString(),
          workerId: result.assignment.workerId.toString(),
          directHireRequestId: result.assignment.directHireRequestId?.toString(),
        },
      },
      Status.OK,
      "Direct hire accepted and assignment confirmed"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept direct hire request";
    return apiResponse.badRequest(message);
  }
}
