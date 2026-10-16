import { logger } from "@/shared/logger";

export async function runGateDistanceRecalculationJob(): Promise<void> {
  logger.info("[LocationJob] Periodic recalculation of gate distance caches", "LocationJob");
}
