import { prisma } from "@/lib/prisma";
import { AuthActor } from "@/lib/authActor";

export const MessagingService = {
  /**
   * Get or create a direct conversation between two users
   */
  async getOrCreateDirectConversation(actor: AuthActor, targetUserId: bigint) {
    const myUserId = actor.userId;
    if (myUserId === targetUserId) throw new Error("Cannot message yourself");

    // Look for existing direct conversation where both are members
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        AND: [
          { members: { some: { userId: myUserId } } },
          { members: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
      },
    });

    if (existing) return existing;

    return prisma.conversation.create({
      data: {
        type: "DIRECT",
        members: {
          create: [{ userId: myUserId }, { userId: targetUserId }],
        },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
      },
    });
  },

  /**
   * Get or create job group conversation for all assigned workers and the customer
   */
  async getOrCreateJobGroupConversation(jobId: bigint) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: true,
        assignments: {
          where: { status: { in: ["ASSIGNED", "CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"] } },
          include: { worker: true },
        },
      },
    });

    if (!job) throw new Error("Job not found");

    const existing = await prisma.conversation.findFirst({
      where: { jobId, type: "JOB_GROUP" },
      include: {
        members: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
      },
    });

    // Collect all participant user IDs
    const userIds = new Set<bigint>();
    userIds.add(job.customer.userId);
    job.assignments.forEach((a) => userIds.add(a.worker.userId));

    if (existing) {
      // Sync members if new workers joined
      for (const uid of userIds) {
        const isMember = existing.members.some((m) => m.userId === uid);
        if (!isMember) {
          await prisma.conversationMember.create({
            data: { conversationId: existing.id, userId: uid },
          });
        }
      }
      return existing;
    }

    return prisma.conversation.create({
      data: {
        type: "JOB_GROUP",
        jobId,
        customerId: job.customerId,
        members: {
          create: Array.from(userIds).map((userId) => ({ userId })),
        },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
      },
    });
  },

  /**
   * Fetch user's active conversations
   */
  async getUserConversations(actor: AuthActor) {
    return prisma.conversation.findMany({
      where: {
        members: { some: { userId: actor.userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, profileImage: true } } },
        },
        job: { select: { id: true, title: true, status: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  /**
   * Send message (authoritatively verifying sender is a conversation member)
   */
  async sendMessage(actor: AuthActor, conversationId: bigint, messageText: string) {
    const isMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: actor.userId,
        },
      },
    });

    if (!isMember && actor.role !== "ADMIN") {
      throw new Error("You are not authorized to send messages in this conversation");
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: actor.userId,
        message: messageText.trim(),
        messageType: "TEXT",
      },
      include: {
        sender: { select: { id: true, name: true, profileImage: true } },
      },
    });

    // Touch conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  },

  /**
   * Get messages for conversation (verifying membership)
   */
  async getMessages(actor: AuthActor, conversationId: bigint, limit: number = 50) {
    const isMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: actor.userId,
        },
      },
    });

    if (!isMember && actor.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    return prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, profileImage: true } },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  },
};
