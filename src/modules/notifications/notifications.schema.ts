import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.string().min(2).max(100),
  payload: z.record(z.string(), z.unknown()),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
