import { z } from "zod";

/**
 * Authentication Validation Schemas
 * Italian error messages for better UX
 */

export const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  confirmPassword: z.string(),
  companyName: z.string().min(2, "Il nome dell'azienda deve essere di almeno 2 caratteri"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
