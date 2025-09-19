import { z } from "zod";

export const IngredientSchema = z.object({
  title: z.string().min(1),
});
