import { eventBus } from "@/shared/events";

export function emitBookingRequested(payload: {
  bookingId: string;
  studentId: string;
  hostelId: string;
  roomTypeId: string;
}) {
  return eventBus.emit({
    type: "BOOKING_REQUESTED",
    payload,
  });
}

export function emitBookingApproved(payload: {
  bookingId: string;
  studentId: string;
  roomTypeId: string;
  landlordId: string;
}) {
  return eventBus.emit({
    type: "BOOKING_APPROVED",
    payload,
  });
}

export function emitBookingRejected(payload: {
  bookingId: string;
  studentId: string;
  reason?: string;
}) {
  return eventBus.emit({
    type: "BOOKING_REJECTED",
    payload,
  });
}

export function emitBookingCancelled(payload: {
  bookingId: string;
  studentId: string;
  roomTypeId: string;
}) {
  return eventBus.emit({
    type: "BOOKING_CANCELLED",
    payload,
  });
}

export function emitBookingExpired(payload: {
  bookingId: string;
  studentId: string;
}) {
  return eventBus.emit({
    type: "BOOKING_EXPIRED",
    payload,
  });
}
