import { eventBus } from "@/shared/events";
import { notificationsService } from "../notifications.service";

export function registerNotificationListeners() {
  eventBus.subscribe("VERIFICATION_DECIDED", async (event) => {
    await notificationsService.dispatchNotification({
      userId: event.payload.landlordId,
      type: "VERIFICATION_STATUS_UPDATE",
      payload: {
        title: event.payload.status === "verified" ? "Verification Approved" : "Verification Update",
        message:
          event.payload.status === "verified"
            ? "Your property verification was approved. You can now publish your lodges."
            : `Your verification was not approved: ${event.payload.reason || "Please review requirements."}`,
        status: event.payload.status,
      },
    });
  });

  eventBus.subscribe("BOOKING_REQUESTED", async (event) => {
    await notificationsService.dispatchNotification({
      userId: event.payload.studentId,
      type: "BOOKING_SUBMITTED",
      payload: {
        title: "Room Reservation Submitted",
        message: "Your room reservation request was submitted. The landlord has 72 hours to decide.",
        bookingId: event.payload.bookingId,
      },
    });
  });

  eventBus.subscribe("BOOKING_APPROVED", async (event) => {
    await notificationsService.dispatchNotification({
      userId: event.payload.studentId,
      type: "BOOKING_APPROVED",
      payload: {
        title: "Reservation Approved!",
        message: "The landlord has approved your room request. Contact details and exact address are unlocked.",
        bookingId: event.payload.bookingId,
      },
    });
  });

  eventBus.subscribe("BOOKING_REJECTED", async (event) => {
    await notificationsService.dispatchNotification({
      userId: event.payload.studentId,
      type: "BOOKING_REJECTED",
      payload: {
        title: "Reservation Update",
        message: `Your reservation request was not approved: ${event.payload.reason || "Unit unavailable."}`,
        bookingId: event.payload.bookingId,
      },
    });
  });

  eventBus.subscribe("BOOKING_EXPIRED", async (event) => {
    await notificationsService.dispatchNotification({
      userId: event.payload.studentId,
      type: "BOOKING_EXPIRED",
      payload: {
        title: "Reservation Expired",
        message: "Your pending reservation expired after 72 hours without a landlord response.",
        bookingId: event.payload.bookingId,
      },
    });
  });
}
