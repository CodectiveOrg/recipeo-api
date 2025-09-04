import { Ingredient } from "@/entities/ingredient";
import { Recipe } from "@/entities/recipe";
import { Step } from "@/entities/step";
import { Tag } from "@/entities/tag";

export type SeedRecipeType = Omit<
  Recipe,
  "tags" | "ingredients" | "steps" | "user" | "createdAt" | "updatedAt"
> & {
  tags: Pick<Tag, "title">[];
  ingredients: Pick<Ingredient, "position" | "title" | "amount">[];
  steps: Pick<Step, "position" | "description">[];
};
