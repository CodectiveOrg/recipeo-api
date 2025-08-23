import { Router } from "express";

import { PublicController } from "@/controllers/public.controller";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { DatabaseService } from "@/services/database.service";

export function generatePublicRoutes(databaseService: DatabaseService): Router {
  const router = Router();
  const controller = new PublicController(databaseService);

  router.get("/hello", authMiddleware, controller.helloToken);
  router.get("/hello/:username", controller.helloParams);

  return router;
}
