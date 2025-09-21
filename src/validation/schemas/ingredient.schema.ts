import { z } from "zod";

import { RecipeTitleSchema } from "@/validation/schemas/recipe.schema";

export const IngredientSchema = z.object({
  title: RecipeTitleSchema,
});
