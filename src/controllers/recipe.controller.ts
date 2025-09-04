import { Request, Response } from "express";

import { Repository } from "typeorm";

import { z } from "zod";

import { RecipeResponseDto } from "@/dto/recipe-response.dto";

import { Recipe } from "@/entities/recipe";

import { DatabaseService } from "@/services/database.service";

export class RecipeController {
  private readonly recipeRepo: Repository<Recipe>;

  public constructor(databaseService: DatabaseService) {
    this.recipeRepo = databaseService.dataSource.getRepository(Recipe);

    this.getOneRecipe = this.getOneRecipe.bind(this);
  }

  public async getOneRecipe(
    req: Request,
    res: Response<RecipeResponseDto>,
  ): Promise<void> {
    const params = GetRecipeParamsSchema.parse(req.params);

    const recipe = await this.recipeRepo.findOne({ where: { id: params.id } });

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
}

const GetRecipeParamsSchema = z.object({
  id: z.coerce.number(),
});
