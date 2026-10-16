import { logger } from "@/shared/logger";

export async function runSearchIndexRefreshJob(): Promise<void> {
  logger.info("[SearchJob] Periodic refresh of search query caches", "SearchJob");
}
