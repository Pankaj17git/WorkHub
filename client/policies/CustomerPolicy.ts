import { AuthActor } from "@/lib/authActor";

export const CustomerPolicy = {
  canCreateJob(actor: AuthActor): boolean {
    return actor.role === "CUSTOMER" || actor.customer !== null;
  },

  canManageJob(actor: AuthActor, jobCustomerId: bigint): boolean {
    if (actor.role === "ADMIN") return true;
    return actor.customer?.id === jobCustomerId;
  },

  canSelectWorkers(actor: AuthActor, jobCustomerId: bigint): boolean {
    if (actor.role === "ADMIN") return true;
    return actor.customer?.id === jobCustomerId;
  },

  canReviewAssignment(actor: AuthActor, assignmentCustomerId: bigint): boolean {
    return actor.customer?.id === assignmentCustomerId;
  },
};
