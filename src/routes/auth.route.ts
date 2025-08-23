import { Router } from "express";

import { AuthController } from "@/controllers/auth.controller";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { DatabaseService } from "@/services/database.service";

export function generateAuthRoutes(databaseService: DatabaseService): Router {
  const router = Router();
  const controller = new AuthController(databaseService);

  router.post("/sign-in", controller.signIn);
  router.post("/sign-up", controller.signUp);
  router.delete("/sign-out", controller.signOut);
  router.get("/verify", authMiddleware, controller.verify);

  return router;
}
