import { z } from "zod";

export const StepSchema = z.object({
  description: z.string().min(1),
});
