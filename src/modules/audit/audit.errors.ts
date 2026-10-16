import { AppError } from "@/shared/errors";

export class AuditError extends AppError {
  constructor(message: string = "Audit operation failed") {
    super(message, 500, "AUDIT_ERROR");
  }
}
