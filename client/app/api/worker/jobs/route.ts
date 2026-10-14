/**
 * /api/worker/jobs  —  Worker's Jobs API
 *
 * GET → Returns all jobs the authenticated worker is involved with:
 *       - Assignments (jobs assigned to the worker via job applications or direct hires)
 *       - Job Applications (jobs the worker has applied to but may not be assigned yet)
 *       - Direct Hire Requests (pending/accepted direct hire requests)
 *
 * Query params:
 *   - status: Filter assignments by status (ASSIGNED, CONFIRMED, ON_THE_WAY, IN_PROGRESS, COMPLETED, CANCELLED)
 *   - type:   Filter by source type (assignments, applications, direct-hires, all). Default: "all"
 */

import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { status as Status } from "@/constants/statusCodes";

export async function GET(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor || !actor.worker) {
      return apiResponse.unauthorized("Only authenticated workers can access this endpoint");
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status"); // e.g. ASSIGNED, IN_PROGRESS, COMPLETED
    const typeFilter = searchParams.get("type") || "all"; // assignments | applications | direct-hires | all

    const workerId = actor.worker.id;

    const result: {
      assignments: unknown[];
      applications: unknown[];
      directHireRequests: unknown[];
    } = {
      assignments: [],
      applications: [],
      directHireRequests: [],
    };

    /* ─── 1. Assignments (jobs actively assigned to this worker) ─── */
    if (typeFilter === "all" || typeFilter === "assignments") {
      const assignmentWhere: Record<string, unknown> = { workerId };
      if (statusFilter) {
        assignmentWhere.status = statusFilter;
      }

      const assignments = await prisma.assignment.findMany({
        where: assignmentWhere,
        include: {
          job: {
            include: {
              address: true,
              customer: {
                include: {
                  user: {
                    select: { name: true, email: true, phone: true, profileImage: true },
                  },
                },
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
              user: {
                select: { name: true, email: true, phone: true, profileImage: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      result.assignments = assignments.map((a) => ({
        id: a.id.toString(),
        type: "assignment",
        jobId: a.jobId?.toString() || null,
        directHireRequestId: a.directHireRequestId?.toString() || null,
        role: a.role,
        status: a.status,
        scheduledDate: a.scheduledDate.toISOString(),
        startTime: a.startTime,
        endTime: a.endTime,
        confirmedAt: a.confirmedAt?.toISOString() || null,
        startedAt: a.startedAt?.toISOString() || null,
        completedAt: a.completedAt?.toISOString() || null,
        cancelledAt: a.cancelledAt?.toISOString() || null,
        cancellationReason: a.cancellationReason,
        createdAt: a.createdAt.toISOString(),
        // Job details (from marketplace job or direct hire)
        job: a.job
          ? {
              id: a.job.id.toString(),
              title: a.job.title,
              description: a.job.description,
              serviceName: a.job.serviceName,
              skills: a.job.skills,
              status: a.job.status,
              minAmount: a.job.minAmount ? Number(a.job.minAmount) : null,
              maxAmount: a.job.maxAmount ? Number(a.job.maxAmount) : null,
              currency: a.job.currency,
              preferredDate: a.job.preferredDate?.toISOString() || null,
              preferredStartTime: a.job.preferredStartTime,
              preferredEndTime: a.job.preferredEndTime,
              address: a.job.address
                ? {
                    address: a.job.address.address,
                    city: a.job.address.city,
                    state: a.job.address.state,
                    country: a.job.address.country,
                  }
                : null,
            }
          : null,
        // Customer info
        customer: {
          name: a.customer.user.name || "Customer",
          email: a.customer.user.email,
          phone: a.customer.user.phone,
          profileImage: a.customer.user.profileImage,
        },
        // Direct hire details if applicable
        directHire: a.directHireRequest
          ? {
              serviceName: a.directHireRequest.serviceName,
              proposedPrice: a.directHireRequest.proposedPrice
                ? Number(a.directHireRequest.proposedPrice)
                : null,
              customerMessage: a.directHireRequest.customerMessage,
              address: a.directHireRequest.address
                ? {
                    address: a.directHireRequest.address.address,
                    city: a.directHireRequest.address.city,
                    state: a.directHireRequest.address.state,
                    country: a.directHireRequest.address.country,
                  }
                : null,
            }
          : null,
      }));
    }

    /* ─── 2. Job Applications (jobs worker applied to) ─── */
    if (typeFilter === "all" || typeFilter === "applications") {
      const applicationWhere: Record<string, unknown> = { workerId };
      if (statusFilter) {
        applicationWhere.status = statusFilter;
      }

      const applications = await prisma.jobApplication.findMany({
        where: applicationWhere,
        include: {
          job: {
            include: {
              address: true,
              customer: {
                include: {
                  user: {
                    select: { name: true, email: true, phone: true, profileImage: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      result.applications = applications.map((app) => ({
        id: app.id.toString(),
        type: "application",
        jobId: app.jobId.toString(),
        status: app.status,
        message: app.message,
        proposedPrice: app.proposedPrice ? Number(app.proposedPrice) : null,
        createdAt: app.createdAt.toISOString(),
        job: {
          id: app.job.id.toString(),
          title: app.job.title,
          description: app.job.description,
          serviceName: app.job.serviceName,
          skills: app.job.skills,
          status: app.job.status,
          minAmount: app.job.minAmount ? Number(app.job.minAmount) : null,
          maxAmount: app.job.maxAmount ? Number(app.job.maxAmount) : null,
          currency: app.job.currency,
          preferredDate: app.job.preferredDate?.toISOString() || null,
          preferredStartTime: app.job.preferredStartTime,
          preferredEndTime: app.job.preferredEndTime,
          address: app.job.address
            ? {
                address: app.job.address.address,
                city: app.job.address.city,
                state: app.job.address.state,
                country: app.job.address.country,
              }
            : null,
        },
        customer: {
          name: app.job.customer.user.name || "Customer",
          email: app.job.customer.user.email,
          phone: app.job.customer.user.phone,
          profileImage: app.job.customer.user.profileImage,
        },
      }));
    }

    /* ─── 3. Direct Hire Requests (pending/accepted offers for the worker) ─── */
    if (typeFilter === "all" || typeFilter === "direct-hires") {
      const dhrWhere: Record<string, unknown> = { workerId };
      if (statusFilter) {
        dhrWhere.status = statusFilter;
      }

      const directHires = await prisma.directHireRequest.findMany({
        where: dhrWhere,
        include: {
          customer: {
            include: {
              user: {
                select: { name: true, email: true, phone: true, profileImage: true },
              },
            },
          },
          address: true,
          assignment: true,
        },
        orderBy: { createdAt: "desc" },
      });

      result.directHireRequests = directHires.map((dhr) => ({
        id: dhr.id.toString(),
        type: "direct-hire",
        status: dhr.status,
        serviceName: dhr.serviceName,
        requestedDate: dhr.requestedDate.toISOString(),
        requestedStartTime: dhr.requestedStartTime,
        requestedEndTime: dhr.requestedEndTime,
        customerMessage: dhr.customerMessage,
        proposedPrice: dhr.proposedPrice ? Number(dhr.proposedPrice) : null,
        expiresAt: dhr.expiresAt.toISOString(),
        createdAt: dhr.createdAt.toISOString(),
        assignmentId: dhr.assignment?.id.toString() || null,
        assignmentStatus: dhr.assignment?.status || null,
        customer: {
          name: dhr.customer.user.name || "Customer",
          email: dhr.customer.user.email,
          phone: dhr.customer.user.phone,
          profileImage: dhr.customer.user.profileImage,
        },
        address: dhr.address
          ? {
              address: dhr.address.address,
              city: dhr.address.city,
              state: dhr.address.state,
              country: dhr.address.country,
            }
          : null,
      }));
    }

    return apiResponse.success(result, Status.OK);
  } catch (error) {
    console.error("Failed to fetch worker jobs:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch worker jobs";
    return apiResponse.internalError(message);
  }
}
