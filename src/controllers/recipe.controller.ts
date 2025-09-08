import { Request, Response } from "express";

import { Repository } from "typeorm";

import { z } from "zod";

import {
  GetFeaturedResponseDto,
  GetOneRecipeResponseDto,
} from "@/dto/recipe-response.dto";

import { Featured } from "@/entities/featured";
import { Like } from "@/entities/like";
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
  }

  public async getOneRecipe(
    req: Request,
    res: Response<GetOneRecipeResponseDto>,
  ): Promise<void> {
    const params = GetOneRecipeParamsSchema.parse(req.params);

    const { entities, raw } = await this.recipeRepo
      .createQueryBuilder("recipe")
      .where("recipe.id = :id", { id: params.id })
      .leftJoinAndSelect("recipe.tags", "tags")
      .leftJoinAndSelect("recipe.ingredients", "ingredients")
      .leftJoinAndSelect("recipe.steps", "steps")
      .leftJoinAndSelect("recipe.user", "user")
      .loadRelationCountAndMap("recipe.likesCount", "recipe.likes")
      .addSelect(
        (qb) =>
          qb
            .select("COUNT(like2.id) > 0", "isLikedByCurrentUser")
            .from(Like, "like2")
            .where("like2.recipeId = recipe.id")
            .andWhere("like2.userId = :currentUserId", {
              currentUserId: res.locals.user?.id,
            }),
        "isLikedByCurrentUser",
      )
      .getRawAndEntities();

    if (!entities[0]) {
      res.status(404).json({
        message: "Recipe not found.",
        error: "Not Found",
      });

      return;
    }

    const recipe = {
      ...entities[0],
      isLikedByCurrentUser: raw[0].isLikedByCurrentUser,
    };

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
}

const GetOneRecipeParamsSchema = z.object({
  id: z.coerce.number(),
});
