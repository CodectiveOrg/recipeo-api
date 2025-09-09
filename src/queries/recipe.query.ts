import { Repository, SelectQueryBuilder } from "typeorm";

import { Like } from "@/entities/like";
import { Recipe } from "@/entities/recipe";

export function createRecipeQueryBuilder(
  recipeRepo: Repository<Recipe>,
  currentUserId: number | undefined,
): SelectQueryBuilder<Recipe> {
  return recipeRepo
    .createQueryBuilder("recipe")
    .leftJoinAndSelect("recipe.tags", "tags")
    .leftJoinAndSelect("recipe.ingredients", "ingredients")
    .leftJoinAndSelect("recipe.steps", "steps")
    .leftJoinAndSelect("recipe.user", "user")
    .addSelect(
      isLikedByCurrentUserSelection(currentUserId),
      "isLikedByCurrentUser",
    );
}

export const isLikedByCurrentUserSelection =
  (currentUserId?: number) =>
  (qb: SelectQueryBuilder<Like>): SelectQueryBuilder<Like> =>
    qb
      .select("CAST(COUNT(like.id) AS INT) > 0", "isLikedByCurrentUser")
      .from(Like, "like")
      .where("like.recipeId = recipe.id")
      .andWhere("like.userId = :currentUserId", { currentUserId });

export async function findRecipeById(
  recipeRepo: Repository<Recipe>,
  recipeId: number,
  currentUserId: number | undefined,
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

export async function findPopularRecipes(
  recipeRepo: Repository<Recipe>,
  currentUserId: number | undefined,
  limit: number,
): Promise<Recipe[]> {
  const qb = recipeRepo
    .createQueryBuilder("recipe")
    .leftJoinAndSelect("recipe.user", "user")
    .leftJoin("recipe.likes", "like")
    .addSelect("CAST(COUNT(like.id) AS INT)", "likesCount")
    .addSelect(
      isLikedByCurrentUserSelection(currentUserId),
      "isLikedByCurrentUser",
    )
    .groupBy("recipe.id")
    .addGroupBy("user.id")
    .orderBy('"likesCount"', "DESC")
    .limit(limit);

  const { entities, raw } = await qb.getRawAndEntities();

  return entities.map((entity, index) => ({
    ...entity,
    likesCount: raw[index].likesCount,
    isLikedByCurrentUser: raw[index].isLikedByCurrentUser,
  }));
}
