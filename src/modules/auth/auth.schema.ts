import { z } from "zod";

// Phone normalization regex: Accepts +234XXXXXXXXXX or 080XXXXXXXX etc.
const phoneRegex = /^(?:\+234|0)[789][01]\d{8}$/;

// UNN Registration Number regex: e.g., 2021/245892 or 2022/123456
const unnRegNumberRegex = /^(?:19|20)\d{2}\/\d{5,6}$/;

export const studentRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(phoneRegex, "Invalid Nigerian phone number (+234... or 080...)"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  regNumber: z.string().regex(unnRegNumberRegex, "Invalid UNN Reg Number format (e.g. 2021/245892)"),
  department: z.string().min(2, "Department is required").max(100),
});

export const landlordRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(phoneRegex, "Invalid Nigerian phone number (+234... or 080...)"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type LandlordRegisterInput = z.infer<typeof landlordRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
