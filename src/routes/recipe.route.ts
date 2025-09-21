import { Router } from "express";

import multer from "multer";

import { RecipeController } from "@/controllers/recipe.controller";

import { authMiddleware, tokenMiddleware } from "@/middlewares/auth.middleware";
import { pictureMiddleware } from "@/middlewares/picture.middleware";

import { DatabaseService } from "@/services/database.service";

export function generateRecipeRoutes(databaseService: DatabaseService): Router {
  const router = Router();
  const upload = multer();
  const controller = new RecipeController(databaseService);

  router.post(
    "/",
    authMiddleware,
    upload.any(),
    pictureMiddleware,
    controller.create,
  );
  router.get("/featured", controller.getFeatured);
  router.get("/popular", tokenMiddleware, controller.getPopular);
  router.get("/chosen", tokenMiddleware, controller.getChosen);
  router.get("/recent", tokenMiddleware, controller.getRecent);
  router.get("/user/:userId", tokenMiddleware, controller.getUserRecipes);
  router.get(
    "/user/:userId/liked",
    tokenMiddleware,
    controller.getUserLikedRecipes,
  );
  router.get("/search", tokenMiddleware, controller.search);
  router.get("/:id", tokenMiddleware, controller.getOneRecipe);
  router.post("/:id/like", authMiddleware, controller.like);
  router.delete("/:id/like", authMiddleware, controller.unlike);

  return router;
}
