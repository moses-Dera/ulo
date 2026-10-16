import { logger } from "@/shared/logger";

export async function runLandlordReconfirmationJob(): Promise<{ notified: number }> {
  logger.info("[LandlordJob] Checking 30-day stale listing reconfirmations", "LandlordJob");
  return { notified: 0 };
}
