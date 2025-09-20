import { z } from "zod";

export const IngredientSchema = z.object({
  title: z.string().min(1),
  amount: z
    .number("Ingredient's amount must be a number.")
    .positive("Ingredient's amount must be a positive number.")
    .multipleOf(0.125, "Ingredient's amount must be multiple of ⅛."),
});
