import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { NotificationService } from "@/services/notification/notification.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const { id } = await params;
    await NotificationService.markAsRead(BigInt(id), actor.userId);

    return apiResponse.success({ markedRead: true }, Status.OK);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark notification as read";
    return apiResponse.badRequest(message);
  }
}
