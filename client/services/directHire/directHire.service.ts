import { prisma } from "@/lib/prisma";
import { AuthActor } from "@/lib/authActor";
import { AvailabilityService } from "../worker/availability.service";
import { addressService } from "../address.service";

export interface CreateDirectHireInput {
  workerId: bigint;
  serviceName?: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  customerMessage?: string;
  proposedPrice?: number;
  address?: {
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

export const DirectHireService = {
  /**
   * Customer initiates direct hire inquiry
   */
  async createDirectHireRequest(actor: AuthActor, input: CreateDirectHireInput) {
    if (!actor.customer) {
      throw new Error("Only customers can initiate direct hire requests");
    }

    const worker = await prisma.worker.findUnique({
      where: { id: input.workerId },
      include: { user: true },
    });

    if (!worker || worker.deletedAt !== null) {
      throw new Error("Worker not found");
    }

    let addressId: bigint | null = null;
    if (input.address) {
      const createdAddr = await addressService.createAddress(input.address);
      addressId = createdAddr.id;
    }

    const requestedDateObj = new Date(input.requestedDate);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return prisma.directHireRequest.create({
      data: {
        customerId: actor.customer.id,
        workerId: input.workerId,
        serviceName: input.serviceName,
        addressId,
        requestedDate: requestedDateObj,
        requestedStartTime: input.requestedStartTime,
        requestedEndTime: input.requestedEndTime,
        customerMessage: input.customerMessage,
        proposedPrice: input.proposedPrice !== undefined ? input.proposedPrice : null,
        status: "PENDING",
        expiresAt,
      },
      include: {
        worker: {
          include: {
            user: { select: { name: true, profileImage: true } },
          },
        },
      },
    });
  },

  /**
   * Worker accepts direct hire (Strict availability check before assignment creation)
   */
  async acceptDirectHire(actor: AuthActor, requestId: bigint) {
    if (!actor.worker) {
      throw new Error("Only workers can accept direct hire requests");
    }

    const workerId = actor.worker.id;

    return prisma.$transaction(async (tx) => {
      // Serialize concurrent booking attempts for this worker
      await tx.$queryRaw`SELECT id FROM workers WHERE id = ${workerId} FOR UPDATE`;

      const request = await tx.directHireRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new Error("Direct hire request not found");
      }

      if (request.workerId !== workerId) {
        throw new Error("Unauthorized to accept this request");
      }

      if (request.status !== "PENDING") {
        throw new Error(`Request is already ${request.status}`);
      }

      if (new Date() > request.expiresAt) {
        await tx.directHireRequest.update({
          where: { id: requestId },
          data: { status: "EXPIRED" },
        });
        throw new Error("This direct hire request has expired");
      }

      // Authoritative overlap & schedule check inside transaction
      const avail = await AvailabilityService.checkWorkerAvailability(
        workerId,
        request.requestedDate,
        request.requestedStartTime,
        request.requestedEndTime,
        { serviceName: request.serviceName || undefined, dbClient: tx }
      );

      if (!avail.isAvailable) {
        throw new Error(`Cannot accept: ${avail.reason}`);
      }

      // Create Assignment
      const assignment = await tx.assignment.create({
        data: {
          directHireRequestId: request.id,
          customerId: request.customerId,
          workerId: request.workerId,
          role: "LEAD",
          scheduledDate: request.requestedDate,
          startTime: request.requestedStartTime,
          endTime: request.requestedEndTime,
          status: "ASSIGNED",
        },
      });

      // Update request to ACCEPTED
      await tx.directHireRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      return {
        request,
        assignment,
      };
    });
  },

  /**
   * Worker declines direct hire
   */
  async declineDirectHire(actor: AuthActor, requestId: bigint) {
    if (!actor.worker) throw new Error("Unauthorized");

    const request = await prisma.directHireRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.workerId !== actor.worker.id) {
      throw new Error("Unauthorized");
    }

    return prisma.directHireRequest.update({
      where: { id: requestId },
      data: { status: "DECLINED" },
    });
  },
};
