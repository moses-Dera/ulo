import { logger } from "@/shared/logger";

export function logLocationVerificationFlag(hostelId: string, distanceToZoneRef: number) {
  logger.warn(`[LocationFlag] Hostel ${hostelId} coordinates are far (${distanceToZoneRef}m) from declared zone benchmark`, "LocationCheck");
}
