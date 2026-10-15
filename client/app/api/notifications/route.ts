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
    const unreadCount = await NotificationService.getUnreadCount(actor.userId);

    return apiResponse.success(
      {
        unreadCount,
        notifications: notifications.map((n) => ({
          ...n,
          id: n.id.toString(),
          userId: n.userId.toString(),
          message: n.body, // frontend compatibility
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

/**
 * PATCH /api/notifications
 * Mark all notifications as read for current user
 */
export async function PATCH(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const result = await NotificationService.markAllAsRead(actor.userId);
    return apiResponse.success(result, Status.OK, "All notifications marked as read");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark all as read";
    return apiResponse.badRequest(message);
  }
}

/**
 * POST /api/notifications
 * Create custom or test notification (also used for live testing)
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const body = await request.json();
    const type = body.type || "ASSIGNMENT_CONFIRMED";
    const title = body.title || "Live Test Alert";
    const content = body.body || body.message || "This is a real-time socket notification test!";
    const targetUserId = body.targetUserId ? BigInt(body.targetUserId) : actor.userId;

    const notif = await NotificationService.notifyUser(
      targetUserId,
      type,
      title,
      content,
      body.referenceType,
      body.referenceId ? BigInt(body.referenceId) : undefined
    );

    return apiResponse.success(
      {
        id: notif.id.toString(),
        userId: notif.userId.toString(),
        type: notif.type,
        title: notif.title,
        body: notif.body,
      },
      Status.CREATED,
      "Notification sent via socket"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send notification";
    return apiResponse.badRequest(message);
  }
}

