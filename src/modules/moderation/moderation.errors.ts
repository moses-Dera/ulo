import { AppError } from "@/shared/errors";

export class CannotSuspendLastAdminError extends AppError {
  constructor(message: string = "The last active administrator account cannot be suspended or deactivated (FR-E19)") {
    super(message, 400, "CANNOT_SUSPEND_LAST_ADMIN");
  }
}

export class ReasonRequiredError extends AppError {
  constructor(message: string = "A mandatory rejection or suspension reason must be specified") {
    super(message, 422, "REASON_REQUIRED");
  }
}
