import { z } from "zod";

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
});

// Signup form validation schema - Step 1
export const signupStep1Schema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\u0E00-\u0E7F'-]+$/, "Full name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^(\+?[0-9\s\-()]{0,20})?$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
});

// Signup form validation schema - Step 2
export const signupStep2Schema = z.object({
  profession: z
    .string()
    .min(1, "Profession is required")
    .max(100, "Profession must be less than 100 characters"),
  company: z
    .string()
    .min(1, "Company is required")
    .max(100, "Company must be less than 100 characters"),
  salaryRange: z
    .string()
    .min(1, "Salary range is required")
    .max(50, "Salary range must be less than 50 characters"),
  numEmployees: z
    .string()
    .min(1, "Number of employees is required")
    .max(20, "Number of employees must be less than 20 characters"),
});

// Combined signup schema for full form validation
export const signupFullSchema = signupStep1Schema.merge(signupStep2Schema);

// Change password validation schema
const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupStep1FormData = z.infer<typeof signupStep1Schema>;
export type SignupStep2FormData = z.infer<typeof signupStep2Schema>;
export type SignupFullFormData = z.infer<typeof signupFullSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
