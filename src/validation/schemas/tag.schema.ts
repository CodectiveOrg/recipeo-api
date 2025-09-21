import { z } from "zod";

import { RecipeTitleSchema } from "@/validation/schemas/recipe.schema";

export const TagSchema = z.object({
  title: RecipeTitleSchema,
});

export const TagArraySchema = z
  .array(TagSchema)
  .refine((tags) => new Set(tags.map((t) => t.title)).size === tags.length, {
    message: "The same tag cannot be used more than once.",
  });
