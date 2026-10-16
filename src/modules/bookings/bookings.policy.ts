import { ForbiddenError } from "@/shared/errors";

export class BookingsPolicy {
  static assertStudentCanRequest(role: string) {
    if (role !== "student") {
      throw new ForbiddenError("Only students can request room bookings", "ONLY_STUDENTS_CAN_BOOK");
    }
  }

  static assertLandlordCanDecide(hostelLandlordId: string, actorId: string, actorRole: string) {
    if (actorRole === "admin") return;
    if (hostelLandlordId !== actorId) {
      // TC-009: Landlord A requests landlord B's booking by ID -> 403 Forbidden
      throw new ForbiddenError("You are not authorized to manage bookings for this hostel (TC-009)", "FORBIDDEN");
    }
  }

  static assertCanCancel(studentId: string, actorId: string, actorRole: string) {
    if (actorRole === "admin") return;
    if (studentId !== actorId) {
      throw new ForbiddenError("You can only cancel your own booking requests", "FORBIDDEN");
    }
  }
}
