import { Request, Response } from "express";

import { Repository } from "typeorm";

import { z } from "zod";

import { findRecipeById } from "@/queries/recipe.query";

import {
  GetFeaturedResponseDto,
  GetOneRecipeResponseDto,
  likeUnlikeRessponseDto,
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
    this.likeUnlike = this.likeUnlike.bind(this);
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

  public async likeUnlike(
    req: Request,
    res: Response<likeUnlikeRessponseDto>,
  ): Promise<void> {
    const { id } = likeUnlikeSchema.parse(req.body);

    const recipe = await findRecipeById(
      this.recipeRepo,
      id,
      res.locals.user?.id,
    );

    if (!recipe) {
      res.status(404).json({
        message: "Recipe not found.",
        error: "Not Found",
      });

      return;
    }

    const { isLikedByCurrentUser } = recipe;
    recipe.isLikedByCurrentUser = !isLikedByCurrentUser;

    await this.recipeRepo.save(recipe);

    res.json({
      message: "Recipe updated successfuly.",
      result: recipe,
    });
  }
}

const GetOneRecipeParamsSchema = z.object({
  id: z.coerce.number(),
});

const likeUnlikeSchema = z.object({
  id: z.coerce.number(),
});
