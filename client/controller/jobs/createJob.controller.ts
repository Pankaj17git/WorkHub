import { NextRequest } from "next/server";
import { z } from "zod";
import { status as Status } from "@/constants/statusCodes";
import { apiResponse } from "@/lib/apiResponse";
import { getAuthActor } from "@/lib/authActor";
import { JobService } from "@/services/jobs/job.service";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  address: z.string().min(1, "Address line is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z.number({ error: "Latitude is required" }),
  longitude: z.number({ error: "Longitude is required" }),
});

const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  serviceName: z.string().optional(),
  minAmount: z.number().min(0, "Minimum amount must be non-negative").optional(),
  maxAmount: z.number().min(0, "Maximum amount must be non-negative").optional(),
  currency: z.string().default("INR"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  preferredDate: z.string().optional(),
  preferredStartTime: z.string().optional(),
  preferredEndTime: z.string().optional(),
  requiredWorkers: z.number().int().min(1).max(10).optional(),
  workerRequirementType: z
    .enum(["CUSTOMER_DEFINED", "PLATFORM_RECOMMENDED", "UNKNOWN"])
    .optional(),
  address: addressSchema.optional(),
  addressId: z.number().optional(),
});

interface SerializableJob {
  id: bigint | number | string;
  customerId?: bigint | number | string | null;
  addressId?: bigint | number | string | null;
  minAmount?: bigint | number | string | null;
  maxAmount?: bigint | number | string | null;
  address?: {
    id: bigint | number | string;
    latitude?: number | string | null;
    longitude?: number | string | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

function serializeJob(job: SerializableJob) {
  return {
    ...job,
    id: job.id.toString(),
    customerId: job.customerId?.toString(),
    addressId: job.addressId?.toString(),
    minAmount: job.minAmount ? job.minAmount.toString() : null,
    maxAmount: job.maxAmount ? job.maxAmount.toString() : null,
    address: job.address
      ? {
          ...job.address,
          id: job.address.id.toString(),
          latitude: job.address.latitude ? Number(job.address.latitude) : null,
          longitude: job.address.longitude ? Number(job.address.longitude) : null,
        }
      : null,
  };
}

export const JobController = {
  /**
   * @swagger
   * /api/jobs:
   *   post:
   *     tags: [Jobs]
   *     summary: Create a new job
   *     description: Creates a new job posting with authoritative staffing calculation and optional address.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateJobRequest'
   *     responses:
   *       201:
   *         description: Job created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CreateJobResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async createJob(request: NextRequest) {
    try {
      const actor = await getAuthActor(request);
      if (!actor) {
        return apiResponse.unauthorized("Authentication required");
      }

      if (actor.role === "WORKER" && !actor.customer) {
        return apiResponse.forbidden("Only customers can post jobs");
      }

      // Auto-provision Customer record if authenticated user posts a job
      if (!actor.customer) {
        const createdCustomer = await prisma.customer.create({
          data: { userId: actor.userId },
        });
        actor.customer = { id: createdCustomer.id, addressId: null };
      }

      const body = await request.json();
      const parseResult = createJobSchema.safeParse(body);

      if (!parseResult.success) {
        return apiResponse.badRequest(parseResult.error.issues[0].message);
      }

      const job = await JobService.createJob(actor, parseResult.data);
      return apiResponse.success({ job: serializeJob(job) }, Status.CREATED, "Job created successfully");
    } catch (error) {
      console.error("Error creating job:", error);
      const message = error instanceof Error ? error.message : "Failed to create job";
      return apiResponse.badRequest(message);
    }
  },

  /**
   * @swagger
   * /api/jobs:
   *   get:
   *     tags: [Jobs]
   *     summary: Get jobs
   *     description: Retrieve jobs for customer posted (mine=true) or public marketplace discovery.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: mine
   *         schema:
   *           type: boolean
   *         description: Set to true to filter only jobs posted by current user
   *       - in: query
   *         name: service
   *         schema:
   *           type: string
   *         description: Filter by service category name
   *       - in: query
   *         name: skill
   *         schema:
   *           type: string
   *         description: Filter by required skill
   *     responses:
   *       200:
   *         description: List of jobs retrieved successfully
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getjobs(request: NextRequest) {
    try {
      const actor = await getAuthActor(request);
      const { searchParams } = new URL(request.url);
      const filterMine = searchParams.get("mine") === "true";
      const serviceName = searchParams.get("service") || undefined;
      const skill = searchParams.get("skill") || undefined;

      const jobs = await JobService.getMarketplaceJobs({
        customerId: filterMine && actor?.customer ? actor.customer.id : undefined,
        serviceName,
        skill,
      });

      return apiResponse.success({ jobs: jobs.map(serializeJob) }, Status.OK);
    } catch (error) {
      console.error("Error getting jobs:", error);
      const message = error instanceof Error ? error.message : "Failed to retrieve jobs";
      return apiResponse.internalError(message);
    }
  },

  /**
   * @swagger
   * /api/jobs/{id}/applications:
   *   post:
   *     tags: [Jobs]
   *     summary: Worker applies to job
   *     description: Registered worker applies to an open job with a cover note and proposed price.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ApplyJobRequest'
   *     responses:
   *       201:
   *         description: Application submitted successfully
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async applyToJob(request: NextRequest, jobIdStr: string) {
    try {
      const actor = await getAuthActor(request);
      if (!actor || !actor.worker) {
        return apiResponse.forbidden("Only registered workers can apply to jobs");
      }

      const jobId = BigInt(jobIdStr);
      const body = await request.json().catch(() => ({}));

      const application = await JobService.applyToJob(
        actor,
        jobId,
        body.message,
        body.proposedPrice ? Number(body.proposedPrice) : undefined
      );

      return apiResponse.success(
        {
          application: {
            ...application,
            id: application.id.toString(),
            jobId: application.jobId.toString(),
            workerId: application.workerId.toString(),
            proposedPrice: application.proposedPrice ? application.proposedPrice.toString() : null,
          },
        },
        Status.CREATED,
        "Application submitted successfully"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit application";
      return apiResponse.badRequest(message);
    }
  },

  /**
   * @swagger
   * /api/jobs/{id}/select-workers:
   *   post:
   *     tags: [Jobs]
   *     summary: Customer selects workers for job
   *     description: Customer selects one or more workers from applicants to fulfill required worker quota.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SelectWorkersRequest'
   *     responses:
   *       200:
   *         description: Workers selected and assignments confirmed
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async selectWorkers(request: NextRequest, jobIdStr: string) {
    try {
      const actor = await getAuthActor(request);
      if (!actor || !actor.customer) {
        return apiResponse.forbidden("Only the job poster can select workers");
      }

      const jobId = BigInt(jobIdStr);
      const body = await request.json();

      const schema = z.object({
        workerIds: z.array(z.string().or(z.number())).min(1, "Must select at least one worker"),
      });

      const parseResult = schema.safeParse(body);
      if (!parseResult.success) {
        return apiResponse.badRequest(parseResult.error.issues[0].message);
      }

      const workerIds = parseResult.data.workerIds.map((id) => BigInt(id));
      const result = await JobService.selectWorkers(actor, jobId, workerIds);

      return apiResponse.success(
        {
          job: serializeJob(result.job),
          assignments: result.assignments.map((a) => ({
            ...a,
            id: a.id.toString(),
            jobId: a.jobId?.toString(),
            customerId: a.customerId.toString(),
            workerId: a.workerId.toString(),
          })),
        },
        Status.OK,
        "Workers selected and assignments confirmed"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to select workers";
      return apiResponse.badRequest(message);
    }
  },

  /**
   * @swagger
   * /api/jobs/{id}:
   *   get:
   *     tags: [Jobs]
   *     summary: Get single job details
   *     description: Returns complete job details, customer info, address, and current worker assignments.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *       200:
   *         description: Job details
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getJobById(request: NextRequest, idStr: string) {
    try {
      const jobId = BigInt(idStr);
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          address: true,
          customer: {
            include: { user: { select: { name: true, email: true, profileImage: true } } },
          },
          assignments: {
            include: {
              worker: {
                include: { user: { select: { name: true, profileImage: true } } },
              },
            },
          },
        },
      });

      if (!job || job.deletedAt !== null) {
        return apiResponse.notFound("Job not found");
      }

      return apiResponse.success(
        {
          job: {
            ...serializeJob(job),
            assignments: job.assignments.map((a) => ({
              ...a,
              id: a.id.toString(),
              jobId: a.jobId?.toString(),
              customerId: a.customerId.toString(),
              workerId: a.workerId.toString(),
            })),
          },
        },
        Status.OK
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch job";
      return apiResponse.badRequest(message);
    }
  },

  /**
   * @swagger
   * /api/jobs/{id}/applications:
   *   get:
   *     tags: [Jobs]
   *     summary: Customer views job applicants
   *     description: Customer views all worker applicants for a posted job.
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *       200:
   *         description: List of applications
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getJobApplications(request: NextRequest, jobIdStr: string) {
    try {
      await getAuthActor(request);
      const jobId = BigInt(jobIdStr);

      const applications = await prisma.jobApplication.findMany({
        where: { jobId },
        include: {
          worker: {
            include: {
              user: { select: { name: true, email: true, profileImage: true } },
              skills: true,
              services: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return apiResponse.success(
        {
          applications: applications.map((app) => ({
            ...app,
            id: app.id.toString(),
            jobId: app.jobId.toString(),
            workerId: app.workerId.toString(),
            proposedPrice: app.proposedPrice ? app.proposedPrice.toString() : null,
            worker: {
              id: app.worker.id.toString(),
              name: app.worker.user.name,
              email: app.worker.user.email,
              profileImage: app.worker.user.profileImage,
              headline: app.worker.headline,
              skills: app.worker.skills.map((s) => s.name),
            },
          })),
        },
        Status.OK
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch applications";
      return apiResponse.badRequest(message);
    }
  },
};
