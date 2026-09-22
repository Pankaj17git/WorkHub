import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { AssignmentStateService } from "@/services/assignment/assignmentState.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/assignments/{id}/doorstep-otp:
 *   get:
 *     tags: [Assignments]
 *     summary: Customer retrieves doorstep start OTP
 *     description: Customer fetches the secure doorstep OTP generated upon worker arrival, to share with the worker in person.
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
 *         description: Doorstep OTP retrieved
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getAuthActor(request);
    if (!actor || !actor.customer) {
      return apiResponse.forbidden("Only the customer can view the doorstep start OTP");
    }

    const { id } = await params;
    const otpData = await AssignmentStateService.getDoorstepOtp(actor, BigInt(id));

    return apiResponse.success(otpData, Status.OK);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve doorstep OTP";
    return apiResponse.badRequest(message);
  }
}
