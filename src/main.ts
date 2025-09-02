import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import "dotenv/config";
import "reflect-metadata";

import { globalErrorHandler } from "@/handlers/global-error.handler";

import { generateAuthRoutes } from "@/routes/auth.route";
import { generatePublicRoutes } from "@/routes/public.route";
import { generateUserRoutes } from "@/routes/user.route";

import { DatabaseService } from "@/services/database.service";

import { validateEnv } from "@/utils/env.utils";

const PORT = process.env.PORT || 5000;

async function main(): Promise<void> {
  validateEnv();

  const databaseService = new DatabaseService();
  const isDatabaseInitialized = await databaseService.init();

  if (!isDatabaseInitialized) {
    return;
  }

  const app = express();
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(cors({ origin: true, credentials: true }));

  app.use("/api/auth", generateAuthRoutes(databaseService));
  app.use("/api/public", generatePublicRoutes(databaseService));
  app.use("/api/user", generateUserRoutes(databaseService));

  app.use(globalErrorHandler);

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

main().then();
