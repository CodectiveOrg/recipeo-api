import { z } from "zod";

export const UsernameSchema = z
  .string("Username must be a string.")
  .trim()
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username must only contain letters, numbers and underline.",
  )
  .min(3, "Username must be more than 3 characters long.")
  .max(32, "Username must be less than 32 characters long.");
