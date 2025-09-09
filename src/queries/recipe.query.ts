import { Repository, SelectQueryBuilder } from "typeorm";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";

import { Like } from "@/entities/like";
import { Recipe } from "@/entities/recipe";

type Qb<Entity extends ObjectLiteral = Recipe> = SelectQueryBuilder<Entity>;

export function createRecipeQueryBuilder(
  recipeRepo: Repository<Recipe>,
  currentUserId: number | undefined,
): Qb {
  return recipeRepo
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
}

export function createDetailedRecipeQueryBuilder(
  recipeRepo: Repository<Recipe>,
  currentUserId: number | undefined,
): Qb {
  return createRecipeQueryBuilder(recipeRepo, currentUserId)
    .leftJoinAndSelect("recipe.tags", "tags")
    .leftJoinAndSelect("recipe.ingredients", "ingredients")
    .leftJoinAndSelect("recipe.steps", "steps")
    .addGroupBy("tags.id")
    .addGroupBy("ingredients.id")
    .addGroupBy("steps.id");
}

export const isLikedByCurrentUserSelection =
  (currentUserId?: number) =>
  (qb: Qb<Like>): Qb<Like> =>
    qb
      .select("CAST(COUNT(like.id) AS INT) > 0", "isLikedByCurrentUser")
      .from(Like, "like")
      .where("like.recipeId = recipe.id")
      .andWhere("like.userId = :currentUserId", { currentUserId });

export async function findManyRecipes(
  recipeRepo: Repository<Recipe>,
  currentUserId: number | undefined,
  includeDetails: boolean,
  callback: (qb: Qb) => Qb,
): Promise<Recipe[]> {
  let qb = includeDetails
    ? createDetailedRecipeQueryBuilder(recipeRepo, currentUserId)
    : createRecipeQueryBuilder(recipeRepo, currentUserId);

  qb = callback(qb);

  const { entities, raw } = await qb.getRawAndEntities();

  return entities.map((entity, index) => ({
    ...entity,
    likesCount: raw[index].likesCount,
    isLikedByCurrentUser: raw[index].isLikedByCurrentUser,
  }));
}

export async function findRecipeById(
  recipeRepo: Repository<Recipe>,
  recipeId: number,
  currentUserId: number | undefined,
): Promise<Recipe | null> {
  const recipes = await findManyRecipes(recipeRepo, currentUserId, true, (qb) =>
    qb.where("recipe.id = :id", { id: recipeId }),
  );

  return recipes[0] ?? null;
}
