import { AppError } from "@/shared/errors";

export class UserNotFoundError extends AppError {
  constructor(message: string = "User not found") {
    super(message, 404, "USER_NOT_FOUND");
  }
}

export class CannotAnonymizeLastAdminError extends AppError {
  constructor(message: string = "The last active administrator account cannot be deleted or anonymized (FR-E19)") {
    super(message, 400, "CANNOT_ANONYMIZE_LAST_ADMIN");
  }
}
