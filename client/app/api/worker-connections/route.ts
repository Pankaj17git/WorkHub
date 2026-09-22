import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { WorkerConnectionService } from "@/services/worker/connection.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/worker-connections:
 *   post:
 *     tags: [Worker Connections]
 *     summary: Send connection request to another worker
 *     description: Worker sends a professional connection request to another registered worker.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendConnectionRequest'
 *     responses:
 *       201:
 *         description: Connection request sent
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor || !actor.worker) {
      return apiResponse.forbidden("Only workers can send connection requests");
    }

    const body = await request.json();
    if (!body.targetWorkerId) {
      return apiResponse.badRequest("targetWorkerId is required");
    }

    const connection = await WorkerConnectionService.sendConnectionRequest(
      actor,
      BigInt(body.targetWorkerId)
    );

    return apiResponse.success(
      {
        connection: {
          ...connection,
          id: connection.id.toString(),
          workerId: connection.workerId.toString(),
          connectedWorkerId: connection.connectedWorkerId.toString(),
        },
      },
      Status.CREATED,
      "Connection request sent"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send connection request";
    return apiResponse.badRequest(message);
  }
}

/**
 * @swagger
 * /api/worker-connections:
 *   get:
 *     tags: [Worker Connections]
 *     summary: List worker connections
 *     description: Returns the authenticated worker's connections (pending or accepted).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED]
 *           default: ACCEPTED
 *         description: Connection status filter
 *     responses:
 *       200:
 *         description: List of worker connections
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function GET(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor || !actor.worker) {
      return apiResponse.forbidden("Only workers can view worker connections");
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") === "PENDING" ? "PENDING" : "ACCEPTED";

    const connections = await WorkerConnectionService.getMyConnections(actor, status);
    return apiResponse.success({ connections }, Status.OK);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch connections";
    return apiResponse.badRequest(message);
  }
}
