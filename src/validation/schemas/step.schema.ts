import { z } from "zod";

export const StepSchema = z.object({
  description: z
    .string("Description must be a string.")
    .trim()
    .nonempty("Description cannot be empty."),
});
