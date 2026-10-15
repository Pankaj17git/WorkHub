import { prisma } from "@/lib/prisma";
import { emitToUser } from "../chat/socket.service";

export type AppNotificationType =
  | "JOB_APPLICATION_SUBMITTED"
  | "JOB_APPLICATION_SELECTED"
  | "JOB_APPLICATION_REJECTED"
  | "DIRECT_HIRE_REQUESTED"
  | "DIRECT_HIRE_ACCEPTED"
  | "DIRECT_HIRE_DECLINED"
  | "TEAM_INVITATION_RECEIVED"
  | "TEAM_INVITATION_ACCEPTED"
  | "TEAM_INVITATION_DECLINED"
  | "STAFFING_REQUEST_CREATED"
  | "STAFFING_REQUEST_APPROVED"
  | "STAFFING_REQUEST_REJECTED"
  | "ASSIGNMENT_CONFIRMED"
  | "ASSIGNMENT_ON_THE_WAY"
  | "ASSIGNMENT_ARRIVED"
  | "ASSIGNMENT_STARTED"
  | "ASSIGNMENT_COMPLETED"
  | "ASSIGNMENT_CANCELLED"
  | "NEW_MESSAGE"
  | "NEW_REVIEW";

export const NotificationService = {
  /**
   * Dispatch system or user alert and broadcast real-time via Socket
   */
  async notifyUser(
    userId: bigint,
    type: AppNotificationType,
    title: string,
    body: string,
    refType?: string,
    refId?: bigint
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        referenceType: refType,
        referenceId: refId,
      },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    const formatted = {
      id: notification.id.toString(),
      userId: notification.userId.toString(),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      message: notification.body, // compatibility with frontend components expecting message
      referenceType: notification.referenceType,
      referenceId: notification.referenceId ? notification.referenceId.toString() : null,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    };

    // Broadcast in real-time to the recipient's socket room
    emitToUser(userId, "notification:new", formatted);
    emitToUser(userId, "notification:count", { unreadCount });

    return notification;
  },

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: bigint, unreadOnly: boolean = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: bigint) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: bigint, userId: bigint) {
    const res = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    emitToUser(userId, "notification:read", { id: notificationId.toString() });
    emitToUser(userId, "notification:count", { unreadCount });

    return { success: true, count: res.count, unreadCount };
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: bigint) {
    const res = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    emitToUser(userId, "notification:allRead", {});
    emitToUser(userId, "notification:count", { unreadCount: 0 });

    return { success: true, count: res.count, unreadCount: 0 };
  },
};
