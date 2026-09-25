import { AuthActor } from "@/lib/authActor";

export const ConversationPolicy = {
  canAccessConversation(actor: AuthActor, memberUserIds: bigint[]): boolean {
    if (actor.role === "ADMIN") return true;
    return memberUserIds.some((uid) => uid === actor.userId);
  },

  canSendMessage(actor: AuthActor, memberUserIds: bigint[]): boolean {
    return this.canAccessConversation(actor, memberUserIds);
  },
};
