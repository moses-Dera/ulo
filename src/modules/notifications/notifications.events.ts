import { logger } from "@/shared/logger";

export function logNotificationDispatched(userId: string, type: string) {
  logger.info(`[Notification] Dispatched ${type} to user ${userId}`, "Notifications");
}
