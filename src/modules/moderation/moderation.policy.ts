import { ForbiddenError } from "@/shared/errors";

export class ModerationPolicy {
  static assertAdmin(actorRole: string) {
    if (actorRole !== "admin") {
      throw new ForbiddenError("Administrative privilege required for moderation operations", "FORBIDDEN");
    }
  }
}
