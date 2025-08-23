import "dotenv/config";

import { DatabaseService } from "@/services/database.service";

import { validateEnv } from "@/utils/env.utils";

import { Seeder } from "./seeder";

async function main(): Promise<void> {
  validateEnv();

  const databaseService = new DatabaseService();
  const isDatabaseInitialized = await databaseService.init();

  if (!isDatabaseInitialized) {
    return;
  }

  const seeder = new Seeder(databaseService);
  await seeder.seed();
}

main().then();
