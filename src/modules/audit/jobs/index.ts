import { logger } from "@/shared/logger";

export async function runAuditArchiveJob(): Promise<void> {
  logger.info("[AuditJob] Periodic archival of historical audit trails (> 1 year)", "AuditJob");
}
