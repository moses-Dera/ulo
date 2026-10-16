import { eventBus } from "@/shared/events";
import { auditService } from "../audit.service";

export function registerAuditListeners() {
  eventBus.subscribe("USER_REGISTERED", async (event) => {
    await auditService.log({
      actorId: event.payload.userId,
      action: "USER_REGISTERED",
      entityType: "user",
      entityId: event.payload.userId,
      meta: { role: event.payload.role, email: event.payload.email },
    });
  });

  eventBus.subscribe("VERIFICATION_DECIDED", async (event) => {
    await auditService.log({
      action: `VERIFICATION_${event.payload.status.toUpperCase()}`,
      entityType: "landlord",
      entityId: event.payload.landlordId,
      meta: { status: event.payload.status, reason: event.payload.reason },
    });
  });

  eventBus.subscribe("HOSTEL_MODERATED", async (event) => {
    await auditService.log({
      action: `HOSTEL_${event.payload.status.toUpperCase()}`,
      entityType: "hostel",
      entityId: event.payload.hostelId,
      meta: { status: event.payload.status, reason: event.payload.reason },
    });
  });

  eventBus.subscribe("BOOKING_APPROVED", async (event) => {
    await auditService.log({
      actorId: event.payload.landlordId,
      action: "BOOKING_APPROVED",
      entityType: "booking",
      entityId: event.payload.bookingId,
      meta: { roomTypeId: event.payload.roomTypeId, studentId: event.payload.studentId },
    });
  });

  eventBus.subscribe("BOOKING_REJECTED", async (event) => {
    await auditService.log({
      action: "BOOKING_REJECTED",
      entityType: "booking",
      entityId: event.payload.bookingId,
      meta: { studentId: event.payload.studentId, reason: event.payload.reason },
    });
  });
}
