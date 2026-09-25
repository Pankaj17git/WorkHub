import { prisma } from "@/lib/prisma";
import { AuthActor } from "@/lib/authActor";
import { AssignmentPolicy, AssignmentAction } from "@/policies/AssignmentPolicy";

export const AssignmentStateService = {
  /**
   * Worker confirms assignment
   */
  async confirm(actor: AuthActor, assignmentId: bigint) {
    return this.transition(actor, assignmentId, "CONFIRM", "ASSIGNED", "CONFIRMED", {
      confirmedAt: new Date(),
    });
  },

  /**
   * Worker starts travel
   */
  async startTravel(actor: AuthActor, assignmentId: bigint) {
    return this.transition(actor, assignmentId, "START_TRAVEL", "CONFIRMED", "ON_THE_WAY", {
      onTheWayAt: new Date(),
    });
  },

  /**
   * Worker arrives at job site
   */
  async arrive(actor: AuthActor, assignmentId: bigint) {
    // Generate doorstep start OTP when worker arrives
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setHours(otpExpiry.getHours() + 2); // 2-hour window

    return this.transition(actor, assignmentId, "ARRIVE", "ON_THE_WAY", "ARRIVED", {
      arrivedAt: new Date(),
      startOtp: randomOtp,
      otpExpiresAt: otpExpiry,
    });
  },

  /**
   * Customer gets their doorstep OTP to share with worker
   */
  async getDoorstepOtp(actor: AuthActor, assignmentId: bigint) {
    if (!actor.customer) throw new Error("Unauthorized");

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment || assignment.customerId !== actor.customer.id) {
      throw new Error("Assignment not found or unauthorized");
    }

    return {
      otp: assignment.startOtp,
      expiresAt: assignment.otpExpiresAt,
      status: assignment.status,
    };
  },

  /**
   * Worker verifies doorstep OTP to start work
   */
  async verifyStartOtp(actor: AuthActor, assignmentId: bigint, inputOtp: string) {
    if (!actor.worker) throw new Error("Only the assigned worker can verify OTP to start work");

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) throw new Error("Assignment not found");
    if (assignment.workerId !== actor.worker.id) throw new Error("Unauthorized");
    if (assignment.status !== "ARRIVED") {
      throw new Error(`Assignment must be in ARRIVED status before starting (current: ${assignment.status})`);
    }

    if (!assignment.startOtp || assignment.startOtp !== inputOtp.trim()) {
      throw new Error("Invalid start OTP");
    }

    if (assignment.otpExpiresAt && new Date() > assignment.otpExpiresAt) {
      throw new Error("Start OTP has expired");
    }

    // Update assignment to IN_PROGRESS
    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Also update parent Job status to IN_PROGRESS if applicable
    if (assignment.jobId) {
      await prisma.job.update({
        where: { id: assignment.jobId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return updated;
  },

  /**
   * Worker marks assignment as completed
   */
  async complete(actor: AuthActor, assignmentId: bigint) {
    if (!actor.worker) throw new Error("Only the assigned worker can complete work");

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) throw new Error("Assignment not found");
    if (assignment.workerId !== actor.worker.id) throw new Error("Unauthorized");
    if (assignment.status !== "IN_PROGRESS") {
      throw new Error(`Assignment must be IN_PROGRESS to complete (current: ${assignment.status})`);
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Check if multi-worker job is fully completed
    if (assignment.jobId) {
      const remainingActiveAssignments = await prisma.assignment.count({
        where: {
          jobId: assignment.jobId,
          status: { in: ["ASSIGNED", "CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"] },
        },
      });

      if (remainingActiveAssignments === 0) {
        await prisma.job.update({
          where: { id: assignment.jobId },
          data: { status: "COMPLETED" },
        });
      }
    }

    return updatedAssignment;
  },

  /**
   * Cancel assignment
   */
  async cancel(actor: AuthActor, assignmentId: bigint, reason?: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) throw new Error("Assignment not found");

    if (!AssignmentPolicy.canPerformAction(actor, assignment, "CANCEL")) {
      throw new Error("You are not authorized to cancel this assignment");
    }

    if (assignment.status === "COMPLETED") {
      throw new Error("Cannot cancel a completed assignment");
    }

    return prisma.$transaction(async (tx) => {
      const cancelled = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      // If tied to a job, adjust staffing count and status
      if (assignment.jobId) {
        const job = await tx.job.findUnique({ where: { id: assignment.jobId } });
        if (job) {
          const newAssignedCount = Math.max(0, job.assignedWorkerCount - 1);
          await tx.job.update({
            where: { id: job.id },
            data: {
              assignedWorkerCount: newAssignedCount,
              staffingStatus: newAssignedCount === 0 ? "OPEN" : "PARTIALLY_ASSIGNED",
            },
          });
        }
      }

      return cancelled;
    });
  },

  /**
   * Internal guarded state transition helper
   */
  async transition(
    actor: AuthActor,
    assignmentId: bigint,
    action: AssignmentAction,
    expectedStatus: string,
    targetStatus: "CONFIRMED" | "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED",
    additionalData: Record<string, unknown>
  ) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) throw new Error("Assignment not found");

    if (!AssignmentPolicy.canPerformAction(actor, assignment, action)) {
      throw new Error(`Unauthorized to perform action ${action} on assignment`);
    }

    if (assignment.status !== expectedStatus) {
      throw new Error(
        `Invalid state transition: Cannot perform ${action} on assignment with status ${assignment.status} (expected: ${expectedStatus})`
      );
    }

    return prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: targetStatus,
        ...additionalData,
      },
    });
  },
};
