import { AppError } from "@/shared/errors";

export class LocationOutOfBoundsError extends AppError {
  constructor(message: string = "Coordinates lie outside the UNN / Nsukka geographic boundaries (TC-024)") {
    super(message, 400, "LOCATION_OUT_OF_BOUNDS");
  }
}
