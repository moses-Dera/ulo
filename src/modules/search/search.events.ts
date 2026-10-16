import { logger } from "@/shared/logger";

export function logSearchExecuted(filters: Record<string, unknown>, resultsCount: number) {
  logger.info(`[Search] Query executed with ${resultsCount} results returned`, "Search", {
    filters,
    resultsCount,
  });
}
