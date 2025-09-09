import { Request, Response } from "express";

import { Repository } from "typeorm";

import { z } from "zod";

import { findManyRecipes, findRecipeById } from "@/queries/recipe.query";
import { IngredientSchema } from "@/validation/schemas/ingredient.schema";
import {
  RecipeDescriptionSchema,
  RecipeDurationSchema,
  RecipePictureSchema,
  RecipeTitleSchema,
} from "@/validation/schemas/recipe.schema";
import { StepSchema } from "@/validation/schemas/step.schema";
import { TagSchema } from "@/validation/schemas/tag.schema";

import {
  CreateRecipeResponseDto,
  GetFeaturedResponseDto,
  GetOneRecipeResponseDto,
  GetPopularResponseDto,
  GetRecentResponseDto,
} from "@/dto/recipe-response.dto";

import { Featured } from "@/entities/featured";
import { Recipe } from "@/entities/recipe";
import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";

import { fetchUserFromToken } from "@/utils/api.utils";
import { mapToPositionAppended } from "@/utils/mapper.utils";

export class RecipeController {
  private readonly recipeRepo: Repository<Recipe>;
  private readonly featuredRepo: Repository<Featured>;
  private readonly userRepo: Repository<User>;

  public constructor(databaseService: DatabaseService) {
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
    this.featuredRepo = databaseService.dataSource.getRepository(Featured);
    this.userRepo = databaseService.dataSource.getRepository(User);

    this.getOneRecipe = this.getOneRecipe.bind(this);
    this.getFeatured = this.getFeatured.bind(this);
    this.getPopular = this.getPopular.bind(this);
    this.getRecent = this.getRecent.bind(this);
    this.getPopular = this.getPopular.bind(this);
    this.create = this.create.bind(this);
  }

  public async create(
    req: Request,
    res: Response<CreateRecipeResponseDto>,
  ): Promise<void> {
    const body = CreateBodySchema.parse(req.body);
    const user = await fetchUserFromToken(res, this.userRepo);

    const recipe = {
      ...body,
      ingredients: mapToPositionAppended(body.ingredients),
      steps: mapToPositionAppended(body.steps),
      user,
    };

    const savedRecipe = await this.recipeRepo.save(recipe);

    res.status(201).json({
      message: "Recipe created successfully.",
      result: { id: savedRecipe.id },
    });
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
    const recipes = await findManyRecipes(
      this.recipeRepo,
      res.locals.user?.id,
      (qb) => qb.orderBy('"likesCount"', "DESC").limit(3),
    );

    res.json({
      message: "Popular recipes fetched successfully.",
      result: recipes,
    });
  }

  public async getRecent(
    _: Request,
    res: Response<GetRecentResponseDto>,
  ): Promise<void> {
    const recipes = await findManyRecipes(
      this.recipeRepo,
      res.locals.user?.id,
      (qb) => qb.orderBy("createdAt", "DESC").limit(3),
    );

    res.json({
      message: "Recent recipes fetched successfully.",
      result: recipes,
    });
  }
}

const CreateBodySchema = z.object({
  title: RecipeTitleSchema,
  description: RecipeDescriptionSchema,
  duration: RecipeDurationSchema,
  picture: RecipePictureSchema,
  tags: z.array(TagSchema),
  ingredients: z.array(IngredientSchema),
  steps: z.array(StepSchema),
});

const GetOneRecipeParamsSchema = z.object({
  id: z.coerce.number(),
});
