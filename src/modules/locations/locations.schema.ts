import { z } from "zod";

export const createGateSchema = z.object({
  name: z.string().min(2).max(100),
  latitude: z.number(),
  longitude: z.number(),
});

export type CreateGateInput = z.infer<typeof createGateSchema>;
