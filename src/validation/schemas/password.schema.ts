import { z } from "zod";

export const PasswordSchema = z
  .string("Password must be a string.")
  .min(4, "Password must be more than 4 characters long.")
  .max(32, "Password must be less than 32 characters long.");
