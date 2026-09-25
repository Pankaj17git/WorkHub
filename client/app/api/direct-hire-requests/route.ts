import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { DirectHireService } from "@/services/directHire/directHire.service";
import { prisma } from "@/lib/prisma";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/direct-hire-requests:
 *   post:
 *     tags: [Direct Hire]
 *     summary: Customer creates direct hire request
 *     description: Customer sends a direct hire request with requested time slot, proposed price, and service details.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDirectHireRequest'
 *     responses:
 *       201:
 *         description: Direct hire request sent
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
    if (!actor || !actor.customer) {
      return apiResponse.forbidden("Only customers can send direct hire requests");
    }

    const body = await request.json();
    const req = await DirectHireService.createDirectHireRequest(actor, {
      workerId: BigInt(body.workerId),
      serviceName: body.serviceName,
      requestedDate: body.requestedDate,
      requestedStartTime: body.requestedStartTime,
      requestedEndTime: body.requestedEndTime,
      customerMessage: body.customerMessage,
      proposedPrice: body.proposedPrice ? Number(body.proposedPrice) : undefined,
      address: body.address,
    });

    return apiResponse.success(
      {
        request: {
          ...req,
          id: req.id.toString(),
          customerId: req.customerId.toString(),
          workerId: req.workerId.toString(),
          addressId: req.addressId?.toString(),
          proposedPrice: req.proposedPrice ? req.proposedPrice.toString() : null,
        },
      },
      Status.CREATED,
      "Direct hire request sent"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create direct hire request";
    return apiResponse.badRequest(message);
  }
}

/**
 * @swagger
 * /api/direct-hire-requests:
 *   get:
 *     tags: [Direct Hire]
 *     summary: List direct hire requests
 *     description: Returns all direct hire requests for the authenticated user (either customer or worker).
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of direct hire requests
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function GET(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const requests = await prisma.directHireRequest.findMany({
      where: {
        OR: [
          actor.worker ? { workerId: actor.worker.id } : {},
          actor.customer ? { customerId: actor.customer.id } : {},
        ],
      },
      include: {
        worker: {
          include: {
            user: { select: { name: true, email: true, profileImage: true } },
            skills: true,
          },
        },
        customer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return apiResponse.success(
      {
        requests: requests.map((r) => ({
          ...r,
          id: r.id.toString(),
          customerId: r.customerId.toString(),
          workerId: r.workerId.toString(),
          addressId: r.addressId?.toString(),
          proposedPrice: r.proposedPrice ? r.proposedPrice.toString() : null,
        })),
      },
      Status.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch direct hire requests";
    return apiResponse.internalError(message);
  }
}
