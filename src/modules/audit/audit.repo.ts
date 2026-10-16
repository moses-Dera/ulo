import { db } from "@/shared/db";
import { auditLogs, users } from "./db";
import { eq, desc } from "drizzle-orm";
import { CreateAuditLogInput } from "./audit.schema";

export class AuditRepo {
  async record(data: CreateAuditLogInput) {
    const [entry] = await db
      .insert(auditLogs)
      .values({
        actorId: data.actorId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        meta: data.meta ? JSON.stringify(data.meta) : null,
      })
      .returning();

    return entry;
  }

  async listRecentLogs(limit: number = 50) {
    return db
      .select({
        log: auditLogs,
        actor: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }
}

export const auditRepo = new AuditRepo();
