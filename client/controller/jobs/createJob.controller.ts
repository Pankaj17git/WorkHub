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
  addressId: z.number()
});

export const JobController = {
  async createJob(request: NextRequest) {
    try {
      const userId = authMiddleware(request);
      if (!userId || typeof userId === "object") {
        return apiResponse.unauthorized();
      }
      console.log("userid_________________", userId)
      const userIdBigInt = BigInt(userId);

      const user = await prisma.user.findUnique({
        where: { id: userIdBigInt },
        include: { roleRef: true, customer: true },
      });
      console.log("user_________________", user)


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

      console.log("customer_________________", customer)


      const body = await request.json();
      
      console.log("body_________________", body)
      const result = createJobSchema.safeParse(body);
      console.log("result_________________", result)


      if (!result.success) {
        return apiResponse.badRequest(result.error.issues[0].message);
      }

      const { title, description, minAmount, maxAmount, currency, skills, status, addressId } = result.data;
      console.log("requestboduy_________________", result.data)

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
          address: { connect: { id: BigInt(addressId) } },
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
};
