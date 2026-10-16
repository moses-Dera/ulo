export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  sentAt: Date;
  readAt: Date | null;
  isRead: boolean;
}
