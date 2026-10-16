import { auditRepo } from "./audit.repo";
import { AuditMapper } from "./audit.mapper";
import { logAuditEntryCreated } from "./audit.events";
import { CreateAuditLogInput } from "./audit.schema";

export class AuditService {
  async log(data: CreateAuditLogInput) {
    const entry = await auditRepo.record(data);
    logAuditEntryCreated(data.action, data.entityType, data.entityId);
    return entry;
  }

  async getRecentLogs(limit: number = 50) {
    const records = await auditRepo.listRecentLogs(limit);
    return records.map((r) => AuditMapper.toDto(r));
  }
}

export const auditService = new AuditService();
