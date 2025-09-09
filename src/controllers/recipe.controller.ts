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
  GetRecipesResponseDto,
} from "@/dto/recipe-response.dto";

import { Featured } from "@/entities/featured";
import { Recipe } from "@/entities/recipe";

import { DatabaseService } from "@/services/database.service";

export class RecipeController {
  private readonly recipeRepo: Repository<Recipe>;
  private readonly featuredRepo: Repository<Featured>;

  public constructor(databaseService: DatabaseService) {
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
    this.featuredRepo = databaseService.dataSource.getRepository(Featured);

    this.getOneRecipe = this.getOneRecipe.bind(this);
    this.getFeatured = this.getFeatured.bind(this);
    this.getPopular = this.getPopular.bind(this);
    this.getRecent = this.getRecent.bind(this);
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
    const { entities, raw } = await this.recipeRepo
      .createQueryBuilder("recipe")
      .leftJoinAndSelect("recipe.user", "user")
      .leftJoin("recipe.likes", "like")
      .addSelect("CAST(COUNT(like.id) AS INT)", "likesCount")
      .addSelect(
        isLikedByCurrentUserSelection(res.locals.user?.id),
        "isLikedByCurrentUser",
      )
      .groupBy("recipe.id")
      .addGroupBy("user.id")
      .orderBy('"likesCount"', "DESC")
      .limit(3)
      .getRawAndEntities();

    const recipes = entities.map((entity, index) => ({
      ...entity,
      likesCount: raw[index].likesCount,
      isLikedByCurrentUser: raw[index].isLikedByCurrentUser,
    }));

    res.json({
      message: "Popular recipes fetched successfully.",
      result: recipes,
    });
  }

  public async getRecent(
    _: Request,
    res: Response<GetRecipesResponseDto>,
  ): Promise<void> {
    const recentRecipes = await this.recipeRepo.find({
      relations: {
        ingredients: true,
        tags: true,
        user: true,
      },
      order: {
        createdAt: "DESC",
      },
      take: 10,
    });

    res.json({
      message: "Recent recipes fetched successfully.",
      result: recentRecipes,
    });
  }
}

const GetOneRecipeParamsSchema = z.object({
  id: z.coerce.number(),
});
