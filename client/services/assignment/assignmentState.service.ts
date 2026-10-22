import { prisma } from "@/lib/prisma";
import { AuthActor } from "@/lib/authActor";
import { AssignmentPolicy, AssignmentAction } from "@/policies/AssignmentPolicy";
import { NotificationService } from "../notification/notification.service";

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
    return this.transition(actor, assignmentId, "START_TRAVEL", ["CONFIRMED", "ASSIGNED"], "ON_THE_WAY", {
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
    console.log("assignment",assignment)

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

    // Notify customer about service completion
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: assignment.customerId },
      });
      if (customer) {
        await NotificationService.notifyUser(
          customer.userId,
          "ASSIGNMENT_COMPLETED",
          "Service Completed!",
          "Worker has completed your service. Please share a review of your experience.",
          "ASSIGNMENT",
          assignment.id
        );
      }
    } catch (e) {
      console.error("[Notification] Assignment complete notification error:", e);
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

    const cancelled = await prisma.$transaction(async (tx) => {
      const updated = await tx.assignment.update({
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

      return updated;
    });

    // Notify the other party about cancellation
    try {
      if (actor.customer) {
        // Customer cancelled -> notify worker
        const worker = await prisma.worker.findUnique({ where: { id: assignment.workerId } });
        if (worker) {
          await NotificationService.notifyUser(
            worker.userId,
            "ASSIGNMENT_CANCELLED",
            "Assignment Cancelled",
            `Customer cancelled the scheduled service${reason ? `: "${reason}"` : "."}`,
            "ASSIGNMENT",
            assignment.id
          );
        }
      } else if (actor.worker) {
        // Worker cancelled -> notify customer
        const customer = await prisma.customer.findUnique({ where: { id: assignment.customerId } });
        if (customer) {
          await NotificationService.notifyUser(
            customer.userId,
            "ASSIGNMENT_CANCELLED",
            "Assignment Cancelled",
            `Worker cancelled the scheduled service${reason ? `: "${reason}"` : "."}`,
            "ASSIGNMENT",
            assignment.id
          );
        }
      }
    } catch (e) {
      console.error("[Notification] Assignment cancellation notification error:", e);
    }

    return cancelled;
  },

  /**
   * Internal guarded state transition helper
   */
  async transition(
    actor: AuthActor,
    assignmentId: bigint,
    action: AssignmentAction,
    expectedStatus: string | string[],
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

    const validStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    if (!validStatuses.includes(assignment.status)) {
      throw new Error(
        `Invalid state transition: Cannot perform ${action} on assignment with status ${assignment.status} (expected: ${validStatuses.join(" or ")})`
      );
    }

    const dataToUpdate: Record<string, unknown> = {
      status: targetStatus,
      ...additionalData,
    };

    // If starting travel directly from ASSIGNED, automatically set confirmedAt as well
    if (action === "START_TRAVEL" && !assignment.confirmedAt) {
      dataToUpdate.confirmedAt = new Date();
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: dataToUpdate,
    });

    // Notify customer on progress milestones
    try {
      const customer = await prisma.customer.findUnique({ where: { id: assignment.customerId } });
      if (customer) {
        if (targetStatus === "CONFIRMED") {
          await NotificationService.notifyUser(
            customer.userId,
            "ASSIGNMENT_CONFIRMED",
            "Assignment Confirmed",
            "Worker confirmed the schedule for your booking.",
            "ASSIGNMENT",
            assignment.id
          );
        } else if (targetStatus === "ON_THE_WAY") {
          await NotificationService.notifyUser(
            customer.userId,
            "ASSIGNMENT_ON_THE_WAY",
            "Worker On The Way!",
            "Your service specialist has started traveling to your location.",
            "ASSIGNMENT",
            assignment.id
          );
        } else if (targetStatus === "ARRIVED") {
          await NotificationService.notifyUser(
            customer.userId,
            "ASSIGNMENT_ARRIVED",
            "Worker Arrived at Location",
            "Worker has reached your doorstep. Please share your Start OTP to commence work.",
            "ASSIGNMENT",
            assignment.id
          );
        } else if (targetStatus === "IN_PROGRESS") {
          await NotificationService.notifyUser(
            customer.userId,
            "ASSIGNMENT_STARTED",
            "Service Underway",
            "Worker verified OTP and commenced the service.",
            "ASSIGNMENT",
            assignment.id
          );
        }
      }
    } catch (e) {
      console.error("[Notification] Transition notification error:", e);
    }

    return updated;
  },
};
