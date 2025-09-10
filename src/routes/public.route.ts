import { Router } from "express";

import { PublicController } from "@/controllers/public.controller";

import { DatabaseService } from "@/services/database.service";

export function generatePublicRoutes(databaseService: DatabaseService): Router {
  const router = Router();
  const controller = new PublicController(databaseService);

  router.get("/picture/user/:filename", controller.getPicture("user"));
  router.get("/picture/recipe/:filename", controller.getPicture("recipe"));
  router.get("/picture/featured/:filename", controller.getPicture("featured"));

  return router;
}
