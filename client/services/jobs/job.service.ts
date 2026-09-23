import { prisma } from "@/lib/prisma";
import { AuthActor } from "@/lib/authActor";
import { AvailabilityService } from "../worker/availability.service";
import { StaffingRecommendationService } from "./staffingRecommendation.service";
import { addressService } from "../address.service";

export interface CreateJobInput {
  title: string;
  description: string;
  serviceName?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  skills: string[];
  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  applicationDeadline?: string;
  requiredWorkers?: number;
  minimumWorkers?: number;
  maximumWorkers?: number;
  workerRequirementType?: "CUSTOMER_DEFINED" | "PLATFORM_RECOMMENDED" | "UNKNOWN";
  address?: {
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  addressId?: number;
}

export const JobService = {
  /**
   * Create a new job with authoritative staffing calculation
   */
  async createJob(actor: AuthActor, input: CreateJobInput) {
    if (!actor.customer) {
      throw new Error("Only customers can post jobs");
    }

    let addressId: bigint | null = null;
    if (input.address) {
      const createdAddr = await addressService.createAddress(input.address);
      addressId = createdAddr.id;
    } else if (input.addressId) {
      addressId = BigInt(input.addressId);
    }

    let workerRequirementType = input.workerRequirementType || "CUSTOMER_DEFINED";
    let requiredWorkers = input.requiredWorkers || 1;

    // Staffing recommendation if customer is unsure
    if (workerRequirementType === "UNKNOWN" || !input.requiredWorkers) {
      const rec = StaffingRecommendationService.recommendStaffing({
        serviceName: input.serviceName,
        skills: input.skills,
        description: input.description,
        startTime: input.preferredStartTime,
        endTime: input.preferredEndTime,
      });
      requiredWorkers = rec.recommendedWorkers;
      workerRequirementType = "PLATFORM_RECOMMENDED";
    }

    const preferredDateObj = input.preferredDate ? new Date(input.preferredDate) : null;
    const applicationDeadlineObj = input.applicationDeadline ? new Date(input.applicationDeadline) : null;

    const job = await prisma.job.create({
      data: {
        title: input.title,
        description: input.description,
        serviceName: input.serviceName,
        customerId: actor.customer.id,
        addressId,
        minAmount: input.minAmount !== undefined ? input.minAmount : null,
        maxAmount: input.maxAmount !== undefined ? input.maxAmount : null,
        currency: input.currency || "INR",
        preferredDate: preferredDateObj,
        preferredStartTime: input.preferredStartTime,
        preferredEndTime: input.preferredEndTime,
        applicationDeadline: applicationDeadlineObj,
        skills: input.skills,
        workerRequirementType,
        requiredWorkers,
        minimumWorkers: input.minimumWorkers !== undefined ? input.minimumWorkers : 1,
        maximumWorkers: input.maximumWorkers !== undefined ? input.maximumWorkers : 10,
        assignedWorkerCount: 0,
        staffingStatus: "OPEN",
        status: "OPEN",
      },
      include: {
        address: true,
        customer: {
          include: {
            user: {
              select: { name: true, email: true, profileImage: true },
            },
          },
        },
      },
    });

    return job;
  },

  /**
   * Get marketplace jobs with discovery filters
   */
  async getMarketplaceJobs(filters?: {
    serviceName?: string;
    skill?: string;
    status?: string;
    customerId?: bigint;
    limit?: number;
    offset?: number;
  }) {
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    } else {
      where.status = filters?.status || "OPEN";
    }

    if (filters?.serviceName) {
      where.serviceName = { contains: filters.serviceName };
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        address: true,
        customer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        _count: {
          select: { applications: true, assignments: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    return jobs;
  },

  /**
   * Submit application from worker
   */
  async applyToJob(actor: AuthActor, jobId: bigint, message?: string, proposedPrice?: number) {
    if (!actor.worker) {
      throw new Error("Only registered workers can apply to jobs");
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.deletedAt !== null) {
      throw new Error("Job not found");
    }

    if (job.status !== "OPEN") {
      throw new Error("This job is no longer open for applications");
    }

    if (job.staffingStatus === "FULLY_ASSIGNED") {
      throw new Error("This job is already fully staffed");
    }

    // Availability validation if job has preferred schedule
    if (job.preferredDate && job.preferredStartTime && job.preferredEndTime) {
      const avail = await AvailabilityService.checkWorkerAvailability(
        actor.worker.id,
        job.preferredDate,
        job.preferredStartTime,
        job.preferredEndTime,
        { serviceName: job.serviceName || undefined }
      );

      if (!avail.isAvailable) {
        throw new Error(`Cannot apply: ${avail.reason}`);
      }
    }

    // Check duplicate application
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_workerId: {
          jobId,
          workerId: actor.worker.id,
        },
      },
    });

    if (existing) {
      if (existing.status === "WITHDRAWN") {
        // Re-open application
        return prisma.jobApplication.update({
          where: { id: existing.id },
          data: {
            status: "SUBMITTED",
            message: message || existing.message,
            proposedPrice: proposedPrice !== undefined ? proposedPrice : existing.proposedPrice,
          },
        });
      }
      throw new Error("You have already applied to this job");
    }

    return prisma.jobApplication.create({
      data: {
        jobId,
        workerId: actor.worker.id,
        message,
        proposedPrice: proposedPrice !== undefined ? proposedPrice : null,
        status: "SUBMITTED",
      },
    });
  },

  /**
   * Withdraw application
   */
  async withdrawApplication(actor: AuthActor, applicationId: bigint) {
    if (!actor.worker) {
      throw new Error("Unauthorized");
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.workerId !== actor.worker.id) {
      throw new Error("Application not found or unauthorized");
    }

    if (application.status === "SELECTED") {
      throw new Error("Cannot withdraw an application that has already been selected into an assignment");
    }

    return prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: "WITHDRAWN" },
    });
  },

  /**
   * Multi-worker selection (Transactional)
   */
  async selectWorkers(actor: AuthActor, jobId: bigint, workerIds: bigint[]) {
    if (!actor.customer) {
      throw new Error("Only the job poster can select workers");
    }

    return prisma.$transaction(async (tx) => {
      // Lock job to serialize concurrent worker selection
      await tx.$queryRaw`SELECT id FROM jobs WHERE id = ${jobId} FOR UPDATE`;

      const job = await tx.job.findUnique({
        where: { id: jobId },
        include: { assignments: true },
      });

      if (!job || job.deletedAt !== null) {
        throw new Error("Job not found");
      }

      if (job.customerId !== actor.customer?.id && actor.role !== "ADMIN") {
        throw new Error("You are not authorized to select workers for this job");
      }

      const currentAssigned = job.assignedWorkerCount;
      const remainingSlots = job.requiredWorkers - currentAssigned;

      if (workerIds.length > remainingSlots) {
        throw new Error(
          `Cannot select ${workerIds.length} workers. Only ${remainingSlots} open slot(s) remain on this job.`
        );
      }

      const createdAssignments = [];

      for (let i = 0; i < workerIds.length; i++) {
        const wId = workerIds[i];

        // Check availability
        if (job.preferredDate && job.preferredStartTime && job.preferredEndTime) {
          const avail = await AvailabilityService.checkWorkerAvailability(
            wId,
            job.preferredDate,
            job.preferredStartTime,
            job.preferredEndTime,
            { dbClient: tx }
          );
          if (!avail.isAvailable) {
            throw new Error(`Worker #${wId.toString()} is unavailable: ${avail.reason}`);
          }
        }

        // Designation: first assigned worker becomes LEAD
        const role = currentAssigned === 0 && i === 0 ? "LEAD" : "MEMBER";

        const assignment = await tx.assignment.create({
          data: {
            jobId: job.id,
            customerId: job.customerId,
            workerId: wId,
            role,
            scheduledDate: job.preferredDate || new Date(),
            startTime: job.preferredStartTime || "09:00",
            endTime: job.preferredEndTime || "17:00",
            status: "ASSIGNED",
          },
        });

        createdAssignments.push(assignment);

        // Update application status
        await tx.jobApplication.updateMany({
          where: { jobId: job.id, workerId: wId },
          data: { status: "SELECTED" },
        });
      }

      const newAssignedCount = currentAssigned + workerIds.length;
      const newStaffingStatus =
        newAssignedCount >= job.requiredWorkers ? "FULLY_ASSIGNED" : "PARTIALLY_ASSIGNED";

      const updatedJob = await tx.job.update({
        where: { id: job.id },
        data: {
          assignedWorkerCount: newAssignedCount,
          staffingStatus: newStaffingStatus,
          status: "SCHEDULED",
        },
      });

      return {
        job: updatedJob,
        assignments: createdAssignments,
      };
    });
  },
};
