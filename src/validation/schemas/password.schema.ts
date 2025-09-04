import { z } from "zod";

export const PasswordSchema = z
  .string()
  .min(4, "Password must be at least 4 characters long")
  .max(32, "Password must be a maximum of 32 characters long")
  .regex(/[0-9]/, "Password must contain at least one number");
