import { ForbiddenError } from "@/shared/errors";

export class NotificationsPolicy {
  static assertOwnership(notificationUserId: string, actorId: string, actorRole: string) {
    if (actorRole === "admin") return;
    if (notificationUserId !== actorId) {
      throw new ForbiddenError("You can only access your own notifications");
    }
  }
}
