import { AppError } from "@/shared/errors";

export class LandlordNotFoundError extends AppError {
  constructor(message: string = "Landlord profile not found") {
    super(message, 404, "LANDLORD_NOT_FOUND");
  }
}

export class VerificationPendingError extends AppError {
  constructor(message: string = "Verification is already pending review") {
    super(message, 400, "VERIFICATION_PENDING");
  }
}

export class LandlordNotVerifiedError extends AppError {
  constructor(message: string = "Landlord identity must be verified by admin before listing hostels") {
    super(message, 403, "LANDLORD_NOT_VERIFIED");
  }
}
