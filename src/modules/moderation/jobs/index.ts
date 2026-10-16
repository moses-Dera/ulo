import { logger } from "@/shared/logger";

export async function runAutoReportReviewJob(): Promise<void> {
  logger.info("[ModerationJob] Periodic scan of reported and auto-hidden listings", "ModerationJob");
}
