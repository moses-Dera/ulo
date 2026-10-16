import { ForbiddenError } from "@/shared/errors";

export class UsersPolicy {
  static assertCanModify(targetUserId: string, actorId: string, actorRole: string) {
    if (actorRole === "admin") return;
    if (targetUserId !== actorId) {
      throw new ForbiddenError("You can only modify your own profile");
    }
  }
}
