import { prisma } from "@/lib/prisma";
import { AuthActor } from "@/lib/authActor";
import { AvailabilityService } from "./availability.service";

export const TeamInvitationService = {
  /**
   * Worker invites a connected peer to a partially-staffed job
   */
  async createInvitation(actor: AuthActor, jobId: bigint, invitedWorkerId: bigint) {
    if (!actor.worker) {
      throw new Error("Only workers can send team invitations");
    }

    const inviterWorkerId = actor.worker.id;

    if (inviterWorkerId === invitedWorkerId) {
      throw new Error("Cannot invite yourself to a team");
    }

    // 1. Inviter must be assigned to this job
    const inviterAssignment = await prisma.assignment.findFirst({
      where: {
        jobId,
        workerId: inviterWorkerId,
        status: { in: ["ASSIGNED", "CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"] },
      },
    });

    if (!inviterAssignment) {
      throw new Error("You must have an active assignment on this job to invite team members");
    }

    // 2. Job must still require additional workers
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.deletedAt !== null) {
      throw new Error("Job not found");
    }

    if (job.assignedWorkerCount >= job.requiredWorkers) {
      throw new Error("This job is already fully staffed");
    }

    // 3. Workers must be connected in good standing
    const connection = await prisma.workerConnection.findFirst({
      where: {
        OR: [
          { workerId: inviterWorkerId, connectedWorkerId: invitedWorkerId },
          { workerId: invitedWorkerId, connectedWorkerId: inviterWorkerId },
        ],
        status: "ACCEPTED",
      },
    });

    if (!connection) {
      throw new Error("You can only invite workers from your accepted trusted network");
    }

    // 4. Target worker must not already be assigned
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        jobId,
        workerId: invitedWorkerId,
        status: { not: "CANCELLED" },
      },
    });

    if (existingAssignment) {
      throw new Error("This worker is already assigned to this job");
    }

    // 5. Expiry calculation (24 hours or before preferred start time)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return prisma.teamInvitation.create({
      data: {
        jobId,
        inviterWorkerId,
        invitedWorkerId,
        status: "PENDING",
        expiresAt,
      },
      include: {
        job: { select: { title: true, minAmount: true, maxAmount: true } },
        inviterWorker: {
          include: {
            user: { select: { name: true, profileImage: true } },
          },
        },
      },
    });
  },

  /**
   * Invited worker accepts team invitation (Transaction with slot locking)
   */
  async acceptInvitation(actor: AuthActor, invitationId: bigint) {
    if (!actor.worker) {
      throw new Error("Only workers can accept team invitations");
    }

    const workerId = actor.worker.id;

    return prisma.$transaction(async (tx) => {
      const invitation = await tx.teamInvitation.findUnique({
        where: { id: invitationId },
        include: { job: true },
      });

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      if (invitation.invitedWorkerId !== workerId) {
        throw new Error("This invitation was not addressed to you");
      }

      if (invitation.status !== "PENDING") {
        throw new Error(`Invitation is no longer pending (current: ${invitation.status})`);
      }

      if (new Date() > invitation.expiresAt) {
        await tx.teamInvitation.update({
          where: { id: invitationId },
          data: { status: "EXPIRED" },
        });
        throw new Error("This team invitation has expired");
      }

      // Lock job record to serialize slot competition
      await tx.$queryRaw`SELECT id FROM jobs WHERE id = ${invitation.jobId} FOR UPDATE`;

      const job = await tx.job.findUniqueOrThrow({
        where: { id: invitation.jobId },
      });

      // Slot availability check
      if (job.assignedWorkerCount >= job.requiredWorkers) {
        throw new Error("Sorry, all staffing slots for this job have already been filled");
      }

      // Worker schedule availability check
      if (job.preferredDate && job.preferredStartTime && job.preferredEndTime) {
        const avail = await AvailabilityService.checkWorkerAvailability(
          workerId,
          job.preferredDate,
          job.preferredStartTime,
          job.preferredEndTime,
          { dbClient: tx }
        );

        if (!avail.isAvailable) {
          throw new Error(`Cannot accept invitation: ${avail.reason}`);
        }
      }

      // Create Assignment
      const assignment = await tx.assignment.create({
        data: {
          jobId: job.id,
          customerId: job.customerId,
          workerId,
          role: "MEMBER",
          scheduledDate: job.preferredDate || new Date(),
          startTime: job.preferredStartTime || "09:00",
          endTime: job.preferredEndTime || "17:00",
          status: "ASSIGNED",
        },
      });

      // Update invitation
      await tx.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: "ACCEPTED",
          assignmentId: assignment.id,
        },
      });

      // Increment job staffing
      const newAssignedCount = job.assignedWorkerCount + 1;
      const newStaffingStatus =
        newAssignedCount >= job.requiredWorkers ? "FULLY_ASSIGNED" : "PARTIALLY_ASSIGNED";

      await tx.job.update({
        where: { id: job.id },
        data: {
          assignedWorkerCount: newAssignedCount,
          staffingStatus: newStaffingStatus,
          status: "SCHEDULED",
        },
      });

      return {
        assignment,
        jobId: job.id,
        staffingStatus: newStaffingStatus,
      };
    });
  },

  /**
   * Decline invitation
   */
  async declineInvitation(actor: AuthActor, invitationId: bigint) {
    if (!actor.worker) throw new Error("Unauthorized");

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.invitedWorkerId !== actor.worker.id) {
      throw new Error("Invitation not found or unauthorized");
    }

    return prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: "DECLINED" },
    });
  },
};
