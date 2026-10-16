import { logger } from "@/shared/logger";

export async function runOrphanImageCleanupJob(): Promise<{ deleted: number }> {
  logger.info("[MediaJob] Running cleanup of unattached temporary image uploads (> 24h)", "MediaJob");
  return { deleted: 0 };
}
