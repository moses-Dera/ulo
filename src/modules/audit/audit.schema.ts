import { z } from "zod";

export const createAuditLogSchema = z.object({
  actorId: z.string().uuid().optional(),
  action: z.string().min(2).max(100),
  entityType: z.string().min(2).max(100),
  entityId: z.string().min(1).max(100),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
