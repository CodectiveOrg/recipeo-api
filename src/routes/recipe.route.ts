import { Router } from "express";

import { RecipeController } from "@/controllers/recipe.controller";

import { DatabaseService } from "@/services/database.service";

export function generateRecipeRoutes(databaseService: DatabaseService): Router {
  const router = Router();
  const controller = new RecipeController(databaseService);

  router.get("/featured", controller.getFeatured);
  router.get("/:id", controller.getOneRecipe);

  return router;
}
