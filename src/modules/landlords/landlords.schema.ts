import { z } from "zod";

export const verificationDocumentSchema = z.object({
  docType: z.enum(["nin", "drivers_license", "deed", "authority_letter"]),
  storageKey: z.string().min(1, "Document storage reference is required"),
});

export type VerificationDocumentInput = z.infer<typeof verificationDocumentSchema>;
