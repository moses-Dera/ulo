import { ForbiddenError } from "@/shared/errors";

export class AuditPolicy {
  static assertCanViewLogs(actorRole: string) {
    if (actorRole !== "admin") {
      throw new ForbiddenError("Only administrators can view platform audit logs");
    }
  }
}
