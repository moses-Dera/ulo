import { logger } from "@/shared/logger";

export async function runAccountRetentionJob(): Promise<void> {
  logger.info("[UsersJob] Periodic account data retention and anonymization scan", "UsersJob");
}
