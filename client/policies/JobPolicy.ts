import { AuthActor } from "@/lib/authActor";

export const JobPolicy = {
  canViewJobDetails(actor: AuthActor | null, job: { customerId: bigint; status: string }): boolean {
    if (job.status === "OPEN" || job.status === "SCHEDULED" || job.status === "IN_PROGRESS") {
      return true; // Public marketplace visibility
    }
    if (!actor) return false;
    if (actor.role === "ADMIN") return true;
    return actor.customer?.id === job.customerId;
  },

  canCancelJob(actor: AuthActor, jobCustomerId: bigint): boolean {
    if (actor.role === "ADMIN") return true;
    return actor.customer?.id === jobCustomerId;
  },

  canAdjustStaffing(actor: AuthActor, jobCustomerId: bigint): boolean {
    if (actor.role === "ADMIN") return true;
    return actor.customer?.id === jobCustomerId;
  },
};
