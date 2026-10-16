import { logger } from "@/shared/logger";

export function logAuditEntryCreated(action: string, entityType: string, entityId: string) {
  logger.info(`[Audit] Action recorded: ${action} on ${entityType} [${entityId}]`, "Audit");
}
