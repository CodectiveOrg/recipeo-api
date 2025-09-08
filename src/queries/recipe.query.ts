import { Repository, SelectQueryBuilder } from "typeorm";

import { Like } from "@/entities/like";
import { Recipe } from "@/entities/recipe";

export function createRecipeQueryBuilder(
  recipeRepo: Repository<Recipe>,
  currentUserId?: number,
): SelectQueryBuilder<Recipe> {
  return recipeRepo
    .createQueryBuilder("recipe")
    .leftJoinAndSelect("recipe.tags", "tags")
    .leftJoinAndSelect("recipe.ingredients", "ingredients")
    .leftJoinAndSelect("recipe.steps", "steps")
    .leftJoinAndSelect("recipe.user", "user")
    .loadRelationCountAndMap("recipe.likesCount", "recipe.likes")
    .addSelect(
      (qb) =>
        qb
          .select("COUNT(like.id) > 0", "isLikedByCurrentUser")
          .from(Like, "like")
          .where("like.recipeId = recipe.id")
          .andWhere("like.userId = :currentUserId", { currentUserId }),
      "isLikedByCurrentUser",
    );
}

export async function findRecipeById(
  recipeRepo: Repository<Recipe>,
  recipeId: number,
  currentUserId?: number,
): Promise<Recipe | null> {
  const qb = createRecipeQueryBuilder(recipeRepo, currentUserId);

  const { entities, raw } = await qb
    .where("recipe.id = :id", { id: recipeId })
    .getRawAndEntities();

  if (!entities[0]) {
    return null;
  }

  return {
    ...entities[0],
    isLikedByCurrentUser: raw[0].isLikedByCurrentUser,
  };
}
