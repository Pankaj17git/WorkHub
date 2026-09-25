import { prisma } from "@/lib/prisma";
import { AuthActor } from "@/lib/authActor";

export const WorkerConnectionService = {
  /**
   * Send peer connection request
   */
  async sendConnectionRequest(actor: AuthActor, targetWorkerId: bigint) {
    if (!actor.worker) {
      throw new Error("Only workers can connect with other workers");
    }

    const myWorkerId = actor.worker.id;
    if (myWorkerId === targetWorkerId) {
      throw new Error("Cannot connect with yourself");
    }

    const existing = await prisma.workerConnection.findFirst({
      where: {
        OR: [
          { workerId: myWorkerId, connectedWorkerId: targetWorkerId },
          { workerId: targetWorkerId, connectedWorkerId: myWorkerId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        throw new Error("Already connected with this worker");
      }
      if (existing.status === "BLOCKED") {
        throw new Error("Cannot connect with this user");
      }
      if (existing.status === "PENDING") {
        throw new Error("A connection request is already pending between you");
      }
      // If previously rejected, allow re-requesting
      return prisma.workerConnection.update({
        where: { id: existing.id },
        data: {
          workerId: myWorkerId,
          connectedWorkerId: targetWorkerId,
          status: "PENDING",
        },
      });
    }

    return prisma.workerConnection.create({
      data: {
        workerId: myWorkerId,
        connectedWorkerId: targetWorkerId,
        status: "PENDING",
      },
    });
  },

  /**
   * Accept connection request
   */
  async acceptConnection(actor: AuthActor, connectionId: bigint) {
    if (!actor.worker) throw new Error("Unauthorized");

    const connection = await prisma.workerConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.connectedWorkerId !== actor.worker.id) {
      throw new Error("Connection request not found or not addressed to you");
    }

    return prisma.workerConnection.update({
      where: { id: connectionId },
      data: { status: "ACCEPTED" },
    });
  },

  /**
   * Reject connection request
   */
  async rejectConnection(actor: AuthActor, connectionId: bigint) {
    if (!actor.worker) throw new Error("Unauthorized");

    const connection = await prisma.workerConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.connectedWorkerId !== actor.worker.id) {
      throw new Error("Connection request not found or not addressed to you");
    }

    return prisma.workerConnection.update({
      where: { id: connectionId },
      data: { status: "REJECTED" },
    });
  },

  /**
   * Get my network connections
   */
  async getMyConnections(actor: AuthActor, status: "ACCEPTED" | "PENDING" = "ACCEPTED") {
    if (!actor.worker) throw new Error("Unauthorized");
    const workerId = actor.worker.id;

    const connections = await prisma.workerConnection.findMany({
      where: {
        OR: [{ workerId }, { connectedWorkerId: workerId }],
        status,
      },
      include: {
        worker: {
          include: {
            user: { select: { id: true, name: true, email: true, profileImage: true } },
            skills: true,
            services: true,
          },
        },
        connectedWorker: {
          include: {
            user: { select: { id: true, name: true, email: true, profileImage: true } },
            skills: true,
            services: true,
          },
        },
      },
    });

    return connections.map((conn) => {
      const peer = conn.workerId === workerId ? conn.connectedWorker : conn.worker;
      return {
        connectionId: conn.id.toString(),
        status: conn.status,
        createdAt: conn.createdAt,
        isIncoming: conn.connectedWorkerId === workerId && conn.status === "PENDING",
        peer: {
          id: peer.id.toString(),
          name: peer.user.name,
          email: peer.user.email,
          profileImage: peer.user.profileImage,
          headline: peer.headline,
          skills: peer.skills.map((s) => s.name),
          services: peer.services.map((s) => ({
            name: s.serviceName,
            price: s.price.toString(),
            pricingType: s.pricingType,
          })),
        },
      };
    });
  },
};
