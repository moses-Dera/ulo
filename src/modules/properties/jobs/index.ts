import { logger } from "@/shared/logger";

export async function runPropertiesSyncJob(): Promise<void> {
  logger.info("[PropertiesJob] Running property distance synchronization", "PropertiesJob");
}
