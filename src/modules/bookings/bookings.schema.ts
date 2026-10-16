import { z } from "zod";

export const requestBookingSchema = z.object({
  roomTypeId: z.string().uuid("Invalid room type identifier"),
  studentNote: z.string().max(500, "Note must be under 500 characters").optional(),
});

export const approveBookingSchema = z.object({
  decisionNote: z.string().max(500).optional(),
});

export const rejectBookingSchema = z.object({
  reason: z.string().min(3, "Mandatory rejection reason required").max(500),
});

export const deferBookingSchema = z.object({
  decisionNote: z.string().min(3, "Mandatory landlord deferral note required").max(500),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type RequestBookingInput = z.infer<typeof requestBookingSchema>;
export type ApproveBookingInput = z.infer<typeof approveBookingSchema>;
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>;
export type DeferBookingInput = z.infer<typeof deferBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
