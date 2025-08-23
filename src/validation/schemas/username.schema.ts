import { z } from "zod";

export const UsernameSchema = z
  .string()
  .min(3, "Username must be at least 6 characters long")
  .max(16, "Username must be a maximum of 16 characters long");
