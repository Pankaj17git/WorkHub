import { prisma } from "@/lib/prisma";

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
   * Dispatch system or user alert
   */
  async notifyUser(
    userId: bigint,
    type: AppNotificationType,
    title: string,
    body: string,
    refType?: string,
    refId?: bigint
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        referenceType: refType,
        referenceId: refId,
      },
    });
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
   * Mark notification as read
   */
  async markAsRead(notificationId: bigint, userId: bigint) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  },
};
