import { AuditLogDto } from "./audit.dto";
import { auditLogs, users } from "./db";

type AuditRow = typeof auditLogs.$inferSelect;
type UserRow = typeof users.$inferSelect;

export class AuditMapper {
  static toDto(data: { log: AuditRow; actor?: Partial<UserRow> | null }): AuditLogDto {
    let parsedMeta: Record<string, unknown> | null = null;
    if (data.log.meta) {
      try {
        parsedMeta = JSON.parse(data.log.meta);
      } catch {}
    }

    return {
      id: data.log.id,
      actorId: data.log.actorId,
      actorName: data.actor?.fullName,
      actorEmail: data.actor?.email,
      action: data.log.action,
      entityType: data.log.entityType,
      entityId: data.log.entityId,
      meta: parsedMeta,
      createdAt: data.log.createdAt,
    };
  }
}
