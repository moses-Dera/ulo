export interface AuditLogDto {
  id: string;
  actorId: string | null;
  actorName?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  meta: Record<string, unknown> | null;
  createdAt: Date;
}
