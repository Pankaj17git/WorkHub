import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authMiddleware } from "@/middleware/auth.middleware";
import { status as Status } from "@/constants/statusCodes";
import { apiResponse } from "@/lib/apiResponse";

const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  minAmount: z.number().min(0, "Minimum amount must be non-negative"),
  maxAmount: z.number().min(0, "Maximum amount must be non-negative"),
  currency: z.string().min(1, "Currency is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  status: z.string().default("OPEN"),
  createdBy: z.string().optional(),
});

export const JobController = {
  async createJob(request: NextRequest) {
    try {
      const userId = await authMiddleware(request);
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
        return apiResponse.forbidden("Worker account detected. Only customers can post jobs.");
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
      const result = createJobSchema.safeParse(body);

      if (!result.success) {
        return apiResponse.badRequest(result.error.issues[0].message);
      }

      const { title, description, minAmount, maxAmount, currency, skills, status } = result.data;

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
        },
      });

      const formattedJob = {
        ...job,
        id: job.id.toString(),
        createdById: job.createdById?.toString(),
        addressId: job.addressId?.toString(),
        assignedToId: job.assignedToId?.toString(),
      };

      return apiResponse.success({ job: formattedJob }, Status.OK);
    } catch (error: any) {
      console.error("Error creating job:", error);
      return apiResponse.internalError("Failed to create job");
    }
  },
};
