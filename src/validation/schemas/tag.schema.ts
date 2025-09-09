import { z } from "zod";

export const TagSchema = z.object({
  title: z.string(),
});
