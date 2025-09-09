import { Repository, SelectQueryBuilder } from "typeorm";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";

import { Like } from "@/entities/like";
import { Recipe } from "@/entities/recipe";

type Qb<Entity extends ObjectLiteral = Recipe> = SelectQueryBuilder<Entity>;

export function createOneRecipeQueryBuilder(
  recipeRepo: Repository<Recipe>,
  currentUserId: number | undefined,
): Qb {
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

export async function findManyRecipes(
  recipeRepo: Repository<Recipe>,
  currentUserId: number | undefined,
  callback: (qb: Qb) => Qb,
): Promise<Recipe[]> {
  let qb = recipeRepo
    .createQueryBuilder("recipe")
    .leftJoinAndSelect("recipe.user", "user")
    .leftJoin("recipe.likes", "like")
    .addSelect("CAST(COUNT(like.id) AS INT)", "likesCount")
    .addSelect(
      isLikedByCurrentUserSelection(currentUserId),
      "isLikedByCurrentUser",
    )
    .groupBy("recipe.id")
    .addGroupBy("user.id");

  qb = callback(qb);

  const { entities, raw } = await qb
    .orderBy('"likesCount"', "DESC")
    .limit(3)
    .getRawAndEntities();

  return entities.map((entity, index) => ({
    ...entity,
    likesCount: raw[index].likesCount,
    isLikedByCurrentUser: raw[index].isLikedByCurrentUser,
  }));
}

export const isLikedByCurrentUserSelection =
  (currentUserId?: number) =>
  (qb: Qb<Like>): Qb<Like> =>
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
  const qb = createOneRecipeQueryBuilder(recipeRepo, currentUserId);

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
