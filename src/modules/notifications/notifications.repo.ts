import { db } from "@/shared/db";
import { notifications } from "./db";
import { eq, desc } from "drizzle-orm";
import { CreateNotificationInput } from "./notifications.schema";

export class NotificationsRepo {
  async create(data: CreateNotificationInput) {
    const [record] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        type: data.type,
        payload: JSON.stringify(data.payload),
      })
      .returning();

    return record;
  }

  async findByUserId(userId: string, limit: number = 30) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.sentAt))
      .limit(limit);
  }

  async findById(id: string) {
    const [item] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    return item || null;
  }

  async markAsRead(id: string) {
    const [updated] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();

    return updated || null;
  }
}

export const notificationsRepo = new NotificationsRepo();
