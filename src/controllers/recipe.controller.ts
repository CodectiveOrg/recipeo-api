import { Request, Response } from "express";

import { Repository } from "typeorm";

import { z } from "zod";

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
    const params = GetRecipeParamsSchema.parse(req.params);

    const recipe = await this.recipeRepo.findOne({
      where: { id: params.id },
      relations: {
        tags: true,
        ingredients: true,
        steps: true,
        user: true,
      },
    });

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
    const recipes = await this.databaseService.dataSource
      .createQueryBuilder()
      .select("recipe.id", "id")
      .addSelect("recipe.title", "title")
      .addSelect("recipe.description", "description")
      .addSelect("recipe.duration", "duration")
      .addSelect("recipe.picture", "picture")
      .addSelect("recipe.tags", "tags")
      .addSelect("recipe.likes", "likes")
      .addSelect("ROW_NUMBER() OVER (ORDER BY COUNT(likes) DESC)", "rank")
      .getRawMany();

    res.json({
      message: "Popular recipes fetched successfully.",
      result: recipes,
    });
  }
}

const GetRecipeParamsSchema = z.object({
  id: z.coerce.number(),
});
