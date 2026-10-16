import { AppError } from "@/shared/errors";

export class NotificationNotFoundError extends AppError {
  constructor(message: string = "Notification not found") {
    super(message, 404, "NOTIFICATION_NOT_FOUND");
  }
}
