import { z } from "zod";

export const tagImageSchema = z.object({
  tag: z.enum(["exterior", "room", "bathroom", "kitchen_or_other"]),
  isPrimary: z.boolean().optional().default(false),
  position: z.number().int().nonnegative().optional().default(0),
  roomTypeId: z.string().uuid().optional(),
});

export type TagImageInput = z.infer<typeof tagImageSchema>;
