import { z } from "zod";

export const createHostelSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters"),
  rules: z.string().optional(),
  zone: z.enum(["Behind Flat", "Hilltop", "Odim Gate", "Green House", "Ofulonu", "Umunkaka"]),
  streetText: z.string().min(5, "Landmark text is required (e.g. Opposite Franco Junction)"),
  exactAddress: z.string().min(5, "Exact street address is required for verified students"),
  nearestGateId: z.string().uuid("Invalid gate identifier").optional(),
  walkTimeBand: z.enum(["under_5_min", "5_to_10_min", "10_to_20_min", "20_plus_min"]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  mapsUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  videoUrl: z.string().url("Must be a valid video walkthrough URL").optional().or(z.literal("")),
  amenityIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateHostelSchema = createHostelSchema.partial();

export const createRoomTypeSchema = z.object({
  label: z.string().min(2, "Room label is required (e.g. Self-Contain)").max(100),
  annualRent: z.number().positive("Annual rent must be greater than 0"),
  totalUnits: z.number().int().positive("Total units must be at least 1"),
  description: z.string().optional(),
});

export const updateRoomTypeSchema = createRoomTypeSchema.partial().extend({
  isHidden: z.boolean().optional(),
});

export const createUnitBlockSchema = z.object({
  roomTypeId: z.string().uuid(),
  unitsBlocked: z.number().int().positive("Must block at least 1 unit"),
  reason: z.string().max(255).optional(),
});

export type CreateHostelInput = z.infer<typeof createHostelSchema>;
export type UpdateHostelInput = z.infer<typeof updateHostelSchema>;
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type CreateUnitBlockInput = z.infer<typeof createUnitBlockSchema>;
