import { AppError } from "@/shared/errors";

export class HostelNotFoundError extends AppError {
  constructor(message: string = "Hostel not found") {
    super(message, 404, "HOSTEL_NOT_FOUND");
  }
}

export class RoomTypeNotFoundError extends AppError {
  constructor(message: string = "Room type not found") {
    super(message, 404, "ROOM_TYPE_NOT_FOUND");
  }
}

export class UnitsBelowOccupiedError extends AppError {
  constructor(message: string = "Total units cannot be reduced below the count of approved bookings plus blocked units (TC-015)") {
    super(message, 409, "UNITS_BELOW_OCCUPIED");
  }
}

export class CannotDeleteRoomWithBookingsError extends AppError {
  constructor(message: string = "Cannot delete a room type with approved bookings. Mark it hidden instead.") {
    super(message, 409, "ROOM_HAS_ACTIVE_BOOKINGS");
  }
}

export class InsufficientPhotosError extends AppError {
  constructor(message: string = "Hostel must have between 4 and 10 photos, with at least one room photo before submitting") {
    super(message, 422, "INSUFFICIENT_PHOTOS");
  }
}
