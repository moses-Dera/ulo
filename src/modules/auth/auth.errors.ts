import { AppError } from "@/shared/errors";

export class AuthError extends AppError {
  constructor(message: string, code: string = "AUTH_ERROR", statusCode: number = 401) {
    super(message, statusCode, code);
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(message: string = "User with this email, phone, or reg number already exists") {
    super(message, 409, "USER_ALREADY_EXISTS");
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = "Invalid email or password") {
    super(message, 401, "INVALID_CREDENTIALS");
  }
}

export class AccountSuspendedError extends AppError {
  constructor(message: string = "Your account has been suspended by administration") {
    super(message, 403, "ACCOUNT_SUSPENDED");
  }
}

export class IdentifierBannedError extends AppError {
  constructor(message: string = "This telephone number or identifier is held for administrative review") {
    super(message, 403, "IDENTIFIER_BANNED");
  }
}
