import { Router } from "express";

import { RecipeController } from "@/controllers/recipe.controller";

import { tokenMiddleware } from "@/middlewares/auth.middleware";

import { DatabaseService } from "@/services/database.service";

export function generateRecipeRoutes(databaseService: DatabaseService): Router {
  const router = Router();
  const controller = new RecipeController(databaseService);

  router.get("/featured", controller.getFeatured);
  router.patch("/like-and-unlike", tokenMiddleware, controller.likeAndUnlike);
  router.get("/:id", tokenMiddleware, controller.getOneRecipe);

  return router;
}
