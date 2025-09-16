import { Repository } from "typeorm";

import { Like } from "@/entities/like";
import { Recipe } from "@/entities/recipe";

import { DatabaseService } from "@/services/database.service";

import { Paginated } from "@/types/paginated.type";
import { Qb } from "@/types/query-builder.type";

export class RecipeService {
  private readonly PAGE_SIZE: number = 10;

  private readonly recipeRepo: Repository<Recipe>;

  public constructor(databaseService: DatabaseService) {
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
  }

  public async searchMany(
    currentUserId: number | undefined,
    callback: (qb: Qb) => Qb,
  ): Promise<Recipe[]> {
    let qb = this.createQueryBuilder(currentUserId).leftJoinAndSelect(
      "recipe.tags",
      "tags",
    );

    qb = callback(qb);

    const { entities, raw } = await qb.getRawAndEntities();
    return this.mergeRawAndEntities(entities, raw);
  }

  public async findMany(
    page: number | undefined,
    currentUserId: number | undefined,
    callback: (qb: Qb) => Qb,
  ): Promise<Paginated<Recipe>> {
    let qb = this.createQueryBuilder(currentUserId);

    qb = callback(qb);

    page = Math.max(1, page ?? 1);

    const totalItems = await qb.getCount();
    const lastPage = Math.ceil(totalItems / this.PAGE_SIZE);

    qb = qb.offset((page - 1) * this.PAGE_SIZE).limit(this.PAGE_SIZE);

    const { entities, raw } = await qb.getRawAndEntities();
    const recipes = this.mergeRawAndEntities(entities, raw);

    return {
      items: recipes,
      currentPage: Math.min(page, lastPage),
      lastPage,
    };
  }

  public async findManyWithDetails(
    currentUserId: number | undefined,
    callback: (qb: Qb) => Qb,
  ): Promise<Recipe[]> {
    let qb = this.createDetailedQueryBuilder(currentUserId);

    qb = callback(qb);

    const { entities, raw } = await qb.getRawAndEntities();
    return this.mergeRawAndEntities(entities, raw);
  }

  public async findById(
    id: number,
    currentUserId: number | undefined,
  ): Promise<Recipe | null> {
    const recipes = await this.findManyWithDetails(currentUserId, (qb) =>
      qb.where("recipe.id = :id", { id }),
    );

    return recipes[0] ?? null;
  }

  private createQueryBuilder(currentUserId: number | undefined): Qb {
    return this.recipeRepo
      .createQueryBuilder("recipe")
      .leftJoinAndSelect("recipe.user", "user")
      .leftJoin("recipe.likes", "like")
      .addSelect(this.likesCountSelection, "likesCount")
      .addSelect(
        this.isLikedByCurrentUserSelection(currentUserId),
        "isLikedByCurrentUser",
      );
  }

  private createDetailedQueryBuilder(currentUserId: number | undefined): Qb {
    return this.createQueryBuilder(currentUserId)
      .leftJoinAndSelect("recipe.tags", "tags")
      .leftJoinAndSelect("recipe.ingredients", "ingredients")
      .leftJoinAndSelect("recipe.steps", "steps");
  }

  private likesCountSelection = (qb: Qb<Like>): Qb<Like> =>
    qb
      .select("CAST(COUNT(like.id) AS INT)", "likesCount")
      .from(Like, "like")
      .where("like.recipeId = recipe.id");

  public isLikedByCurrentUserSelection =
    (currentUserId?: number) =>
    (qb: Qb): Qb<Like> =>
      qb
        .subQuery()
        .select("CAST(COUNT(like.id) AS INT) > 0", "isLikedByCurrentUser")
        .from(Like, "like")
        .where("like.recipeId = recipe.id")
        .andWhere("like.userId = :currentUserId", { currentUserId });

  private mergeRawAndEntities(
    entities: Recipe[],
    raw: { likesCount: number; isLikedByCurrentUser: boolean }[],
  ): Recipe[] {
    return entities.map((entity, index) => ({
      ...entity,
      likesCount: raw[index].likesCount,
      isLikedByCurrentUser: raw[index].isLikedByCurrentUser,
    }));
  }
}
