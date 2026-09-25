import { AuthActor } from "@/lib/authActor";

export type AssignmentAction =
  | "CONFIRM"
  | "START_TRAVEL"
  | "ARRIVE"
  | "START"
  | "COMPLETE"
  | "CANCEL";

export const AssignmentPolicy = {
  canPerformAction(
    actor: AuthActor,
    assignment: { workerId: bigint; customerId: bigint; status: string },
    action: AssignmentAction
  ): boolean {
    if (actor.role === "ADMIN") return true;

    const isWorker = actor.worker?.id === assignment.workerId;
    const isCustomer = actor.customer?.id === assignment.customerId;

    switch (action) {
      case "CONFIRM":
      case "START_TRAVEL":
      case "ARRIVE":
      case "START":
      case "COMPLETE":
        return isWorker;

      case "CANCEL":
        return isWorker || isCustomer;

      default:
        return false;
    }
  },
};
