import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authMiddleware } from "@/middleware/auth.middleware";
import { status as Status } from "@/constants/statusCodes";
import { apiResponse } from "@/lib/apiResponse";
import { addressService } from "@/services/address.service";

const addressSchema = z.object({
  address: z
    .string({ error: "Address line is required" })
    .min(1, "Address line is required"),
  city: z.string({ error: "City is required" }).min(1, "City is required"),
  state: z.string({ error: "State is required" }).min(1, "State is required"),
  country: z
    .string({ error: "Country is required" })
    .min(1, "Country is required"),
  latitude: z.number({ error: "Latitude is required" }),
  longitude: z.number({ error: "Longitude is required" }),
});

const createJobSchema = z
  .object({
    title: z
      .string({ error: "Job title is required" })
      .min(1, "Job title is required"),
    description: z.string().min(1, "Job description is required"),
    minAmount: z.number().min(0, "Minimum amount must be non-negative"),
    maxAmount: z.number().min(0, "Maximum amount must be non-negative"),
    currency: z.string().min(1, "Currency is required"),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
    status: z
      .enum(["OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED"])
      .default("OPEN"),
    createdBy: z.string().optional(),
    address: addressSchema.optional(),
    addressId: z.number().optional(),
  })
  .refine((data) => data.address || data.addressId, {
    message: "Either address or addressId is required",
    path: ["address"],
  });

export const JobController = {
  /**
   * @swagger
   * /api/jobs:
   *   post:
   *     tags: [Jobs]
   *     summary: Create a new job
   *     description: Creates a new job posting with an address for the authenticated customer.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateJobRequest'
   *     responses:
   *       200:
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
      const userId = authMiddleware(request);
      if (!userId || typeof userId === "object") {
        return apiResponse.unauthorized();
      }
      const userIdBigInt = BigInt(userId);

      const user = await prisma.user.findUnique({
        where: { id: userIdBigInt },
        include: { roleRef: true, customer: true },
      });

      if (!user) {
        return apiResponse.unauthorized("User not found or unauthorized");
      }

      if (user.roleRef?.type === "WORKER" && !user.customer) {
        return apiResponse.forbidden(
          "Worker account detected. Only customers can post jobs.",
        );
      }

      let customer = user.customer;
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            userId: userIdBigInt,
          },
        });
      }

      const body = await request.json();

      // Normalize address if passed as flat fields at the root of the body
      const normalizedBody = {
        ...body,
        address:
          typeof body.address === "object" && body.address !== null
            ? body.address
            : typeof body.address === "string"
              ? {
                  address: body.address,
                  city: body.city,
                  state: body.state,
                  country: body.country,
                  latitude: body.latitude,
                  longitude: body.longitude,
                }
              : undefined,
      };

      const result = createJobSchema.safeParse(normalizedBody);

      if (!result.success) {
        return apiResponse.badRequest(result.error.issues[0].message);
      }

      const {
        title,
        description,
        minAmount,
        maxAmount,
        currency,
        skills,
        status,
        address,
        addressId,
      } = result.data;

      let targetAddressId: bigint;

      if (address) {
        const newAddress = await addressService.createAddress({
          address: address.address,
          city: address.city,
          state: address.state,
          country: address.country,
          latitude: address.latitude,
          longitude: address.longitude,
        });
        targetAddressId = newAddress.id;
      } else if (addressId) {
        targetAddressId = BigInt(addressId);
      } else {
        return apiResponse.badRequest("Address or addressId is required");
      }

      const job = await prisma.job.create({
        data: {
          title,
          description,
          minAmount,
          maxAmount,
          currency,
          skills,
          status,
          createdBy: { connect: { id: customer.id } },
          address: { connect: { id: targetAddressId } },
        },
        include: {
          address: true,
        },
      });

      const formattedJob = {
        ...job,
        id: job.id.toString(),
        createdById: job.createdById?.toString(),
        addressId: job.addressId?.toString(),
        assignedToId: job.assignedToId?.toString(),
        address: job.address
          ? {
              ...job.address,
              id: job.address.id.toString(),
            }
          : null,
      };

      return apiResponse.success({ job: formattedJob }, Status.OK);
    } catch (error: unknown) {
      console.error("Error creating job:", error);
      return apiResponse.internalError("Failed to create job");
    }
  },

  /**
   * @swagger
   * /api/jobs:
   *   get:
   *     tags: [Jobs]
   *     summary: Get customer posted jobs
   *     description: Fetches all jobs posted by the authenticated customer.
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Jobs retrieved successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getjobs(request: NextRequest) {
    try {
      const userId = authMiddleware(request);
      if (!userId || typeof userId === "object") {
        return apiResponse.unauthorized();
      }
      const userIdBigInt = BigInt(userId);

      const customer = await prisma.customer.findUnique({
        where: {
          userId: userIdBigInt,
        },
      });

      const jobs = await prisma.job.findMany({
        where: {
          createdById: customer?.id,
        },
        include: {
          address: true,
        },
      });

      const formattedJobs = jobs.map((job) => {
        return {
          ...job,
          id: job.id.toString(),
          createdById: job.createdById?.toString(),
          addressId: job.addressId?.toString(),
          assignedToId: job.assignedToId?.toString(),
          address: job.address
            ? {
                ...job.address,
                id: job.address.id.toString(),
              }
            : null,
        };
      });

      return apiResponse.success({ jobs: formattedJobs }, Status.OK);
    } catch (error: unknown) {
      console.error("Error getting jobs:", error);
      return apiResponse.internalError("Failed to get jobs");
    }
  },

  /**
   * @swagger
   * /api/jobs/{id}:
   *   patch:
   *     tags: [Jobs]
   *     summary: Update job status
   *     description: Updates the status of a job posted by the authenticated customer.
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
   *             type: object
   *             required: [status]
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [OPEN, CLOSED, IN_PROGRESS, COMPLETED]
   *     responses:
   *       200:
   *         description: Job status updated successfully
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async updateJobStatus(
    request: NextRequest,
    id: string 
  ) {
    try {
      const userId = authMiddleware(request);

      if (!userId || typeof userId === "object") {
        return apiResponse.unauthorized();
      }

      const userIdBigInt = BigInt(userId);

      const customer = await prisma.customer.findUnique({
        where: {
          userId: userIdBigInt,
        },
      });

      if (!customer) {
        return apiResponse.unauthorized("Customer not found");
      }

      if (!id || isNaN(Number(id))) {
        return apiResponse.badRequest("Invalid or missing job ID");
      }

      const jobId = BigInt(id);

      const body = await request.json();
      const { status } = body;

      const jobStatusSchema = z.enum(
        ["OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED"],
        {
          message: "Invalid job status. Must be OPEN, CLOSED, IN_PROGRESS, or COMPLETED",
        }
      );

      const result = jobStatusSchema.safeParse(status);

      if (!result.success) {
        return apiResponse.badRequest(result.error.issues[0].message);
      }

      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          createdById: customer.id,
        },
      });

      if (!job) {
        return apiResponse.notFound(
          "Job not found or you are not authorized to update this job",
        );
      }

      const updatedJob = await prisma.job.update({
        where: {
          id: jobId,
        },
        data: {
          status: result.data,
        },
        include: {
          address: true,
        },
      });

      const formattedJob = {
        ...updatedJob,
        id: updatedJob.id.toString(),
        createdById: updatedJob.createdById?.toString(),
        addressId: updatedJob.addressId?.toString(),
        assignedToId: updatedJob.assignedToId?.toString(),
        address: updatedJob.address
          ? {
              ...updatedJob.address,
              id: updatedJob.address.id.toString(),
            }
          : null,
      };

      return apiResponse.success({ job: formattedJob }, Status.OK);
    } catch (error: unknown) {
      console.error("Error updating job:", error);
      return apiResponse.error("Failed to update job", Status.BAD_REQUEST);
    }
  },
};
