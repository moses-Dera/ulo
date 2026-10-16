import { z } from "zod";

const phoneRegex = /^(?:\+234|0)[789][01]\d{8}$/;

export const updateStudentProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(phoneRegex, "Invalid Nigerian phone number").optional(),
  department: z.string().min(2).max(100).optional(),
});

export const updateLandlordProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(phoneRegex, "Invalid Nigerian phone number").optional(),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateLandlordProfileInput = z.infer<typeof updateLandlordProfileSchema>;
