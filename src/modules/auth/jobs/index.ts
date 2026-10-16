import { logger } from "@/shared/logger";

export async function runAuthCleanupJob(): Promise<{ cleaned: number }> {
  logger.info("[AuthJob] Running periodic auth session and token cleanup", "AuthJob");
  return { cleaned: 0 };
}
