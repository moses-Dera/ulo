import { notificationsRepo } from "./notifications.repo";
import { NotificationsMapper } from "./notifications.mapper";
import { NotificationsPolicy } from "./notifications.policy";
import { NotificationNotFoundError } from "./notifications.errors";
import { logNotificationDispatched } from "./notifications.events";
import { CreateNotificationInput } from "./notifications.schema";

export class NotificationsService {
  async dispatchNotification(data: CreateNotificationInput) {
    const record = await notificationsRepo.create(data);
    logNotificationDispatched(data.userId, data.type);
    return NotificationsMapper.toDto(record);
  }

  async getUserNotifications(userId: string) {
    const list = await notificationsRepo.findByUserId(userId, 30);
    return list.map((item) => NotificationsMapper.toDto(item));
  }

  async markAsRead(notificationId: string, actorId: string, actorRole: string) {
    const item = await notificationsRepo.findById(notificationId);
    if (!item) {
      throw new NotificationNotFoundError();
    }

    NotificationsPolicy.assertOwnership(item.userId, actorId, actorRole);
    const updated = await notificationsRepo.markAsRead(notificationId);
    return NotificationsMapper.toDto(updated!);
  }
}

export const notificationsService = new NotificationsService();
