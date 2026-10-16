import { logger } from "@/shared/logger";

export function logSuspiciousUpload(filename: string, ip: string, detectedHeader: string) {
  logger.warn(`[Security Alert] Malicious or invalid file upload attempt: ${filename} from ${ip}`, "MediaSecurity", {
    filename,
    ip,
    detectedHeader,
  });
}
