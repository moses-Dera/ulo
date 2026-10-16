import { NotificationDto } from "./notifications.dto";
import { notifications } from "./db";

type NotificationRow = typeof notifications.$inferSelect;

export class NotificationsMapper {
  static toDto(row: NotificationRow): NotificationDto {
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(row.payload);
    } catch {}

    return {
      id: row.id,
      userId: row.userId,
      type: row.type,
      payload,
      sentAt: row.sentAt,
      readAt: row.readAt,
      isRead: row.readAt !== null,
    };
  }
}
