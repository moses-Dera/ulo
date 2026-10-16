import { logger } from "@/shared/logger";

export async function runNotificationCleanupJob(): Promise<void> {
  logger.info("[NotificationJob] Periodic cleanup of read notifications (> 90 days)", "NotificationJob");
}
