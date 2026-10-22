import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { status as Status } from "@/constants/statusCodes";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) {
      return apiResponse.unauthorized("Authentication required");
    }

    const { id } = await params;
    const assignmentId = BigInt(id);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        job: {
          include: {
            address: true,
            customer: {
              include: { user: { select: { name: true, email: true, phone: true, profileImage: true } } },
            },
          },
        },
        directHireRequest: {
          include: {
            address: true,
          },
        },
        customer: {
          include: {
            user: { select: { name: true, email: true, phone: true, profileImage: true } },
          },
        },
        worker: {
          include: {
            user: { select: { name: true, email: true, phone: true, profileImage: true } },
          },
        },
      },
    });

    if (!assignment) {
      return apiResponse.notFound("Assignment not found");
    }

    const isCustomer = actor.customer && assignment.customerId === actor.customer.id;
    const isWorker = actor.worker && assignment.workerId === actor.worker.id;
    const isAdmin = actor.role === "ADMIN";

    if (!isCustomer && !isWorker && !isAdmin) {
      return apiResponse.forbidden("You are not authorized to view this assignment");
    }

    return apiResponse.success(
      {
        assignment: {
          id: assignment.id.toString(),
          jobId: assignment.jobId?.toString() || null,
          directHireRequestId: assignment.directHireRequestId?.toString() || null,
          role: assignment.role,
          status: assignment.status,
          scheduledDate: assignment.scheduledDate.toISOString(),
          startTime: assignment.startTime,
          endTime: assignment.endTime,
          startOtp: isCustomer ? assignment.startOtp : null,
          confirmedAt: assignment.confirmedAt?.toISOString() || null,
          onTheWayAt: assignment.onTheWayAt?.toISOString() || null,
          arrivedAt: assignment.arrivedAt?.toISOString() || null,
          startedAt: assignment.startedAt?.toISOString() || null,
          completedAt: assignment.completedAt?.toISOString() || null,
          cancelledAt: assignment.cancelledAt?.toISOString() || null,
          cancellationReason: assignment.cancellationReason,
          job: assignment.job
            ? {
                id: assignment.job.id.toString(),
                title: assignment.job.title,
                description: assignment.job.description,
                serviceName: assignment.job.serviceName,
                minAmount: assignment.job.minAmount ? Number(assignment.job.minAmount) : null,
                maxAmount: assignment.job.maxAmount ? Number(assignment.job.maxAmount) : null,
                address: assignment.job.address,
              }
            : null,
          directHire: assignment.directHireRequest
            ? {
                serviceName: assignment.directHireRequest.serviceName,
                proposedPrice: assignment.directHireRequest.proposedPrice ? Number(assignment.directHireRequest.proposedPrice) : null,
                customerMessage: assignment.directHireRequest.customerMessage,
                address: assignment.directHireRequest.address,
              }
            : null,
          customer: {
            name: assignment.customer.user.name || "Customer",
            phone: assignment.customer.user.phone,
            email: assignment.customer.user.email,
            profileImage: assignment.customer.user.profileImage,
          },
          worker: {
            id: assignment.worker.id.toString(),
            name: assignment.worker.user.name || "Specialist",
            phone: assignment.worker.user.phone,
            email: assignment.worker.user.email,
            profileImage: assignment.worker.user.profileImage,
            headline: assignment.worker.headline,
            isVerified: assignment.worker.isVerified,
            rating: 4.9,
            reviewCount: 24,
          },
        },
      },
      Status.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch assignment";
    return apiResponse.badRequest(message);
  }
}
