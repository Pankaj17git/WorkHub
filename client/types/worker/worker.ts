import { PrismaClient, Prisma } from "@/generated/prisma/client";

export type WorkerDbClient = PrismaClient | Prisma.TransactionClient;

export interface AvailabilityCheckOptions {
  serviceName?: string;
  bufferMinutes?: number;
  excludeAssignmentId?: bigint;
  dbClient?: WorkerDbClient;
}

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  reason?: string;
  conflictingAssignmentId?: string;
}
