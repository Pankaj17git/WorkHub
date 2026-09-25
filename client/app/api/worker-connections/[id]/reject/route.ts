import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { WorkerConnectionService } from "@/services/worker/connection.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/worker-connections/{id}/reject:
 *   post:
 *     tags: [Worker Connections]
 *     summary: Reject connection request
 *     description: Worker rejects an incoming connection request from another worker.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection ID
 *     responses:
 *       200:
 *         description: Connection request rejected
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
    if (!actor || !actor.worker) return apiResponse.forbidden("Only workers can reject connections");

    const { id } = await params;
    const conn = await WorkerConnectionService.rejectConnection(actor, BigInt(id));

    return apiResponse.success({ connection: { id: conn.id.toString(), status: conn.status } }, Status.OK);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject connection";
    return apiResponse.badRequest(message);
  }
}
