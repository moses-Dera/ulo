import { ForbiddenError } from "@/shared/errors";

export class LocationsPolicy {
  static assertAdmin(role: string) {
    if (role !== "admin") {
      throw new ForbiddenError("Only administrators can manage campus gates and zones");
    }
  }
}
