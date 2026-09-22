import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { NotificationService } from "@/services/notification/notification.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notifications
 *     description: Retrieves in-app notifications for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Set to true to retrieve only unread notifications
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function GET(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await NotificationService.getUserNotifications(actor.userId, unreadOnly);

    return apiResponse.success(
      {
        notifications: notifications.map((n) => ({
          ...n,
          id: n.id.toString(),
          userId: n.userId.toString(),
          referenceId: n.referenceId?.toString(),
        })),
      },
      Status.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch notifications";
    return apiResponse.internalError(message);
  }
}
