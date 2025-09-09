import { Request, Response } from "express";

import { Repository } from "typeorm";

import { z } from "zod";

import {
  findRecipeById,
  isLikedByCurrentUserSelection,
} from "@/queries/recipe.query";

import {
  GetFeaturedResponseDto,
  GetOneRecipeResponseDto,
  GetPopularResponseDto,
} from "@/dto/recipe-response.dto";

import { Featured } from "@/entities/featured";
import { Recipe } from "@/entities/recipe";

import { DatabaseService } from "@/services/database.service";

export class RecipeController {
  private readonly recipeRepo: Repository<Recipe>;
  private readonly featuredRepo: Repository<Featured>;

  public constructor(private databaseService: DatabaseService) {
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
    this.featuredRepo = databaseService.dataSource.getRepository(Featured);

    this.getOneRecipe = this.getOneRecipe.bind(this);
    this.getFeatured = this.getFeatured.bind(this);
    this.getPopular = this.getPopular.bind(this);
  }

  public async getOneRecipe(
    req: Request,
    res: Response<GetOneRecipeResponseDto>,
  ): Promise<void> {
    const params = GetOneRecipeParamsSchema.parse(req.params);

    const recipe = await findRecipeById(
      this.recipeRepo,
      params.id,
      res.locals.user?.id,
    );

    if (!recipe) {
      res.status(404).json({
        message: "Recipe not found.",
        error: "Not Found",
      });

      return;
    }

    res.json({
      message: "Recipe fetched successfully.",
      result: recipe,
    });
  }

  public async getFeatured(
    _: Request,
    res: Response<GetFeaturedResponseDto>,
  ): Promise<void> {
    const featured = await this.featuredRepo.find({
      relations: { recipe: { user: true } },
    });

    res.json({
      message: "Recipe fetched successfully.",
      result: featured,
    });
  }

  public async getPopular(
    _: Request,
    res: Response<GetPopularResponseDto>,
  ): Promise<void> {
    const recipes = await this.recipeRepo
      .createQueryBuilder("recipe")
      .select([
        "recipe.id AS id",
        "recipe.title AS title",
        "recipe.duration AS duration",
        "recipe.picture AS picture",
        `CAST(COUNT(like.id) AS INT) AS "likesCount"`,
        `json_build_object(
          'id', "user"."id",
          'username', "user"."username",
          'picture', "user"."picture"
        ) AS "user"`,
      ])
      .addSelect(
        isLikedByCurrentUserSelection(res.locals.user?.id),
        "isLikedByCurrentUser",
      )
      .leftJoin("recipe.user", "user")
      .leftJoin("recipe.likes", "like")
      .groupBy("recipe.id")
      .addGroupBy("user.id")
      .orderBy(`"likesCount"`, "DESC")
      .limit(10)
      .getRawMany();

    res.json({
      message: "Popular recipes fetched successfully.",
      result: recipes,
    });
  }
}

const GetOneRecipeParamsSchema = z.object({
  id: z.coerce.number(),
});
