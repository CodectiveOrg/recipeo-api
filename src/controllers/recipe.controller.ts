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
  GetChosenResponseDto,
  GetFeaturedResponseDto,
  GetOneRecipeResponseDto,
  GetPopularResponseDto,
  GetRecentResponseDto,
} from "@/dto/recipe-response.dto";
import { ResponseDto } from "@/dto/response.dto";

import { Featured } from "@/entities/featured";
import { Like } from "@/entities/like";
import { Recipe } from "@/entities/recipe";
import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";

import { fetchUserFromToken } from "@/utils/api.utils";
import { mapToPositionAppended } from "@/utils/mapper.utils";

export class RecipeController {
  private readonly featuredRepo: Repository<Featured>;
  private readonly likeRepo: Repository<Like>;
  private readonly recipeRepo: Repository<Recipe>;
  private readonly userRepo: Repository<User>;

  public constructor(databaseService: DatabaseService) {
    this.featuredRepo = databaseService.dataSource.getRepository(Featured);
    this.likeRepo = databaseService.dataSource.getRepository(Like);
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
    this.userRepo = databaseService.dataSource.getRepository(User);

    this.getOneRecipe = this.getOneRecipe.bind(this);
    this.getFeatured = this.getFeatured.bind(this);
    this.getPopular = this.getPopular.bind(this);
    this.getRecent = this.getRecent.bind(this);
    this.getPopular = this.getPopular.bind(this);
    this.getChosen = this.getChosen.bind(this);
    this.create = this.create.bind(this);
    this.like = this.like.bind(this);
    this.unlike = this.unlike.bind(this);
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
    const params = IdParamsSchema.parse(req.params);

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
      false,
      (qb) => qb.orderBy('"likesCount"', "DESC").limit(3),
    );

    res.json({
      message: "Popular recipes fetched successfully.",
      result: recipes,
    });
  }

  public async getChosen(
    _: Request,
    res: Response<GetChosenResponseDto>,
  ): Promise<void> {
    const chosen = await this.recipeRepo.find({
      where: { isChosen: true },
    });

    res.json({
      message: "Chosen recipes fetches successfully.",
      result: chosen,
    });
  }

  public async getRecent(
    _: Request,
    res: Response<GetRecentResponseDto>,
  ): Promise<void> {
    const recipes = await findManyRecipes(
      this.recipeRepo,
      res.locals.user?.id,
      false,
      (qb) => qb.orderBy("createdAt", "DESC").limit(3),
    );

    res.json({
      message: "Recent recipes fetched successfully.",
      result: recipes,
    });
  }

  public async like(req: Request, res: Response<ResponseDto>): Promise<void> {
    const params = IdParamsSchema.parse(req.params);
    const user = await fetchUserFromToken(res, this.userRepo);

    const like = { user, recipe: { id: params.id } };

    const foundLike = await this.likeRepo.findOne({ where: like });

    if (foundLike) {
      res.status(400).json({
        message: "You already liked this recipe.",
        error: "Bad Request",
      });

      return;
    }

    await this.likeRepo.save(like);

    res.json({ message: "Liked recipe successfully." });
  }

  public async unlike(req: Request, res: Response<ResponseDto>): Promise<void> {
    const params = IdParamsSchema.parse(req.params);
    const user = await fetchUserFromToken(res, this.userRepo);

    const like = { user, recipe: { id: params.id } };

    const foundLike = await this.likeRepo.findOne({ where: like });

    if (!foundLike) {
      res.status(400).json({
        message: "You have not liked this recipe yet.",
        error: "Bad Request",
      });

      return;
    }

    await this.likeRepo.delete(like);

    res.json({ message: "Unliked recipe successfully." });
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

const IdParamsSchema = z.object({
  id: z.coerce.number(),
});
