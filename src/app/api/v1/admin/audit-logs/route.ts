import { NextRequest } from "next/server";
import { auditController } from "@/modules/audit";

export async function GET(req: NextRequest) {
  return auditController.getRecentLogs(req);
}
