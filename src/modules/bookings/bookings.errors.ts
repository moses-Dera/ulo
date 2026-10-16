import { AppError } from "@/shared/errors";

export class BookingNotFoundError extends AppError {
  constructor(message: string = "Booking request not found") {
    super(message, 404, "BOOKING_NOT_FOUND");
  }
}

export class DuplicateActiveBookingError extends AppError {
  constructor(message: string = "You already have an active (pending or approved) reservation for this room type (TC-007)") {
    super(message, 409, "DUPLICATE_ACTIVE_BOOKING");
  }
}

export class MaxPendingBookingsExceededError extends AppError {
  constructor(message: string = "You have reached the maximum limit of 3 concurrent pending booking requests") {
    super(message, 422, "MAX_PENDING_EXCEEDED");
  }
}

export class RoomFullyBookedError extends AppError {
  constructor(message: string = "This room type is currently fully booked. No vacant units remain (TC-006)") {
    super(message, 409, "ROOM_FULLY_BOOKED");
  }
}

export class AlreadyApprovedInSessionError extends AppError {
  constructor(message: string = "Student already holds an approved booking for this academic session (TC-014)") {
    super(message, 409, "ALREADY_APPROVED_IN_SESSION");
  }
}

export class InvalidBookingStateTransitionError extends AppError {
  constructor(message: string = "Booking is no longer in PENDING status") {
    super(message, 409, "INVALID_STATE_TRANSITION");
  }
}
