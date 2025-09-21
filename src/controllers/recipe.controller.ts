import { Request, Response } from "express";

import { Repository } from "typeorm";

import { z } from "zod";

import { IngredientSchema } from "@/validation/schemas/ingredient.schema";
import {
  RecipeDescriptionSchema,
  RecipeDurationSchema,
  RecipeTitleSchema,
} from "@/validation/schemas/recipe.schema";
import { StepSchema } from "@/validation/schemas/step.schema";
import { TagArraySchema } from "@/validation/schemas/tag.schema";

import {
  CreateRecipeResponseDto,
  GetFeaturedResponseDto,
  GetOneRecipeResponseDto,
  PaginatedRecipesResponseDto,
  SearchResponseDto,
} from "@/dto/recipe-response.dto";
import { ResponseDto } from "@/dto/response.dto";

import { Featured } from "@/entities/featured";
import { Like } from "@/entities/like";
import { Recipe } from "@/entities/recipe";
import { User } from "@/entities/user";

import { DatabaseService } from "@/services/database.service";
import { RecipeService } from "@/services/recipe.service";

import { fetchUserFromToken } from "@/utils/api.utils";
import { mapToPositionAppended } from "@/utils/mapper.utils";

export class RecipeController {
  private readonly featuredRepo: Repository<Featured>;
  private readonly likeRepo: Repository<Like>;
  private readonly recipeRepo: Repository<Recipe>;
  private readonly userRepo: Repository<User>;

  private readonly recipeService: RecipeService;

  public constructor(databaseService: DatabaseService) {
    this.featuredRepo = databaseService.dataSource.getRepository(Featured);
    this.likeRepo = databaseService.dataSource.getRepository(Like);
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);
    this.userRepo = databaseService.dataSource.getRepository(User);

    this.recipeService = new RecipeService(databaseService);

    this.create = this.create.bind(this);
    this.getFeatured = this.getFeatured.bind(this);
    this.getPopular = this.getPopular.bind(this);
    this.getChosen = this.getChosen.bind(this);
    this.getRecent = this.getRecent.bind(this);
    this.getUserRecipes = this.getUserRecipes.bind(this);
    this.getUserLikedRecipes = this.getUserLikedRecipes.bind(this);
    this.search = this.search.bind(this);
    this.getOneRecipe = this.getOneRecipe.bind(this);
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

    const recipe = await this.recipeService.findById(
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
    req: Request,
    res: Response<PaginatedRecipesResponseDto>,
  ): Promise<void> {
    const params = PaginatedParamsSchema.parse(req.query);

    const result = await this.recipeService.findMany(
      params.page,
      res.locals.user?.id,
      (qb) => qb.orderBy('"likesCount"', "DESC"),
    );

    res.json({
      message: "Popular recipes fetched successfully.",
      result,
    });
  }

  public async getChosen(
    req: Request,
    res: Response<PaginatedRecipesResponseDto>,
  ): Promise<void> {
    const params = PaginatedParamsSchema.parse(req.query);

    const result = await this.recipeService.findMany(
      params.page,
      res.locals.user?.id,
      (qb) => qb.where("recipe.isChosen = TRUE"),
    );

    res.json({
      message: "Chosen recipes fetched successfully.",
      result,
    });
  }

  public async getRecent(
    req: Request,
    res: Response<PaginatedRecipesResponseDto>,
  ): Promise<void> {
    const params = PaginatedParamsSchema.parse(req.query);

    const result = await this.recipeService.findMany(
      params.page,
      res.locals.user?.id,
      (qb) => qb.orderBy("recipe.createdAt", "DESC"),
    );

    res.json({
      message: "Recent recipes fetched successfully.",
      result,
    });
  }

  public async getUserRecipes(
    req: Request,
    res: Response<PaginatedRecipesResponseDto>,
  ): Promise<void> {
    const { userId } = UserIdParamsSchema.parse(req.params);
    const params = PaginatedParamsSchema.parse(req.query);

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({
        message: "User not found.",
        error: "Not Found",
      });

      return;
    }

    const result = await this.recipeService.findMany(
      params.page,
      res.locals.user?.id,
      (qb) =>
        qb
          .andWhere("recipe.userId = :userId", { userId })
          .orderBy("recipe.createdAt", "DESC"),
    );

    res.json({
      message: "User recipes fetched successfully.",
      result,
    });
  }

  public async getUserLikedRecipes(
    req: Request,
    res: Response<PaginatedRecipesResponseDto>,
  ): Promise<void> {
    const { userId } = UserIdParamsSchema.parse(req.params);
    const params = PaginatedParamsSchema.parse(req.query);

    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({
        message: "User not found.",
        error: "Not Found",
      });

      return;
    }

    const result = await this.recipeService.findMany(
      params.page,
      res.locals.user?.id,
      (qb) => {
        if (userId !== res.locals.user?.id) {
          qb = qb.andWhere("recipe.userId = :userId", { userId });
        }

        const isLikedByCurrentUserQuery = this.recipeService
          .isLikedByCurrentUserSelection(res.locals.user?.id)(qb)
          .getQuery();

        return qb
          .andWhere(`${isLikedByCurrentUserQuery} = True`)
          .orderBy("recipe.createdAt", "DESC");
      },
    );

    res.json({
      message: "User recipes fetched successfully.",
      result,
    });
  }

  public async search(
    req: Request,
    res: Response<SearchResponseDto>,
  ): Promise<void> {
    const params = SearchParamsSchema.parse(req.query);

    const recipes = await this.recipeService.searchMany(
      res.locals.user?.id,
      (qb) => {
        if (params.phrase !== undefined) {
          qb = qb.andWhere(
            "(recipe.title ILIKE :phrase OR recipe.description ILIKE :phrase)",
            { phrase: `%${params.phrase}%` },
          );
        }

        if (params.tag !== undefined) {
          qb = qb
            .innerJoin("recipe.tags", "searchTags")
            .andWhere("searchTags.title ILIKE :tag", {
              tag: `%${params.tag}%`,
            });
        }

        if (params.minDuration !== undefined) {
          qb = qb.andWhere("recipe.duration >= :minDuration", {
            minDuration: params.minDuration,
          });
        }

        if (params.maxDuration !== undefined) {
          qb = qb.andWhere("recipe.duration <= :maxDuration", {
            maxDuration: params.maxDuration,
          });
        }

        return qb.orderBy("recipe.createdAt", "DESC").take(10);
      },
    );

    res.json({
      message: "Searched recipes fetched successfully.",
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
  tags: TagArraySchema,
  ingredients: z.array(IngredientSchema),
  steps: z.array(StepSchema),
});

const IdParamsSchema = z.object({
  id: z.coerce.number(),
});

const UserIdParamsSchema = z.object({
  userId: z.coerce.number(),
});

const PaginatedParamsSchema = z.object({
  page: z.coerce.number().optional(),
});

const SearchParamsSchema = z.object({
  phrase: z.coerce.string().optional(),
  tag: z.coerce.string().optional(),
  minDuration: z.transform((val) => (val === undefined ? val : Number(val))),
  maxDuration: z.transform((val) => (val === undefined ? val : Number(val))),
});
