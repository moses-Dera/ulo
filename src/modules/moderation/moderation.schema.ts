import { z } from "zod";

export const verificationDecisionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const listingDecisionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const suspendUserSchema = z.object({
  reason: z.string().min(3, "Mandatory suspension reason required").max(500),
});

export const reportListingSchema = z.object({
  hostelId: z.string().uuid("Invalid hostel ID"),
  reason: z.string().min(3, "Reason required").max(100),
  note: z.string().max(500).optional(),
});

export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;
export type ListingDecisionInput = z.infer<typeof listingDecisionSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type ReportListingInput = z.infer<typeof reportListingSchema>;
