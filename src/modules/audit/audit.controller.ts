import { NextRequest, NextResponse } from "next/server";
import { auditService } from "./audit.service";
import { requireAuth } from "../auth/auth.policy";
import { AuditPolicy } from "./audit.policy";
import { handleApiError } from "@/shared/errors";

export class AuditController {
  async getRecentLogs(req: NextRequest) {
    try {
      const user = requireAuth(req);
      AuditPolicy.assertCanViewLogs(user.role);

      const logs = await auditService.getRecentLogs(50);
      return NextResponse.json({ success: true, data: logs });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const auditController = new AuditController();
