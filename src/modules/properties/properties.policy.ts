import { ForbiddenError } from "@/shared/errors";
import { hostels } from "./db";

type HostelRow = typeof hostels.$inferSelect;

export class PropertiesPolicy {
  static assertOwnership(hostel: HostelRow, actorId: string, actorRole: string) {
    if (actorRole === "admin") return;
    if (hostel.landlordId !== actorId) {
      throw new ForbiddenError("You do not have permission to modify this property", "FORBIDDEN");
    }
  }
}
