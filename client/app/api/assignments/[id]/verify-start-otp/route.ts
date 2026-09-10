import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { AssignmentStateService } from "@/services/assignment/assignmentState.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/assignments/{id}/verify-start-otp:
 *   post:
 *     tags: [Assignments]
 *     summary: Worker verifies doorstep OTP and starts work
 *     description: Worker submits customer doorstep OTP. Upon validation, assignment transitions to IN_PROGRESS.
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyStartOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified, work started
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
      return apiResponse.forbidden("Only the assigned worker can verify OTP to start work");
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.otp) {
      return apiResponse.badRequest("OTP is required");
    }

    const assignment = await AssignmentStateService.verifyStartOtp(actor, BigInt(id), body.otp);

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
      "OTP verified successfully. Work is now IN_PROGRESS."
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify start OTP";
    return apiResponse.badRequest(message);
  }
}
