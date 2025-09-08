import { Request, Response } from "express";

import { Repository } from "typeorm";

import { z } from "zod";

import { findRecipeById } from "@/queries/recipe.query";

import {
  GetFeaturedResponseDto,
  GetOneRecipeResponseDto,
  GetPopularResponseDto,
  RecipeCreateRecipeResponseDto,
} from "@/dto/recipe-response.dto";
import { ResponseDto } from "@/dto/response.dto";

import { Featured } from "@/entities/featured";
import { Recipe } from "@/entities/recipe";
import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";

import { fetchUserFromToken } from "@/utils/api.utils";

export class RecipeController {
  private readonly recipeRepo: Repository<Recipe>;
  private readonly featuredRepo: Repository<Featured>;
  private readonly userRepo: Repository<User>;

  public constructor(private databaseService: DatabaseService) {
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
    this.featuredRepo = databaseService.dataSource.getRepository(Featured);
    this.userRepo = databaseService.dataSource.getRepository(User);

    this.getOneRecipe = this.getOneRecipe.bind(this);
    this.getFeatured = this.getFeatured.bind(this);
    this.getPopular = this.getPopular.bind(this);
    this.create = this.create.bind(this);
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
      .orderBy("COUNT(likes)", "DESC")
      .getMany();

    res.json({
      message: "Popular recipes fetched successfully.",
      result: recipes,
    });
  }

  public async create(
    req: Request,
    res: Response<RecipeCreateRecipeResponseDto>,
  ): Promise<void> {
    const body = CreateRecipeSchema.parse(req.body);
    const user = await fetchUserFromToken(res, this.userRepo);

    await this.recipeRepo.save({ user, ...body });

    res.status(201).json({
      statusCode: 201,
      message: "Recipe created successfuly.",
    });
  }
}

const GetOneRecipeParamsSchema = z.object({
  id: z.coerce.number(),
});

const RecipeSchema = z.object({});

const StepSchema = z.object({
  id: z.coerce.number(),
  position: z.number().nonnegative(),
  description: z.string().min(1),
  recipe: RecipeSchema,
});

const IngredientSchema = z.object({
  id: z.coerce.number(),
  position: z.number().nonnegative(),
  title: z.string().min(1),
  amount: z.string().nonempty(),
  recipe: RecipeSchema,
});

const TagSchema = z.object({
  id: z.coerce.number(),
  title: z.string(),
  recipe: RecipeSchema,
});

const CreateRecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.number().min(1),
  picture: z.string().nullable(),
  tags: TagSchema,
  Ingredient: IngredientSchema,
  steps: StepSchema,
});
