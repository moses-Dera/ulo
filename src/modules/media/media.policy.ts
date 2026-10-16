import { ForbiddenError } from "@/shared/errors";
import { hostels } from "./db";

export class MediaPolicy {
  static assertCanUpload(hostelLandlordId: string, actorId: string, actorRole: string) {
    if (actorRole === "admin") return;
    if (hostelLandlordId !== actorId) {
      throw new ForbiddenError("You can only upload images to your own hostel", "FORBIDDEN");
    }
  }
}
