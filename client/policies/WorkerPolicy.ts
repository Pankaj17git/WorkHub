import { AuthActor } from "@/lib/authActor";

export const WorkerPolicy = {
  isWorker(actor: AuthActor): boolean {
    return actor.role === "WORKER" || actor.worker !== null;
  },

  isVerifiedWorker(actor: AuthActor): boolean {
    return this.isWorker(actor) && (actor.worker?.isVerified ?? false);
  },

  canApplyToJob(actor: AuthActor): boolean {
    return this.isWorker(actor);
  },

  canManageWorkerProfile(actor: AuthActor, targetWorkerId: bigint): boolean {
    if (actor.role === "ADMIN") return true;
    return actor.worker?.id === targetWorkerId;
  },

  canRespondToDirectHire(actor: AuthActor, targetWorkerId: bigint): boolean {
    return actor.worker?.id === targetWorkerId;
  },

  canRespondToTeamInvitation(actor: AuthActor, targetWorkerId: bigint): boolean {
    return actor.worker?.id === targetWorkerId;
  },
};
