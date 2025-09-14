import { Router } from "express";

import { TagController } from "@/controllers/tag.controller";

import { DatabaseService } from "@/services/database.service";

export function generateTagRoutes(databaseService: DatabaseService): Router {
  const router = Router();
  const controller = new TagController(databaseService);

  router.get("/", controller.getAllTags);

  return router;
}
