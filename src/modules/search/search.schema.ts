import { z } from "zod";

export const searchHostelsSchema = z.object({
  query: z.string().optional(),
  zone: z
    .enum(["Behind Flat", "Hilltop", "Odim Gate", "Green House", "Ofulonu", "Umunkaka"])
    .optional(),
  minRent: z.coerce.number().nonnegative().optional(),
  maxRent: z.coerce.number().positive().optional(),
  roomType: z.string().optional(),
  gateId: z.string().uuid().optional(),
  maxDistanceM: z.coerce.number().positive().optional(),
  amenityIds: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  sort: z.enum(["price_asc", "price_desc", "distance", "newest"]).optional().default("newest"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(12),
});

export type SearchHostelsInput = z.input<typeof searchHostelsSchema>;
export type SearchHostelsParsed = z.infer<typeof searchHostelsSchema>;
