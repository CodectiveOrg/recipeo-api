import { Router } from "express";

import multer from "multer";

import { UserController } from "@/controllers/user.controller";

import { authMiddleware, tokenMiddleware } from "@/middlewares/auth.middleware";
import { pictureMiddleware } from "@/middlewares/picture.middleware";

import { DatabaseService } from "@/services/database.service";

export function generateUserRoutes(databaseService: DatabaseService): Router {
  const router = Router();
  const upload = multer();
  const controller = new UserController(databaseService);

  router.patch(
    "/",
    authMiddleware,
    upload.single("picture"),
    pictureMiddleware,
    controller.update,
  );
  router.post("/:targetUserId/follow", authMiddleware, controller.follow);
  router.post("/:targetUserId/unfollow", authMiddleware, controller.unfollow);
  router.get("/:id", tokenMiddleware, controller.getOneUser);

  return router;
}
