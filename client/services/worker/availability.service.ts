import { prisma } from "@/lib/prisma";

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  reason?: string;
  conflictingAssignmentId?: string;
}

/**
 * Normalizes HH:mm or HH:mm:ss string into total minutes from midnight for exact comparisons
 */
export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(":");
  const hours = parseInt(parts[0] || "0", 10);
  const minutes = parseInt(parts[1] || "0", 10);
  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight to HH:mm string
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export const AvailabilityService = {
  /**
   * Authoritative availability check verifying:
   * 1. Worker active status
   * 2. Active service capability
   * 3. Weekly recurring schedule
   * 4. Date-specific exceptions
   * 5. No overlapping assignments
   */
  async checkWorkerAvailability(
    workerId: bigint,
    scheduledDate: Date | string,
    requestedStartTime: string,
    requestedEndTime: string,
    options?: {
      serviceName?: string;
      bufferMinutes?: number;
      excludeAssignmentId?: bigint;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dbClient?: any;
    }
  ): Promise<AvailabilityCheckResult> {
    const db = options?.dbClient || prisma;
    const buffer = options?.bufferMinutes ?? 30;
    const reqStartMins = timeToMinutes(requestedStartTime);
    const reqEndMins = timeToMinutes(requestedEndTime);

    if (reqStartMins >= reqEndMins) {
      return {
        isAvailable: false,
        reason: "Start time must be earlier than end time",
      };
    }

    const dateObj = typeof scheduledDate === "string" ? new Date(scheduledDate) : scheduledDate;
    const dayOfWeek = dateObj.getUTCDay(); // 0 = Sunday, 6 = Saturday

    const worker = await db.worker.findUnique({
      where: { id: workerId },
      include: {
        user: true,
        services: true,
        availabilities: {
          where: { dayOfWeek },
        },
        availabilityExceptions: {
          where: { exceptionDate: dateObj },
        },
      },
    });

    if (!worker || worker.deletedAt !== null || worker.user.deletedAt !== null || worker.user.status !== "ACTIVE") {
      return {
        isAvailable: false,
        reason: "Worker account is inactive or not found",
      };
    }

    // Check service offering if specified
    if (options?.serviceName) {
      const hasService = worker.services.some(
        (s: { serviceName: string; isActive: boolean }) =>
          s.serviceName.toLowerCase() === options.serviceName?.toLowerCase() && s.isActive
      );
      if (!hasService) {
        return {
          isAvailable: false,
          reason: `Worker does not offer active service: ${options.serviceName}`,
        };
      }
    }

    // Check date exceptions first (overrides regular schedule)
    const exception = worker.availabilityExceptions[0];
    if (exception) {
      if (!exception.isAvailable) {
        return {
          isAvailable: false,
          reason: exception.reason || "Worker is off on this date",
        };
      }
      if (exception.startTime && exception.endTime) {
        const exStartMins = timeToMinutes(exception.startTime);
        const exEndMins = timeToMinutes(exception.endTime);
        if (reqStartMins < exStartMins || reqEndMins > exEndMins) {
          return {
            isAvailable: false,
            reason: `Requested time falls outside worker's exception hours (${exception.startTime} - ${exception.endTime})`,
          };
        }
      }
    } else {
      // Check weekly schedule if exists
      const schedule = worker.availabilities[0];
      if (schedule) {
        if (!schedule.isAvailable) {
          return {
            isAvailable: false,
            reason: "Worker is marked unavailable on this day of the week",
          };
        }
        const schedStartMins = timeToMinutes(schedule.startTime);
        const schedEndMins = timeToMinutes(schedule.endTime);
        if (reqStartMins < schedStartMins || reqEndMins > schedEndMins) {
          return {
            isAvailable: false,
            reason: `Requested time falls outside worker's working hours (${schedule.startTime} - ${schedule.endTime})`,
          };
        }
      }
    }

    // Check existing assignments for overlap on that date
    const activeAssignments = await db.assignment.findMany({
      where: {
        workerId,
        scheduledDate: dateObj,
        status: {
          in: ["ASSIGNED", "CONFIRMED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"],
        },
        ...(options?.excludeAssignmentId
          ? { id: { not: options.excludeAssignmentId } }
          : {}),
      },
    });

    for (const assignment of activeAssignments) {
      const existingStartMins = timeToMinutes(assignment.startTime) - buffer;
      const existingEndMins = timeToMinutes(assignment.endTime) + buffer;

      // Overlap condition with buffer: existingStart < requestedEnd && existingEnd > requestedStart
      if (existingStartMins < reqEndMins && existingEndMins > reqStartMins) {
        return {
          isAvailable: false,
          reason: `Worker has an overlapping assignment (${assignment.startTime} - ${assignment.endTime}) on this date`,
          conflictingAssignmentId: assignment.id.toString(),
        };
      }
    }

    return { isAvailable: true };
  },
};
