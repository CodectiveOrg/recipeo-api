import { Ingredient } from "@/entities/ingredient";
import { Recipe } from "@/entities/recipe";
import { Step } from "@/entities/step";
import { Tag } from "@/entities/tag";

export type SeedRecipeType = Omit<
  Recipe,
  | "isChosen"
  | "tags"
  | "ingredients"
  | "steps"
  | "user"
  | "likes"
  | "featured"
  | "createdAt"
  | "updatedAt"
  | "likesCount"
  | "isLikedByCurrentUser"
> & {
  tags: Omit<Tag, "id" | "recipe">[];
  ingredients: Omit<Ingredient, "id" | "recipe">[];
  steps: Omit<Step, "id" | "recipe">[];
};
